using AutoMapper;
using Flowtask.Business.DTOs.Projects;
using Flowtask.Business.Interfaces;
using Flowtask.Business.Services;
using Flowtask.Core.Caching;
using Flowtask.DataAccess.Repositories;
using Flowtask.DataAccess.UnitOfWork;
using Flowtask.EntityLayer.Entities;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;
using Xunit;

namespace Flowtask.UnitTests.Services;

public class ProjectServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IMapper> _mockMapper;
    private readonly Mock<ICacheService> _mockCacheService;
    private readonly Mock<IActivityLogService> _mockActivityLogService;
    private readonly Mock<IGenericRepository<Project>> _mockProjectRepo;
    private readonly Mock<IGenericRepository<ProjectMember>> _mockMemberRepo;

    private readonly ProjectService _projectService;

    public ProjectServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockMapper = new Mock<IMapper>();
        _mockCacheService = new Mock<ICacheService>();
        _mockActivityLogService = new Mock<IActivityLogService>();

        _mockProjectRepo = new Mock<IGenericRepository<Project>>();
        _mockMemberRepo = new Mock<IGenericRepository<ProjectMember>>();

        _mockUnitOfWork.Setup(u => u.Projects).Returns(_mockProjectRepo.Object);
        _mockUnitOfWork.Setup(u => u.ProjectMembers).Returns(_mockMemberRepo.Object);

        _projectService = new ProjectService(
            _mockUnitOfWork.Object,
            _mockMapper.Object,
            _mockCacheService.Object,
            _mockActivityLogService.Object);
    }

    [Fact]
    public async Task CreateAsync_WhenProjectKeyExists_ShouldReturnError()
    {
        // Arrange
        var request = new CreateProjectRequest
        {
            Name = "Flowtask Core",
            Key = "FLW"
        };
        var userId = Guid.NewGuid();

        _mockProjectRepo.Setup(r => r.AnyAsync(It.IsAny<Expression<Func<Project, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _projectService.CreateAsync(request, userId);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("already exists");
    }

    [Fact]
    public async Task DeleteAsync_WhenUserIsNotOwnerNorAdmin_ShouldReturnError()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var anotherUserId = Guid.NewGuid();

        var project = new Project
        {
            Id = projectId,
            Name = "Secret Project",
            Key = "SEC",
            OwnerId = ownerId
        };

        _mockProjectRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Project, bool>>>(), false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);

        // Act
        var result = await _projectService.DeleteAsync(projectId, anotherUserId, isSystemAdmin: false);

        // Assert
        result.Success.Should().BeFalse();
        result.Message.Should().Contain("Only the project owner or a System Admin");
    }
}
