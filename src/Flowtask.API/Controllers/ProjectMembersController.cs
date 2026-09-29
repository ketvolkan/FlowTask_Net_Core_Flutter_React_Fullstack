using Flowtask.Business.DTOs.Projects;
using Flowtask.Business.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Flowtask.API.Controllers;

[Authorize]
[Route("api/projects/{projectId:guid}/members")]
public class ProjectMembersController : BaseApiController
{
    private readonly IProjectMemberService _projectMemberService;

    public ProjectMembersController(IProjectMemberService projectMemberService)
    {
        _projectMemberService = projectMemberService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMembers(Guid projectId, CancellationToken cancellationToken)
    {
        var result = await _projectMemberService.GetMembersAsync(projectId, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> AddMember(Guid projectId, [FromBody] AddProjectMemberRequest request, CancellationToken cancellationToken)
    {
        var result = await _projectMemberService.AddMemberAsync(projectId, request, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpPut("{userId:guid}/role")]
    public async Task<IActionResult> UpdateMemberRole(Guid projectId, Guid userId, [FromBody] UpdateMemberRoleRequest request, CancellationToken cancellationToken)
    {
        var result = await _projectMemberService.UpdateMemberRoleAsync(projectId, userId, request, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpDelete("{userId:guid}")]
    public async Task<IActionResult> RemoveMember(Guid projectId, Guid userId, CancellationToken cancellationToken)
    {
        var result = await _projectMemberService.RemoveMemberAsync(projectId, userId, CurrentUserId, IsSystemAdmin, cancellationToken);
        return HandleResult(result);
    }
}
