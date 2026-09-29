using Flowtask.Business.Abstract;
using Flowtask.EntityLayer.DTOs.Sprints;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Flowtask.API.Controllers;

[Authorize]
public class SprintsController : BaseApiController
{
    private readonly ISprintService _sprintService;

    public SprintsController(ISprintService sprintService)
    {
        _sprintService = sprintService;
    }

    [HttpGet("project/{projectId:guid}")]
    public async Task<IActionResult> GetProjectSprints(Guid projectId)
    {
        var result = await _sprintService.GetProjectSprintsAsync(projectId, CurrentUserId);
        return HandleDataResult(result);
    }

    [HttpGet("{sprintId:guid}")]
    public async Task<IActionResult> GetById(Guid sprintId)
    {
        var result = await _sprintService.GetSprintByIdAsync(sprintId, CurrentUserId);
        return HandleDataResult(result);
    }

    [HttpPost("project/{projectId:guid}")]
    public async Task<IActionResult> Create(Guid projectId, [FromBody] SprintCreateDto request)
    {
        var result = await _sprintService.CreateSprintAsync(projectId, CurrentUserId, request);
        return HandleDataResult(result);
    }

    [HttpPut("{sprintId:guid}")]
    public async Task<IActionResult> Update(Guid sprintId, [FromBody] SprintUpdateDto request)
    {
        var result = await _sprintService.UpdateSprintAsync(sprintId, CurrentUserId, request);
        return HandleDataResult(result);
    }

    [HttpPatch("{sprintId:guid}/start")]
    public async Task<IActionResult> Start(Guid sprintId)
    {
        var result = await _sprintService.StartSprintAsync(sprintId, CurrentUserId);
        return HandleDataResult(result);
    }

    [HttpPatch("{sprintId:guid}/complete")]
    public async Task<IActionResult> Complete(Guid sprintId)
    {
        var result = await _sprintService.CompleteSprintAsync(sprintId, CurrentUserId);
        return HandleDataResult(result);
    }

    [HttpDelete("{sprintId:guid}")]
    public async Task<IActionResult> Delete(Guid sprintId)
    {
        var result = await _sprintService.DeleteSprintAsync(sprintId, CurrentUserId);
        return HandleResult(result);
    }
}
