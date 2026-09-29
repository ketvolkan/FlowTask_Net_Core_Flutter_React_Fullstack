using Flowtask.Business.DTOs.Projects;
using Flowtask.Core.Results;
using Flowtask.Core.Utilities;

namespace Flowtask.Business.Interfaces;

public interface IProjectService
{
    Task<IDataResult<ProjectDetailDto>> GetByIdAsync(Guid projectId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<PagedDataResult<ProjectDto>> GetUserProjectsAsync(Guid currentUserId, PaginationParams paginationParams, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IDataResult<ProjectDto>> CreateAsync(CreateProjectRequest request, Guid currentUserId, CancellationToken cancellationToken = default);
    Task<IDataResult<ProjectDto>> UpdateAsync(Guid projectId, UpdateProjectRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IResult> DeleteAsync(Guid projectId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IResult> ArchiveAsync(Guid projectId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<bool> HasProjectAccessAsync(Guid projectId, Guid userId, CancellationToken cancellationToken = default);
}
