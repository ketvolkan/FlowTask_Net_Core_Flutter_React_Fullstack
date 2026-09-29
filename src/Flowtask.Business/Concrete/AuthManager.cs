using AutoMapper;
using Flowtask.Business.Abstract;
using Flowtask.Business.Constants;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Results;
using Flowtask.Core.Security;
using Flowtask.DataAccess.Abstract;
using Flowtask.EntityLayer.DTOs.Auth;
using Flowtask.EntityLayer.Entities;

namespace Flowtask.Business.Concrete;

public class AuthManager : IAuthService
{
    private readonly IUserDal _userDal;
    private readonly IRoleDal _roleDal;
    private readonly IRefreshTokenDal _refreshTokenDal;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenHelper _tokenHelper;
    private readonly IMapper _mapper;

    public AuthManager(
        IUserDal userDal,
        IRoleDal roleDal,
        IRefreshTokenDal refreshTokenDal,
        IPasswordHasher passwordHasher,
        ITokenHelper tokenHelper,
        IMapper mapper)
    {
        _userDal = userDal;
        _roleDal = roleDal;
        _refreshTokenDal = refreshTokenDal;
        _passwordHasher = passwordHasher;
        _tokenHelper = tokenHelper;
        _mapper = mapper;
    }

    public async Task<IDataResult<TokenDto>> RegisterAsync(UserForRegisterDto request)
    {
        var existingUser = await _userDal.GetAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());
        if (existingUser != null)
        {
            throw new ConflictException(Messages.UserAlreadyExists);
        }

        var passwordHash = _passwordHasher.HashPassword(request.Password);

        var user = new User
        {
            Email = request.Email.Trim().ToLower(),
            PasswordHash = passwordHash,
            FullName = request.FullName.Trim(),
            JobTitle = request.JobTitle?.Trim(),
            Department = request.Department?.Trim(),
            IsActive = true
        };

        var memberRole = await _roleDal.GetAsync(r => r.Name == "Member");
        if (memberRole != null)
        {
            user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = memberRole.Id });
        }

        await _userDal.AddAsync(user);

        var roles = user.UserRoles.Select(ur => ur.Role?.Name ?? "Member").ToList();
        var permissions = new List<string>();

        var tokenResponse = _tokenHelper.CreateToken(user.Id, user.Email, user.FullName, roles, permissions);

        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = tokenResponse.RefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        await _refreshTokenDal.AddAsync(refreshToken);

        var authUser = _mapper.Map<AuthUserDto>(user);
        authUser.Roles = roles;
        authUser.Permissions = permissions;

        var result = new TokenDto
        {
            AccessToken = tokenResponse.Token,
            RefreshToken = tokenResponse.RefreshToken,
            ExpiresAt = tokenResponse.Expiration,
            User = authUser
        };

        return new SuccessDataResult<TokenDto>(result, Messages.UserRegistered);
    }

    public async Task<IDataResult<TokenDto>> LoginAsync(UserForLoginDto request)
    {
        var user = await _userDal.GetAsync(
            u => u.Email.ToLower() == request.Email.Trim().ToLower() && u.IsActive,
            includeProperties: "UserRoles.Role.RolePermissions.Permission");

        if (user == null)
        {
            throw new UnauthorizedException(Messages.UserNotFound);
        }

        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedException(Messages.PasswordError);
        }

        var roles = user.UserRoles.Select(ur => ur.Role.Name).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions.Select(rp => rp.Permission.Code))
            .Distinct()
            .ToList();

        var tokenResponse = _tokenHelper.CreateToken(user.Id, user.Email, user.FullName, roles, permissions);

        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = tokenResponse.RefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        await _refreshTokenDal.AddAsync(refreshToken);

        var authUser = _mapper.Map<AuthUserDto>(user);
        authUser.Roles = roles;
        authUser.Permissions = permissions;

        var result = new TokenDto
        {
            AccessToken = tokenResponse.Token,
            RefreshToken = tokenResponse.RefreshToken,
            ExpiresAt = tokenResponse.Expiration,
            User = authUser
        };

        return new SuccessDataResult<TokenDto>(result, Messages.SuccessfulLogin);
    }

    public async Task<IDataResult<TokenDto>> RefreshTokenAsync(RefreshTokenDto request)
    {
        var tokenRecord = await _refreshTokenDal.GetAsync(
            r => r.Token == request.RefreshToken && r.RevokedAt == null,
            includeProperties: "User.UserRoles.Role.RolePermissions.Permission");

        if (tokenRecord == null || tokenRecord.IsExpired)
        {
            throw new UnauthorizedException(Messages.InvalidRefreshToken);
        }

        var user = tokenRecord.User;
        if (user == null || !user.IsActive)
        {
            throw new UnauthorizedException(Messages.UserNotFound);
        }

        tokenRecord.RevokedAt = DateTime.UtcNow;
        await _refreshTokenDal.UpdateAsync(tokenRecord);

        var roles = user.UserRoles.Select(ur => ur.Role.Name).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions.Select(rp => rp.Permission.Code))
            .Distinct()
            .ToList();

        var tokenResponse = _tokenHelper.CreateToken(user.Id, user.Email, user.FullName, roles, permissions);

        var newRefreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = tokenResponse.RefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        await _refreshTokenDal.AddAsync(newRefreshToken);

        var authUser = _mapper.Map<AuthUserDto>(user);
        authUser.Roles = roles;
        authUser.Permissions = permissions;

        var result = new TokenDto
        {
            AccessToken = tokenResponse.Token,
            RefreshToken = tokenResponse.RefreshToken,
            ExpiresAt = tokenResponse.Expiration,
            User = authUser
        };

        return new SuccessDataResult<TokenDto>(result, Messages.TokenRefreshed);
    }

    public async Task<IResult> RevokeTokenAsync(RefreshTokenDto request)
    {
        var tokenRecord = await _refreshTokenDal.GetAsync(r => r.Token == request.RefreshToken);
        if (tokenRecord != null)
        {
            tokenRecord.RevokedAt = DateTime.UtcNow;
            await _refreshTokenDal.UpdateAsync(tokenRecord);
        }

        return new SuccessResult();
    }

    public async Task<IDataResult<AuthUserDto>> GetCurrentUserAsync(Guid userId)
    {
        var user = await _userDal.GetAsync(
            u => u.Id == userId && u.IsActive,
            includeProperties: "UserRoles.Role.RolePermissions.Permission");

        if (user == null)
        {
            throw new NotFoundException(Messages.UserNotFound);
        }

        var roles = user.UserRoles.Select(ur => ur.Role.Name).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions.Select(rp => rp.Permission.Code))
            .Distinct()
            .ToList();

        var authUser = _mapper.Map<AuthUserDto>(user);
        authUser.Roles = roles;
        authUser.Permissions = permissions;

        return new SuccessDataResult<AuthUserDto>(authUser);
    }
}
