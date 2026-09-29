using AutoMapper;
using Flowtask.Business.DTOs.Users;
using Flowtask.Business.Interfaces;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Results;
using Flowtask.Core.Security;
using Flowtask.Core.Utilities;
using Flowtask.DataAccess.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace Flowtask.Business.Services;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IActivityLogService _activityLogService;

    public UserService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IPasswordHasher passwordHasher,
        IActivityLogService activityLogService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _passwordHasher = passwordHasher;
        _activityLogService = activityLogService;
    }

    public async Task<IDataResult<UserDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.Query()
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

        if (user == null)
        {
            return new ErrorDataResult<UserDto>("User not found.");
        }

        return new SuccessDataResult<UserDto>(_mapper.Map<UserDto>(user));
    }

    public async Task<IDataResult<UserDto>> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Id == userId, asNoTracking: false, cancellationToken: cancellationToken);
        if (user == null)
        {
            return new ErrorDataResult<UserDto>("User not found.");
        }

        user.FullName = request.FullName.Trim();
        user.JobTitle = request.JobTitle?.Trim();
        user.PhoneNumber = request.PhoneNumber?.Trim();
        if (!string.IsNullOrEmpty(request.AvatarUrl))
        {
            user.AvatarUrl = request.AvatarUrl;
        }

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _activityLogService.LogAsync(userId, null, "PROFILE_UPDATED", "User", userId.ToString(), "User updated profile details", cancellationToken: cancellationToken);

        return await GetByIdAsync(userId, cancellationToken);
    }

    public async Task<IResult> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Id == userId, asNoTracking: false, cancellationToken: cancellationToken);
        if (user == null)
        {
            return new ErrorResult("User not found.");
        }

        if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            return new ErrorResult("Current password is incorrect.");
        }

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _activityLogService.LogAsync(userId, null, "PASSWORD_CHANGED", "User", userId.ToString(), "User changed password", cancellationToken: cancellationToken);

        return new SuccessResult("Password changed successfully.");
    }

    public async Task<PagedDataResult<UserDto>> GetUsersAsync(PaginationParams paginationParams, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Users.Query()
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(paginationParams.Search))
        {
            var search = paginationParams.Search.Trim().ToLower();
            query = query.Where(u => u.FullName.ToLower().Contains(search) || u.Email.ToLower().Contains(search));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        query = paginationParams.IsAscending
            ? query.OrderBy(u => u.FullName)
            : query.OrderByDescending(u => u.CreatedAt);

        var users = await query
            .Skip((paginationParams.Page - 1) * paginationParams.PageSize)
            .Take(paginationParams.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<UserDto>>(users);

        return new PagedDataResult<UserDto>(dtos, totalCount, paginationParams.Page, paginationParams.PageSize, "Users retrieved successfully.");
    }
}
