using Flowtask.Business.DTOs.Issues;
using Flowtask.Business.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Flowtask.API.Controllers;

[Authorize]
[Route("api/projects/{projectId:guid}/issues")]
public class IssuesController : BaseApiController
{
    private readonly IIssueService _issueService;

    public IssuesController(IIssueService issueService)
    {
        _issueService = issueService;
    }

    [HttpGet]
    public async Task<IActionResult> GetIssues(Guid projectId, [FromQuery] IssueFilterParams filterParams, CancellationToken cancellationToken)
    {
        var result = await _issueService.GetIssuesAsync(projectId, filterParams, CurrentUserId, IsSystemAdmin, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{issueId:guid}")]
    public async Task<IActionResult> GetById(Guid projectId, Guid issueId, CancellationToken cancellationToken)
    {
        var result = await _issueService.GetByIdAsync(projectId, issueId, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid projectId, [FromBody] CreateIssueRequest request, CancellationToken cancellationToken)
    {
        var result = await _issueService.CreateAsync(projectId, request, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpPut("{issueId:guid}")]
    public async Task<IActionResult> Update(Guid projectId, Guid issueId, [FromBody] UpdateIssueRequest request, CancellationToken cancellationToken)
    {
        var result = await _issueService.UpdateAsync(projectId, issueId, request, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpPatch("{issueId:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid projectId, Guid issueId, [FromBody] UpdateIssueStatusRequest request, CancellationToken cancellationToken)
    {
        var result = await _issueService.UpdateStatusAsync(projectId, issueId, request, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpPatch("{issueId:guid}/assign")]
    public async Task<IActionResult> AssignIssue(Guid projectId, Guid issueId, [FromBody] AssignIssueRequest request, CancellationToken cancellationToken)
    {
        var result = await _issueService.AssignIssueAsync(projectId, issueId, request, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpDelete("{issueId:guid}")]
    public async Task<IActionResult> Delete(Guid projectId, Guid issueId, CancellationToken cancellationToken)
    {
        var result = await _issueService.DeleteAsync(projectId, issueId, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleResult(result);
    }
}
