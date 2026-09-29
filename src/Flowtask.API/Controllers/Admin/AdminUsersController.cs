using Flowtask.Business.DTOs.Users;
using Flowtask.Business.Interfaces;
using Flowtask.Core.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Flowtask.API.Controllers.Admin;

[Authorize(Policy = "RequireSystemAdmin")]
[Route("api/admin/users")]
public class AdminUsersController : BaseApiController
{
    private readonly IAdminService _adminService;

    public AdminUsersController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers([FromQuery] PaginationParams paginationParams, CancellationToken cancellationToken)
    {
        var result = await _adminService.GetAllUsersAsync(paginationParams, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetUserById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _adminService.GetUserByIdAsync(id, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserAdminRequest request, CancellationToken cancellationToken)
    {
        var result = await _adminService.CreateUserAsync(request, CurrentUserId, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserAdminRequest request, CancellationToken cancellationToken)
    {
        var result = await _adminService.UpdateUserAsync(id, request, CurrentUserId, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> ToggleUserStatus(Guid id, CancellationToken cancellationToken)
    {
        var result = await _adminService.ToggleUserStatusAsync(id, CurrentUserId, cancellationToken);
        return HandleResult(result);
    }

    [HttpPatch("{id:guid}/system-admin-role")]
    public async Task<IActionResult> SetSystemAdminRole(Guid id, [FromQuery] bool isSystemAdmin, CancellationToken cancellationToken)
    {
        var result = await _adminService.SetSystemAdminRoleAsync(id, isSystemAdmin, CurrentUserId, cancellationToken);
        return HandleResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id, CancellationToken cancellationToken)
    {
        var result = await _adminService.DeleteUserAsync(id, CurrentUserId, cancellationToken);
        return HandleResult(result);
    }
}
