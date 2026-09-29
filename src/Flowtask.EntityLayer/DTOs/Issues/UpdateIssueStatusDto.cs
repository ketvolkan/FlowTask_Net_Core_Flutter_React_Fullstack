using Flowtask.Core.Entities;
using Flowtask.EntityLayer.Enums;

namespace Flowtask.EntityLayer.DTOs.Issues;

public class UpdateIssueStatusDto : IDto
{
    public IssueStatus Status { get; set; }
    public double? Order { get; set; }
    public Guid? SprintId { get; set; }
}
