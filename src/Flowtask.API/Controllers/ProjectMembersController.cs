using Flowtask.Business.Abstract;
using Flowtask.EntityLayer.DTOs.Projects;
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
    public async Task<IActionResult> GetMembers(Guid projectId)
    {
        var result = await _projectMemberService.GetProjectMembersAsync(projectId, CurrentUserId);
        return HandleDataResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> AddMember(Guid projectId, [FromBody] AddProjectMemberDto request)
    {
        var result = await _projectMemberService.AddMemberAsync(projectId, CurrentUserId, request);
        return HandleDataResult(result);
    }

    [HttpPut("{userId:guid}/role")]
    public async Task<IActionResult> UpdateMemberRole(Guid projectId, Guid userId, [FromBody] UpdateMemberRoleDto request)
    {
        var result = await _projectMemberService.UpdateMemberRoleAsync(projectId, userId, CurrentUserId, request);
        return HandleDataResult(result);
    }

    [HttpDelete("{userId:guid}")]
    public async Task<IActionResult> RemoveMember(Guid projectId, Guid userId)
    {
        var result = await _projectMemberService.RemoveMemberAsync(projectId, userId, CurrentUserId);
        return HandleResult(result);
    }
}
