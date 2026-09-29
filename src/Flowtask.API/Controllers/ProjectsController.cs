using Flowtask.Business.Abstract;
using Flowtask.Core.Utilities;
using Flowtask.EntityLayer.DTOs.Projects;
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
    public async Task<IActionResult> GetUserProjects([FromQuery] PaginationParams paginationParams)
    {
        var result = await _projectService.GetUserProjectsAsync(CurrentUserId, paginationParams);
        return HandleDataResult(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _projectService.GetProjectByIdAsync(id, CurrentUserId);
        return HandleDataResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProjectCreateDto request)
    {
        var result = await _projectService.CreateProjectAsync(CurrentUserId, request);
        return HandleDataResult(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ProjectUpdateDto request)
    {
        var result = await _projectService.UpdateProjectAsync(id, CurrentUserId, request);
        return HandleDataResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _projectService.DeleteProjectAsync(id, CurrentUserId);
        return HandleResult(result);
    }
}
