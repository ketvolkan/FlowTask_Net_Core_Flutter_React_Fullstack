using Flowtask.Business.Abstract;
using Flowtask.EntityLayer.DTOs.Issues;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Flowtask.API.Controllers;

[Authorize]
public class IssuesController : BaseApiController
{
    private readonly IIssueService _issueService;

    public IssuesController(IIssueService issueService)
    {
        _issueService = issueService;
    }

    [HttpGet]
    public async Task<IActionResult> GetIssues([FromQuery] IssueFilterParams filterParams)
    {
        var result = await _issueService.GetIssuesAsync(CurrentUserId, filterParams);
        return HandleDataResult(result);
    }

    [HttpGet("{issueId:guid}")]
    public async Task<IActionResult> GetById(Guid issueId)
    {
        var result = await _issueService.GetIssueByIdAsync(issueId, CurrentUserId);
        return HandleDataResult(result);
    }

    [HttpPost("project/{projectId:guid}")]
    public async Task<IActionResult> Create(Guid projectId, [FromBody] IssueCreateDto request)
    {
        var result = await _issueService.CreateIssueAsync(projectId, CurrentUserId, request);
        return HandleDataResult(result);
    }

    [HttpPut("{issueId:guid}")]
    public async Task<IActionResult> Update(Guid issueId, [FromBody] IssueUpdateDto request)
    {
        var result = await _issueService.UpdateIssueAsync(issueId, CurrentUserId, request);
        return HandleDataResult(result);
    }

    [HttpPatch("{issueId:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid issueId, [FromBody] UpdateIssueStatusDto request)
    {
        var result = await _issueService.UpdateStatusAsync(issueId, CurrentUserId, request);
        return HandleDataResult(result);
    }

    [HttpPatch("{issueId:guid}/assign")]
    public async Task<IActionResult> AssignIssue(Guid issueId, [FromBody] AssignIssueDto request)
    {
        var result = await _issueService.AssignIssueAsync(issueId, CurrentUserId, request);
        return HandleDataResult(result);
    }

    [HttpDelete("{issueId:guid}")]
    public async Task<IActionResult> Delete(Guid issueId)
    {
        var result = await _issueService.DeleteIssueAsync(issueId, CurrentUserId);
        return HandleResult(result);
    }
}
