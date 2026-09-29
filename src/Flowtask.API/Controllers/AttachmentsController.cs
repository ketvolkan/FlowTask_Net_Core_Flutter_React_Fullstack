using Flowtask.Business.Abstract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Flowtask.API.Controllers;

[Authorize]
public class AttachmentsController : BaseApiController
{
    private readonly IAttachmentService _attachmentService;
    private readonly IWebHostEnvironment _environment;

    public AttachmentsController(IAttachmentService attachmentService, IWebHostEnvironment environment)
    {
        _attachmentService = attachmentService;
        _environment = environment;
    }

    [HttpGet("issue/{issueId:guid}")]
    public async Task<IActionResult> GetAttachments(Guid issueId)
    {
        var result = await _attachmentService.GetIssueAttachmentsAsync(issueId, CurrentUserId);
        return HandleDataResult(result);
    }

    [HttpPost("issue/{issueId:guid}")]
    public async Task<IActionResult> UploadAttachment(Guid issueId, IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { success = false, message = "No file uploaded." });
        }

        var uploadsFolder = Path.Combine(_environment.ContentRootPath, "uploads");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var result = await _attachmentService.AddAttachmentAsync(
            issueId,
            CurrentUserId,
            file.FileName,
            $"/uploads/{uniqueFileName}",
            file.ContentType,
            file.Length);

        return HandleDataResult(result);
    }

    [HttpDelete("{attachmentId:guid}")]
    public async Task<IActionResult> DeleteAttachment(Guid attachmentId)
    {
        var result = await _attachmentService.DeleteAttachmentAsync(attachmentId, CurrentUserId);
        return HandleResult(result);
    }
}
