using Flowtask.Core.Security;
using Microsoft.AspNetCore.Mvc;
using CoreResult = Flowtask.Core.Results.IResult;

namespace Flowtask.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected Guid CurrentUserId => User.GetUserId() ?? Guid.Empty;
    protected string CurrentUserEmail => User.GetEmail() ?? string.Empty;
    protected bool IsSystemAdmin => User.IsSystemAdmin();
    protected string? ClientIpAddress => HttpContext.Connection.RemoteIpAddress?.ToString();

    protected IActionResult HandleResult(CoreResult result)
    {
        if (result.Success)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    protected IActionResult HandleDataResult<T>(Flowtask.Core.Results.IDataResult<T> result)
    {
        if (result.Success)
        {
            if (result.Data == null)
            {
                return NotFound(result);
            }
            return Ok(result);
        }

        return BadRequest(result);
    }
}
