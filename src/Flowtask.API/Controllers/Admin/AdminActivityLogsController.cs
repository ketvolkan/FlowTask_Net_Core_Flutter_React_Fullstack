using Flowtask.Business.Abstract;
using Flowtask.Core.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Flowtask.API.Controllers.Admin;

[Authorize(Policy = "RequireSystemAdmin")]
[Route("api/admin/activity-logs")]
public class AdminActivityLogsController : BaseApiController
{
    private readonly IActivityLogService _activityLogService;

    public AdminActivityLogsController(IActivityLogService activityLogService)
    {
        _activityLogService = activityLogService;
    }

    [HttpGet]
    public async Task<IActionResult> GetActivityLogs([FromQuery] PaginationParams paginationParams, [FromQuery] Guid? projectId)
    {
        var result = await _activityLogService.GetLogsAsync(projectId, paginationParams);
        return HandleDataResult(result);
    }
}
