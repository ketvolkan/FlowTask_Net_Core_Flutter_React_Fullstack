using Flowtask.Business.DTOs.Projects;
using Flowtask.Core.Results;

namespace Flowtask.Business.Interfaces;

public interface IProjectMemberService
{
    Task<IDataResult<IReadOnlyList<ProjectMemberDto>>> GetMembersAsync(Guid projectId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IDataResult<ProjectMemberDto>> AddMemberAsync(Guid projectId, AddProjectMemberRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IDataResult<ProjectMemberDto>> UpdateMemberRoleAsync(Guid projectId, Guid targetUserId, UpdateMemberRoleRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IResult> RemoveMemberAsync(Guid projectId, Guid targetUserId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
}
