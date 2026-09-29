using Flowtask.Core.Utilities;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.Business.DTOs.Issues;

public class IssueFilterParams : PaginationParams
{
    public IssueStatus? Status { get; set; }
    public IssuePriority? Priority { get; set; }
    public IssueType? IssueType { get; set; }
    public Guid? AssigneeId { get; set; }
    public Guid? SprintId { get; set; }
}
