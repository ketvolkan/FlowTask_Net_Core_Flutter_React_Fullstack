using AutoMapper;
using Flowtask.Business.DTOs.Auth;
using Flowtask.Business.Interfaces;
using Flowtask.Core.Caching;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Results;
using Flowtask.Core.Security;
using Flowtask.DataAccess.UnitOfWork;
using Flowtask.EntityLayer.Entities;
using Microsoft.EntityFrameworkCore;

namespace Flowtask.Business.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenHelper _tokenHelper;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IMapper _mapper;
    private readonly ICacheService _cacheService;
    private readonly IActivityLogService _activityLogService;

    public AuthService(
        IUnitOfWork unitOfWork,
        ITokenHelper tokenHelper,
        IPasswordHasher passwordHasher,
        IMapper mapper,
        ICacheService cacheService,
        IActivityLogService activityLogService)
    {
        _unitOfWork = unitOfWork;
        _tokenHelper = tokenHelper;
        _passwordHasher = passwordHasher;
        _mapper = mapper;
        _cacheService = cacheService;
        _activityLogService = activityLogService;
    }

    public async Task<IDataResult<LoginResponse>> LoginAsync(LoginRequest request, string? ipAddress = null, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.Query(asNoTracking: false)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return new ErrorDataResult<LoginResponse>("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            return new ErrorDataResult<LoginResponse>("Your account has been deactivated. Please contact an administrator.");
        }

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToList();

        var token = _tokenHelper.CreateToken(user.Id, user.Email, user.FullName, user.IsSystemAdmin, roles, permissions);

        // Save refresh token
        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = token.RefreshToken,
            JwtId = Guid.NewGuid().ToString(),
            ExpiresAt = token.RefreshTokenExpiration,
            CreatedByIp = ipAddress
        };
        await _unitOfWork.RefreshTokens.AddAsync(refreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Cache user permissions
        await _cacheService.SetAsync(CacheKeys.UserPermissions(user.Id), permissions, TimeSpan.FromMinutes(30), cancellationToken);
        await _cacheService.SetAsync(CacheKeys.UserRoles(user.Id), roles, TimeSpan.FromMinutes(30), cancellationToken);

        await _activityLogService.LogAsync(user.Id, null, "USER_LOGIN", "User", user.Id.ToString(), "User logged in successfully", ipAddress: ipAddress, cancellationToken: cancellationToken);

        var userDto = _mapper.Map<AuthUserDto>(user);

        return new SuccessDataResult<LoginResponse>(new LoginResponse
        {
            AccessToken = token.Token,
            RefreshToken = token.RefreshToken,
            Expiration = token.Expiration,
            User = userDto
        }, "Login successful.");
    }

    public async Task<IDataResult<LoginResponse>> RegisterAsync(RegisterRequest request, string? ipAddress = null, CancellationToken cancellationToken = default)
    {
        var existingUser = await _unitOfWork.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);
        if (existingUser)
        {
            return new ErrorDataResult<LoginResponse>("An account with this email address already exists.");
        }

        var userRole = await _unitOfWork.Roles.FirstOrDefaultAsync(r => r.Name == "User", cancellationToken: cancellationToken);
        if (userRole == null)
        {
            userRole = new Role { Name = "User", Description = "Standard User", IsSystemRole = true };
            await _unitOfWork.Roles.AddAsync(userRole, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        var newUser = new User
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim().ToLower(),
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            JobTitle = request.JobTitle?.Trim(),
            IsActive = true,
            IsSystemAdmin = false
        };

        await _unitOfWork.Users.AddAsync(newUser, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _unitOfWork.UserRoles.AddAsync(new UserRole
        {
            UserId = newUser.Id,
            RoleId = userRole.Id
        }, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var roles = new List<string> { userRole.Name };
        var permissions = new List<string>();

        var token = _tokenHelper.CreateToken(newUser.Id, newUser.Email, newUser.FullName, newUser.IsSystemAdmin, roles, permissions);

        var refreshToken = new RefreshToken
        {
            UserId = newUser.Id,
            Token = token.RefreshToken,
            JwtId = Guid.NewGuid().ToString(),
            ExpiresAt = token.RefreshTokenExpiration,
            CreatedByIp = ipAddress
        };
        await _unitOfWork.RefreshTokens.AddAsync(refreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _activityLogService.LogAsync(newUser.Id, null, "USER_REGISTERED", "User", newUser.Id.ToString(), "User registered a new account", ipAddress: ipAddress, cancellationToken: cancellationToken);

        var userDto = _mapper.Map<AuthUserDto>(newUser);
        userDto.Roles = roles;
        userDto.Permissions = permissions;

        return new SuccessDataResult<LoginResponse>(new LoginResponse
        {
            AccessToken = token.Token,
            RefreshToken = token.RefreshToken,
            Expiration = token.Expiration,
            User = userDto
        }, "Registration successful.");
    }

    public async Task<IDataResult<LoginResponse>> RefreshTokenAsync(RefreshTokenRequest request, string? ipAddress = null, CancellationToken cancellationToken = default)
    {
        var principal = _tokenHelper.GetPrincipalFromExpiredToken(request.AccessToken);
        if (principal == null)
        {
            return new ErrorDataResult<LoginResponse>("Invalid access token.");
        }

        var userId = principal.GetUserId();
        if (!userId.HasValue)
        {
            return new ErrorDataResult<LoginResponse>("Invalid token claims.");
        }

        var savedRefreshToken = await _unitOfWork.RefreshTokens.FirstOrDefaultAsync(
            rt => rt.Token == request.RefreshToken && rt.UserId == userId.Value,
            asNoTracking: false,
            cancellationToken: cancellationToken);

        if (savedRefreshToken == null || !savedRefreshToken.IsActive)
        {
            return new ErrorDataResult<LoginResponse>("Refresh token is invalid or expired.");
        }

        var user = await _unitOfWork.Users.Query(asNoTracking: false)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Id == userId.Value, cancellationToken);

        if (user == null || !user.IsActive)
        {
            return new ErrorDataResult<LoginResponse>("User is inactive or not found.");
        }

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToList();

        var newToken = _tokenHelper.CreateToken(user.Id, user.Email, user.FullName, user.IsSystemAdmin, roles, permissions);

        // Revoke old refresh token (Token rotation)
        savedRefreshToken.RevokedAt = DateTime.UtcNow;
        savedRefreshToken.RevokedByIp = ipAddress;
        savedRefreshToken.ReplacedByToken = newToken.RefreshToken;
        _unitOfWork.RefreshTokens.Update(savedRefreshToken);

        var newRefreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = newToken.RefreshToken,
            JwtId = Guid.NewGuid().ToString(),
            ExpiresAt = newToken.RefreshTokenExpiration,
            CreatedByIp = ipAddress
        };
        await _unitOfWork.RefreshTokens.AddAsync(newRefreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var userDto = _mapper.Map<AuthUserDto>(user);

        return new SuccessDataResult<LoginResponse>(new LoginResponse
        {
            AccessToken = newToken.Token,
            RefreshToken = newToken.RefreshToken,
            Expiration = newToken.Expiration,
            User = userDto
        }, "Token refreshed successfully.");
    }

    public async Task<IResult> LogoutAsync(Guid userId, string? refreshToken = null, CancellationToken cancellationToken = default)
    {
        if (!string.IsNullOrEmpty(refreshToken))
        {
            var token = await _unitOfWork.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken && rt.UserId == userId, asNoTracking: false, cancellationToken: cancellationToken);
            if (token != null)
            {
                token.RevokedAt = DateTime.UtcNow;
                _unitOfWork.RefreshTokens.Update(token);
            }
        }
        else
        {
            var activeTokens = await _unitOfWork.RefreshTokens.GetAsync(rt => rt.UserId == userId && rt.RevokedAt == null, asNoTracking: false, cancellationToken: cancellationToken);
            foreach (var token in activeTokens)
            {
                token.RevokedAt = DateTime.UtcNow;
                _unitOfWork.RefreshTokens.Update(token);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _cacheService.RemoveAsync(CacheKeys.UserPermissions(userId), cancellationToken);
        await _cacheService.RemoveAsync(CacheKeys.UserRoles(userId), cancellationToken);

        return new SuccessResult("Logged out successfully.");
    }

    public async Task<IDataResult<AuthUserDto>> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.Query()
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null)
        {
            return new ErrorDataResult<AuthUserDto>("User not found.");
        }

        var dto = _mapper.Map<AuthUserDto>(user);
        return new SuccessDataResult<AuthUserDto>(dto);
    }
}
