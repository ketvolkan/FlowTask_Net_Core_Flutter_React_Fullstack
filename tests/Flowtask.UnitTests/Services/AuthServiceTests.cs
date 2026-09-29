using AutoMapper;
using Flowtask.Business.DTOs.Auth;
using Flowtask.Business.Interfaces;
using Flowtask.Business.Services;
using Flowtask.Core.Caching;
using Flowtask.Core.Security;
using Flowtask.DataAccess.Repositories;
using Flowtask.DataAccess.UnitOfWork;
using Flowtask.EntityLayer.Entities;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;
using Xunit;

namespace Flowtask.UnitTests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<ITokenHelper> _mockTokenHelper;
    private readonly Mock<IPasswordHasher> _mockPasswordHasher;
    private readonly Mock<IMapper> _mockMapper;
    private readonly Mock<ICacheService> _mockCacheService;
    private readonly Mock<IActivityLogService> _mockActivityLogService;
    private readonly Mock<IGenericRepository<User>> _mockUserRepo;
    private readonly Mock<IGenericRepository<Role>> _mockRoleRepo;
    private readonly Mock<IGenericRepository<UserRole>> _mockUserRoleRepo;
    private readonly Mock<IGenericRepository<RefreshToken>> _mockRefreshTokenRepo;

    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockTokenHelper = new Mock<ITokenHelper>();
        _mockPasswordHasher = new Mock<IPasswordHasher>();
        _mockMapper = new Mock<IMapper>();
        _mockCacheService = new Mock<ICacheService>();
        _mockActivityLogService = new Mock<IActivityLogService>();

        _mockUserRepo = new Mock<IGenericRepository<User>>();
        _mockRoleRepo = new Mock<IGenericRepository<Role>>();
        _mockUserRoleRepo = new Mock<IGenericRepository<UserRole>>();
        _mockRefreshTokenRepo = new Mock<IGenericRepository<RefreshToken>>();

        _mockUnitOfWork.Setup(u => u.Users).Returns(_mockUserRepo.Object);
        _mockUnitOfWork.Setup(u => u.Roles).Returns(_mockRoleRepo.Object);
        _mockUnitOfWork.Setup(u => u.UserRoles).Returns(_mockUserRoleRepo.Object);
        _mockUnitOfWork.Setup(u => u.RefreshTokens).Returns(_mockRefreshTokenRepo.Object);

        _authService = new AuthService(
            _mockUnitOfWork.Object,
            _mockTokenHelper.Object,
            _mockPasswordHasher.Object,
            _mockMapper.Object,
            _mockCacheService.Object,
            _mockActivityLogService.Object);
    }

    [Fact]
    public async Task RegisterAsync_WhenEmailAlreadyExists_ShouldReturnError()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "existing@flowtask.com",
            FullName = "Existing User",
            Password = "Password123*"
        };

        _mockUserRepo.Setup(r => r.AnyAsync(It.IsAny<Expression<Func<User, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("already exists");
    }

    [Fact]
    public async Task RegisterAsync_WhenValid_ShouldCreateUserAndReturnTokens()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "newuser@flowtask.com",
            FullName = "New User",
            Password = "Password123*"
        };

        _mockUserRepo.Setup(r => r.AnyAsync(It.IsAny<Expression<Func<User, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _mockPasswordHasher.Setup(p => p.HashPassword(It.IsAny<string>()))
            .Returns("hashed_pw");

        _mockRoleRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Role, bool>>>(), It.IsAny<bool>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Role { Id = Guid.NewGuid(), Name = "User" });

        _mockTokenHelper.Setup(t => t.CreateToken(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<IEnumerable<string>>(), It.IsAny<IEnumerable<string>>()))
            .Returns(new AccessToken
            {
                Token = "jwt_access_token",
                RefreshToken = "jwt_refresh_token",
                Expiration = DateTime.UtcNow.AddMinutes(60),
                RefreshTokenExpiration = DateTime.UtcNow.AddDays(7)
            });

        _mockMapper.Setup(m => m.Map<AuthUserDto>(It.IsAny<User>()))
            .Returns(new AuthUserDto { Email = request.Email, FullName = request.FullName });

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.AccessToken.Should().Be("jwt_access_token");
        result.Data.RefreshToken.Should().Be("jwt_refresh_token");
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.AtLeastOnce);
    }
}
