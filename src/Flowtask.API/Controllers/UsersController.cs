using Flowtask.Business.DTOs.Users;
using Flowtask.Business.Interfaces;
using Flowtask.Core.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Flowtask.API.Controllers;

[Authorize]
public class UsersController : BaseApiController
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _userService.GetByIdAsync(id, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] PaginationParams paginationParams, CancellationToken cancellationToken)
    {
        var result = await _userService.GetUsersAsync(paginationParams, cancellationToken);
        return Ok(result);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        var result = await _userService.UpdateProfileAsync(CurrentUserId, request, cancellationToken);
        return HandleDataResult(result);
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        var result = await _userService.ChangePasswordAsync(CurrentUserId, request, cancellationToken);
        return HandleResult(result);
    }
}
