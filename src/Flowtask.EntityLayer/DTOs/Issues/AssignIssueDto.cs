using Flowtask.Core.Entities;

namespace Flowtask.EntityLayer.DTOs.Issues;

public class AssignIssueDto : IDto
{
    public Guid? AssigneeId { get; set; }
}
