using System.Linq.Expressions;
using AutoMapper;
using Flowtask.Business.Abstract;
using Flowtask.Business.Concrete;
using Flowtask.Business.Mappings;
using Flowtask.Core.Exceptions;
using Flowtask.DataAccess.Abstract;
using Flowtask.EntityLayer.DTOs.Projects;
using Flowtask.EntityLayer.Entities;
using Flowtask.EntityLayer.Enums;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Flowtask.UnitTests.Services;

public class ProjectManagerTests
{
    private readonly Mock<IProjectDal> _projectDalMock;
    private readonly Mock<IProjectMemberDal> _projectMemberDalMock;
    private readonly Mock<IUserDal> _userDalMock;
    private readonly Mock<IActivityLogService> _activityLogMock;
    private readonly IMapper _mapper;
    private readonly ProjectManager _projectManager;

    public ProjectManagerTests()
    {
        _projectDalMock = new Mock<IProjectDal>();
        _projectMemberDalMock = new Mock<IProjectMemberDal>();
        _userDalMock = new Mock<IUserDal>();
        _activityLogMock = new Mock<IActivityLogService>();

        var config = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<ProjectProfile>();
        }, new LoggerFactory());
        _mapper = new Mapper(config);

        _projectManager = new ProjectManager(
            _projectDalMock.Object,
            _projectMemberDalMock.Object,
            _userDalMock.Object,
            _mapper,
            _activityLogMock.Object);
    }

    [Fact]
    public async Task CreateProjectAsync_WithValidData_ShouldReturnCreatedProject()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var request = new ProjectCreateDto
        {
            Name = "Core Platform",
            Key = "CP",
            Description = "Core Platform backend"
        };

        _projectDalMock.Setup(r => r.GetAsync(It.IsAny<Expression<Func<Project, bool>>>(), It.IsAny<string?>(), It.IsAny<bool>(), default))
            .ReturnsAsync((Project?)null);

        var adminUser = new User
        {
            Id = userId,
            FullName = "Admin User",
            Email = "admin@flowtask.com",
            IsSystemAdmin = true,
            UserRoles = new List<UserRole>
            {
                new UserRole { Role = new Role { Name = "Admin" } }
            }
        };

        _userDalMock.Setup(r => r.GetAsync(It.IsAny<Expression<Func<User, bool>>>(), It.IsAny<string?>(), It.IsAny<bool>(), default))
            .ReturnsAsync(adminUser);

        _userDalMock.Setup(r => r.GetByIdAsync(userId, It.IsAny<string?>(), It.IsAny<bool>(), default))
            .ReturnsAsync(adminUser);

        // Act
        var result = await _projectManager.CreateProjectAsync(userId, request);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Key.Should().Be("CP");
        result.Data.Name.Should().Be("Core Platform");
        _activityLogMock.Verify(a => a.LogActivityAsync(userId, "CREATE", "Project", It.IsAny<Guid>(), It.IsAny<string?>(), It.IsAny<Guid?>(), It.IsAny<string?>()), Times.Once);
    }

    [Fact]
    public async Task CreateProjectAsync_WithDuplicateKey_ShouldThrowConflictException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var request = new ProjectCreateDto { Name = "Core Platform", Key = "CP" };

        var adminUser = new User
        {
            Id = userId,
            FullName = "Admin User",
            Email = "admin@flowtask.com",
            IsSystemAdmin = true,
            UserRoles = new List<UserRole>
            {
                new UserRole { Role = new Role { Name = "Admin" } }
            }
        };

        _userDalMock.Setup(r => r.GetAsync(It.IsAny<Expression<Func<User, bool>>>(), It.IsAny<string?>(), It.IsAny<bool>(), default))
            .ReturnsAsync(adminUser);

        _projectDalMock.Setup(r => r.GetAsync(It.IsAny<Expression<Func<Project, bool>>>(), It.IsAny<string?>(), It.IsAny<bool>(), default))
            .ReturnsAsync(new Project { Id = Guid.NewGuid(), Key = "CP", Name = "Existing" });

        // Act & Assert
        var act = async () => await _projectManager.CreateProjectAsync(userId, request);
        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task UpdateProjectAsync_ByNonAdminMember_ShouldThrowForbiddenException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var projectId = Guid.NewGuid();
        var request = new ProjectUpdateDto { Name = "New Name", OwnerId = userId };

        var project = new Project
        {
            Id = projectId,
            Name = "Old Name",
            Key = "CP",
            Members = new List<ProjectMember>
            {
                new ProjectMember { UserId = userId, Role = ProjectRoleType.Member }
            }
        };

        _projectDalMock.Setup(r => r.GetAsync(It.IsAny<Expression<Func<Project, bool>>>(), It.IsAny<string?>(), It.IsAny<bool>(), default))
            .ReturnsAsync(project);

        // Act & Assert
        var act = async () => await _projectManager.UpdateProjectAsync(projectId, userId, request);
        await act.Should().ThrowAsync<ForbiddenException>();
    }
}
