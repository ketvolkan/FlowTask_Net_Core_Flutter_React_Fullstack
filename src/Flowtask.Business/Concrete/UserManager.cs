using AutoMapper;
using Flowtask.Business.Abstract;
using Flowtask.Business.Constants;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Results;
using Flowtask.Core.Security;
using Flowtask.Core.Utilities;
using Flowtask.DataAccess.UnitOfWork;
using Flowtask.EntityLayer.DTOs.Users;

namespace Flowtask.Business.Concrete;

public class UserManager : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IMapper _mapper;

    public UserManager(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _mapper = mapper;
    }

    public async Task<IDataResult<UserDto>> GetCurrentUserAsync(Guid currentUserId)
    {
        var user = await _unitOfWork.Users.GetAsync(
            u => u.Id == currentUserId,
            includeProperties: "UserRoles.Role");

        if (user == null)
        {
            throw new NotFoundException(Messages.UserNotFound);
        }

        var dto = _mapper.Map<UserDto>(user);
        dto.Roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        return new SuccessDataResult<UserDto>(dto);
    }

    public async Task<IDataResult<UserDto>> UpdateProfileAsync(Guid currentUserId, UpdateProfileDto request)
    {
        var user = await _unitOfWork.Users.GetAsync(u => u.Id == currentUserId, includeProperties: "UserRoles.Role");
        if (user == null)
        {
            throw new NotFoundException(Messages.UserNotFound);
        }

        user.FullName = request.FullName.Trim();
        user.AvatarUrl = request.AvatarUrl;
        user.JobTitle = request.JobTitle?.Trim();
        user.Department = request.Department?.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<UserDto>(user);
        dto.Roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        return new SuccessDataResult<UserDto>(dto, Messages.UserProfileUpdated);
    }

    public async Task<IResult> ChangePasswordAsync(Guid currentUserId, ChangePasswordDto request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(currentUserId);
        if (user == null)
        {
            throw new NotFoundException(Messages.UserNotFound);
        }

        if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            throw new ValidationException(Messages.PasswordError);
        }

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return new SuccessResult(Messages.PasswordChanged);
    }

    public async Task<IDataResult<PagedDataResult<UserDto>>> GetAllUsersAsync(PaginationParams pagination)
    {
        var (users, totalCount) = await _unitOfWork.Users.GetPagedAsync(
            page: pagination.Page,
            pageSize: pagination.PageSize,
            includeProperties: "UserRoles.Role");

        var dtos = users.Select(u =>
        {
            var dto = _mapper.Map<UserDto>(u);
            dto.Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList();
            return dto;
        }).ToList();

        var pagedResult = PagedDataResult<UserDto>.Create(dtos, totalCount, pagination.Page, pagination.PageSize);
        return new SuccessDataResult<PagedDataResult<UserDto>>(pagedResult);
    }

    public async Task<IDataResult<UserDto>> GetUserByIdAsync(Guid id)
    {
        var user = await _unitOfWork.Users.GetAsync(u => u.Id == id, includeProperties: "UserRoles.Role");
        if (user == null)
        {
            throw new NotFoundException(Messages.UserNotFound);
        }

        var dto = _mapper.Map<UserDto>(user);
        dto.Roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        return new SuccessDataResult<UserDto>(dto);
    }
}
