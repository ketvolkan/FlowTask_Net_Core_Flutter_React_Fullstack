using Flowtask.Core.Entities;

namespace Flowtask.EntityLayer.DTOs.Users;

public class UpdateDepartmentDto : IDto
{
    public string? Department { get; set; }
}
