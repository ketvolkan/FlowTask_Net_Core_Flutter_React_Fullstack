using Flowtask.Core.Entities;
using Flowtask.Core.Utilities;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.EntityLayer.DTOs.Issues;

public class IssueFilterParams : PaginationParams, IDto
{
    public Guid? ProjectId { get; set; }
    public Guid? SprintId { get; set; }
    public Guid? AssigneeId { get; set; }
    public Guid? ReporterId { get; set; }
    public IssueStatus? Status { get; set; }
    public IssuePriority? Priority { get; set; }
    public IssueType? Type { get; set; }
}
