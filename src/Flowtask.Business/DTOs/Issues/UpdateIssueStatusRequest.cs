using Flowtask.EntityLayer.Enums;

namespace Flowtask.Business.DTOs.Issues;

public class UpdateIssueStatusRequest
{
    public IssueStatus Status { get; set; }
    public double? OrderIndex { get; set; }
}
