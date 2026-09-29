using Flowtask.Business.DTOs.Projects;
using Flowtask.Business.Interfaces;
using Flowtask.Core.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Flowtask.API.Controllers;

[Authorize]
public class ProjectsController : BaseApiController
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUserProjects([FromQuery] PaginationParams paginationParams, CancellationToken cancellationToken)
    {
        var result = await _projectService.GetUserProjectsAsync(CurrentUserId, paginationParams, IsSystemAdmin, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _projectService.GetByIdAsync(id, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectRequest request, CancellationToken cancellationToken)
    {
        var result = await _projectService.CreateAsync(request, CurrentUserId, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectRequest request, CancellationToken cancellationToken)
    {
        var result = await _projectService.UpdateAsync(id, request, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _projectService.DeleteAsync(id, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleResult(result);
    }

    [HttpPatch("{id:guid}/archive")]
    public async Task<IActionResult> Archive(Guid id, CancellationToken cancellationToken)
    {
        var result = await _projectService.ArchiveAsync(id, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleResult(result);
    }
}
