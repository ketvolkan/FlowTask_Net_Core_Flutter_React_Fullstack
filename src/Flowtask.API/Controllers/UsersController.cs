using Flowtask.Business.Abstract;
using Flowtask.Core.Utilities;
using Flowtask.EntityLayer.DTOs.Users;
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
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _userService.GetUserByIdAsync(id);
        return HandleDataResult(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] PaginationParams paginationParams)
    {
        var result = await _userService.GetAllUsersAsync(paginationParams);
        return HandleDataResult(result);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto request)
    {
        var result = await _userService.UpdateProfileAsync(CurrentUserId, request);
        return HandleDataResult(result);
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto request)
    {
        var result = await _userService.ChangePasswordAsync(CurrentUserId, request);
        return HandleResult(result);
    }
}
