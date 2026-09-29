using Flowtask.Business.DTOs.Sprints;
using Flowtask.Business.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Flowtask.API.Controllers;

[Authorize]
[Route("api/projects/{projectId:guid}/sprints")]
public class SprintsController : BaseApiController
{
    private readonly ISprintService _sprintService;

    public SprintsController(ISprintService sprintService)
    {
        _sprintService = sprintService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProjectSprints(Guid projectId, CancellationToken cancellationToken)
    {
        var result = await _sprintService.GetProjectSprintsAsync(projectId, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpGet("{sprintId:guid}")]
    public async Task<IActionResult> GetById(Guid projectId, Guid sprintId, CancellationToken cancellationToken)
    {
        var result = await _sprintService.GetByIdAsync(projectId, sprintId, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid projectId, [FromBody] CreateSprintRequest request, CancellationToken cancellationToken)
    {
        var result = await _sprintService.CreateAsync(projectId, request, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpPut("{sprintId:guid}")]
    public async Task<IActionResult> Update(Guid projectId, Guid sprintId, [FromBody] UpdateSprintRequest request, CancellationToken cancellationToken)
    {
        var result = await _sprintService.UpdateAsync(projectId, sprintId, request, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpPatch("{sprintId:guid}/start")]
    public async Task<IActionResult> Start(Guid projectId, Guid sprintId, CancellationToken cancellationToken)
    {
        var result = await _sprintService.StartSprintAsync(projectId, sprintId, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpPatch("{sprintId:guid}/complete")]
    public async Task<IActionResult> Complete(Guid projectId, Guid sprintId, CancellationToken cancellationToken)
    {
        var result = await _sprintService.CompleteSprintAsync(projectId, sprintId, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpDelete("{sprintId:guid}")]
    public async Task<IActionResult> Delete(Guid projectId, Guid sprintId, CancellationToken cancellationToken)
    {
        var result = await _sprintService.DeleteAsync(projectId, sprintId, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleResult(result);
    }
}
