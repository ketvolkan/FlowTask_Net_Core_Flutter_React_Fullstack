using Flowtask.Core.Results;
using Flowtask.EntityLayer.DTOs.Projects;

namespace Flowtask.Business.Abstract;

public interface IProjectMemberService
{
    Task<IDataResult<List<ProjectMemberDto>>> GetProjectMembersAsync(Guid projectId, Guid userId);
    Task<IDataResult<ProjectMemberDto>> AddMemberAsync(Guid projectId, Guid currentUserId, AddProjectMemberDto request);
    Task<IDataResult<ProjectMemberDto>> UpdateMemberRoleAsync(Guid projectId, Guid targetUserId, Guid currentUserId, UpdateMemberRoleDto request);
    Task<IResult> RemoveMemberAsync(Guid projectId, Guid targetUserId, Guid currentUserId);
}
