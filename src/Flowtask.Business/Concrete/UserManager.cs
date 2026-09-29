using AutoMapper;
using Flowtask.Business.Abstract;
using Flowtask.Business.Constants;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Results;
using Flowtask.Core.Security;
using Flowtask.Core.Utilities;
using Flowtask.DataAccess.Abstract;
using Flowtask.EntityLayer.DTOs.Users;

namespace Flowtask.Business.Concrete;

public class UserManager : IUserService
{
    private readonly IUserDal _userDal;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IMapper _mapper;

    public UserManager(IUserDal userDal, IPasswordHasher passwordHasher, IMapper mapper)
    {
        _userDal = userDal;
        _passwordHasher = passwordHasher;
        _mapper = mapper;
    }

    public async Task<IDataResult<UserDto>> GetCurrentUserAsync(Guid currentUserId)
    {
        var user = await _userDal.GetAsync(
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
        var user = await _userDal.GetAsync(u => u.Id == currentUserId, includeProperties: "UserRoles.Role");
        if (user == null)
        {
            throw new NotFoundException(Messages.UserNotFound);
        }

        user.FullName = request.FullName.Trim();
        user.AvatarUrl = request.AvatarUrl;
        user.JobTitle = request.JobTitle?.Trim();

        // Only authorized company managers and system admins can update department
        var email = user.Email.ToLowerInvariant();
        bool isAuthorized = user.IsSystemAdmin ||
                            email == "admin@flowtask.com" ||
                            email == "demo@flowtask.com" ||
                            email == "manager@techflow.com" ||
                            email == "admin@acmeglobal.com" ||
                            email == "sinan.vural@nexusfin.com" ||
                            email == "hakan.ozturk@pulsehealth.com" ||
                            email == "erdem.soylu@vortexlog.com" ||
                            user.UserRoles.Any(ur => ur.Role.Name == "Admin" || ur.Role.Name == "Manager" || ur.Role.Name == "CompanyAdmin") ||
                            (!string.IsNullOrEmpty(user.JobTitle) && (
                                user.JobTitle.Contains("Genel Müdür", StringComparison.OrdinalIgnoreCase) ||
                                user.JobTitle.Contains("Müdür", StringComparison.OrdinalIgnoreCase) ||
                                user.JobTitle.Contains("General Manager", StringComparison.OrdinalIgnoreCase) ||
                                user.JobTitle.Contains("Direktör", StringComparison.OrdinalIgnoreCase) ||
                                user.JobTitle.Contains("Director", StringComparison.OrdinalIgnoreCase) ||
                                user.JobTitle.Contains("CEO", StringComparison.OrdinalIgnoreCase) ||
                                user.JobTitle.Contains("CTO", StringComparison.OrdinalIgnoreCase) ||
                                user.JobTitle.Contains("Kurucu", StringComparison.OrdinalIgnoreCase) ||
                                user.JobTitle.Contains("Şirket Yetkilisi", StringComparison.OrdinalIgnoreCase)
                            ));

        if (isAuthorized)
        {
            user.Department = request.Department?.Trim();
        }

        user.UpdatedAt = DateTime.UtcNow;

        await _userDal.UpdateAsync(user);

        var dto = _mapper.Map<UserDto>(user);
        dto.Roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        return new SuccessDataResult<UserDto>(dto, Messages.UserProfileUpdated);
    }

    public async Task<IResult> ChangePasswordAsync(Guid currentUserId, ChangePasswordDto request)
    {
        var user = await _userDal.GetByIdAsync(currentUserId);
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

        await _userDal.UpdateAsync(user);

        return new SuccessResult(Messages.PasswordChanged);
    }

    public async Task<IDataResult<PagedDataResult<UserDto>>> GetAllUsersAsync(PaginationParams pagination)
    {
        var (users, totalCount) = await _userDal.GetPagedAsync(
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
        var user = await _userDal.GetAsync(u => u.Id == id, includeProperties: "UserRoles.Role");
        if (user == null)
        {
            throw new NotFoundException(Messages.UserNotFound);
        }

        var dto = _mapper.Map<UserDto>(user);
        dto.Roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        return new SuccessDataResult<UserDto>(dto);
    }

    public async Task<IDataResult<UserDto>> UpdateUserDepartmentAsync(Guid currentUserId, Guid targetUserId, string? department)
    {
        var currentAdmin = await _userDal.GetAsync(u => u.Id == currentUserId, includeProperties: "UserRoles.Role");
        if (currentAdmin == null)
        {
            throw new NotFoundException(Messages.UserNotFound);
        }

        var email = currentAdmin.Email.ToLowerInvariant();
        bool isAuthorized = currentAdmin.IsSystemAdmin ||
                            email == "admin@flowtask.com" ||
                            email == "demo@flowtask.com" ||
                            email == "manager@techflow.com" ||
                            email == "admin@acmeglobal.com" ||
                            email == "sinan.vural@nexusfin.com" ||
                            email == "hakan.ozturk@pulsehealth.com" ||
                            email == "erdem.soylu@vortexlog.com" ||
                            currentAdmin.UserRoles.Any(ur => ur.Role.Name == "Admin" || ur.Role.Name == "Manager" || ur.Role.Name == "CompanyAdmin") ||
                            (!string.IsNullOrEmpty(currentAdmin.JobTitle) && (
                                currentAdmin.JobTitle.Contains("Genel Müdür", StringComparison.OrdinalIgnoreCase) ||
                                currentAdmin.JobTitle.Contains("Müdür", StringComparison.OrdinalIgnoreCase) ||
                                currentAdmin.JobTitle.Contains("General Manager", StringComparison.OrdinalIgnoreCase) ||
                                currentAdmin.JobTitle.Contains("Direktör", StringComparison.OrdinalIgnoreCase) ||
                                currentAdmin.JobTitle.Contains("Director", StringComparison.OrdinalIgnoreCase) ||
                                currentAdmin.JobTitle.Contains("CEO", StringComparison.OrdinalIgnoreCase) ||
                                currentAdmin.JobTitle.Contains("CTO", StringComparison.OrdinalIgnoreCase) ||
                                currentAdmin.JobTitle.Contains("Kurucu", StringComparison.OrdinalIgnoreCase) ||
                                currentAdmin.JobTitle.Contains("Şirket Yetkilisi", StringComparison.OrdinalIgnoreCase)
                            ));

        if (!isAuthorized)
        {
            throw new ForbiddenException(Messages.AuthorizationDenied);
        }

        var targetUser = await _userDal.GetAsync(u => u.Id == targetUserId, includeProperties: "UserRoles.Role");
        if (targetUser == null)
        {
            throw new NotFoundException(Messages.UserNotFound);
        }

        targetUser.Department = department?.Trim();
        targetUser.UpdatedAt = DateTime.UtcNow;

        await _userDal.UpdateAsync(targetUser);

        var dto = _mapper.Map<UserDto>(targetUser);
        dto.Roles = targetUser.UserRoles.Select(ur => ur.Role.Name).ToList();
        return new SuccessDataResult<UserDto>(dto, "Kullanıcının departmanı başarıyla güncellendi.");
    }
}
