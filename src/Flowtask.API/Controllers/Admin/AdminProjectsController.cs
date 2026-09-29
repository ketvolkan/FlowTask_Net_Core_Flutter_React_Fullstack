using Flowtask.Business.Interfaces;
using Flowtask.Core.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Flowtask.API.Controllers.Admin;

[Authorize(Policy = "RequireSystemAdmin")]
[Route("api/admin/projects")]
public class AdminProjectsController : BaseApiController
{
    private readonly IAdminService _adminService;

    public AdminProjectsController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllProjects([FromQuery] PaginationParams paginationParams, CancellationToken cancellationToken)
    {
        var result = await _adminService.GetAllProjectsAsync(paginationParams, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProject(Guid id, CancellationToken cancellationToken)
    {
        var result = await _adminService.DeleteProjectAsync(id, CurrentUserId, cancellationToken);
        return HandleResult(result);
    }
}
