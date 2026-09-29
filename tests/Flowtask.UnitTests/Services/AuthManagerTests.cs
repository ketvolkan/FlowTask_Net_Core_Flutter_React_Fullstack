using System.Linq.Expressions;
using AutoMapper;
using Flowtask.Business.Concrete;
using Flowtask.Business.Mappings;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Security;
using Flowtask.DataAccess.Abstract;
using Flowtask.EntityLayer.DTOs.Auth;
using Flowtask.EntityLayer.Entities;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Flowtask.UnitTests.Services;

public class AuthManagerTests
{
    private readonly Mock<IUserDal> _userDalMock;
    private readonly Mock<IRoleDal> _roleDalMock;
    private readonly Mock<IRefreshTokenDal> _refreshTokenDalMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<ITokenHelper> _tokenHelperMock;
    private readonly IMapper _mapper;
    private readonly AuthManager _authManager;

    public AuthManagerTests()
    {
        _userDalMock = new Mock<IUserDal>();
        _roleDalMock = new Mock<IRoleDal>();
        _refreshTokenDalMock = new Mock<IRefreshTokenDal>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _tokenHelperMock = new Mock<ITokenHelper>();

        var config = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<UserProfile>();
        }, new LoggerFactory());
        _mapper = new Mapper(config);

        _authManager = new AuthManager(
            _userDalMock.Object,
            _roleDalMock.Object,
            _refreshTokenDalMock.Object,
            _passwordHasherMock.Object,
            _tokenHelperMock.Object,
            _mapper);
    }

    [Fact]
    public async Task RegisterAsync_WithNewEmail_ShouldReturnSuccessToken()
    {
        // Arrange
        var request = new UserForRegisterDto
        {
            Email = "newuser@flowtask.com",
            Password = "Password123!",
            FullName = "New User",
            JobTitle = "Engineer"
        };

        _userDalMock.Setup(r => r.GetAsync(It.IsAny<Expression<Func<User, bool>>>(), It.IsAny<string?>(), It.IsAny<bool>(), default))
            .ReturnsAsync((User?)null);

        _roleDalMock.Setup(r => r.GetAsync(It.IsAny<Expression<Func<Role, bool>>>(), It.IsAny<string?>(), It.IsAny<bool>(), default))
            .ReturnsAsync(new Role { Id = Guid.NewGuid(), Name = "Member" });

        _passwordHasherMock.Setup(p => p.HashPassword(It.IsAny<string>()))
            .Returns("hashed_password");

        _tokenHelperMock.Setup(t => t.CreateToken(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<List<string>>(), It.IsAny<List<string>>()))
            .Returns(new AccessToken { Token = "jwt_token_123", RefreshToken = "refresh_token_123", Expiration = DateTime.UtcNow.AddMinutes(60) });

        // Act
        var result = await _authManager.RegisterAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.AccessToken.Should().Be("jwt_token_123");
        result.Data.RefreshToken.Should().Be("refresh_token_123");
        result.Data.User.Email.Should().Be("newuser@flowtask.com");
    }

    [Fact]
    public async Task RegisterAsync_WithExistingEmail_ShouldThrowConflictException()
    {
        // Arrange
        var request = new UserForRegisterDto
        {
            Email = "existing@flowtask.com",
            Password = "Password123!",
            FullName = "Existing User"
        };

        _userDalMock.Setup(r => r.GetAsync(It.IsAny<Expression<Func<User, bool>>>(), It.IsAny<string?>(), It.IsAny<bool>(), default))
            .ReturnsAsync(new User { Id = Guid.NewGuid(), Email = "existing@flowtask.com" });

        // Act & Assert
        var act = async () => await _authManager.RegisterAsync(request);
        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ShouldReturnSuccessToken()
    {
        // Arrange
        var request = new UserForLoginDto
        {
            Email = "john@flowtask.com",
            Password = "Password123!"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "john@flowtask.com",
            FullName = "John Doe",
            PasswordHash = "hashed_pass",
            IsActive = true
        };

        _userDalMock.Setup(r => r.GetAsync(It.IsAny<Expression<Func<User, bool>>>(), It.IsAny<string?>(), It.IsAny<bool>(), default))
            .ReturnsAsync(user);

        _passwordHasherMock.Setup(p => p.VerifyPassword(request.Password, user.PasswordHash))
            .Returns(true);

        _tokenHelperMock.Setup(t => t.CreateToken(user.Id, user.Email, user.FullName, It.IsAny<List<string>>(), It.IsAny<List<string>>()))
            .Returns(new AccessToken { Token = "jwt_access_token", RefreshToken = "jwt_refresh_token", Expiration = DateTime.UtcNow.AddMinutes(60) });

        // Act
        var result = await _authManager.LoginAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Data!.AccessToken.Should().Be("jwt_access_token");
        result.Data.User.Email.Should().Be("john@flowtask.com");
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ShouldThrowUnauthorizedException()
    {
        // Arrange
        var request = new UserForLoginDto
        {
            Email = "john@flowtask.com",
            Password = "WrongPassword!"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "john@flowtask.com",
            PasswordHash = "hashed_pass",
            IsActive = true
        };

        _userDalMock.Setup(r => r.GetAsync(It.IsAny<Expression<Func<User, bool>>>(), It.IsAny<string?>(), It.IsAny<bool>(), default))
            .ReturnsAsync(user);

        _passwordHasherMock.Setup(p => p.VerifyPassword(request.Password, user.PasswordHash))
            .Returns(false);

        // Act & Assert
        var act = async () => await _authManager.LoginAsync(request);
        await act.Should().ThrowAsync<UnauthorizedException>();
    }
}
