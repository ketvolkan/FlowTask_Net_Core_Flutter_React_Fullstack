using Flowtask.Business.Abstract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Flowtask.API.Controllers.Admin;

[Authorize(Policy = "RequireSystemAdmin")]
[Route("api/admin/statistics")]
public class AdminStatisticsController : BaseApiController
{
    private readonly IAdminService _adminService;

    public AdminStatisticsController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet]
    public async Task<IActionResult> GetStatistics()
    {
        var result = await _adminService.GetSystemStatisticsAsync();
        return HandleDataResult(result);
    }
}
