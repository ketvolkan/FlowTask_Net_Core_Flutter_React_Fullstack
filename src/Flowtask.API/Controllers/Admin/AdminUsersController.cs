using Flowtask.Business.Abstract;
using Flowtask.Core.Utilities;
using Flowtask.EntityLayer.DTOs.Users;
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
    public async Task<IActionResult> GetAllUsers([FromQuery] PaginationParams paginationParams)
    {
        var result = await _adminService.GetAllUsersAsync(paginationParams);
        return HandleDataResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserAdminDto request)
    {
        var result = await _adminService.CreateUserAsync(request);
        return HandleDataResult(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserAdminDto request)
    {
        var result = await _adminService.UpdateUserAsync(id, request);
        return HandleDataResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var result = await _adminService.DeleteUserAsync(id);
        return HandleResult(result);
    }
}
