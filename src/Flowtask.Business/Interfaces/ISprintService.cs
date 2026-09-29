using Flowtask.Business.DTOs.Sprints;
using Flowtask.Core.Results;

namespace Flowtask.Business.Interfaces;

public interface ISprintService
{
    Task<IDataResult<SprintDetailDto>> GetByIdAsync(Guid projectId, Guid sprintId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IDataResult<IReadOnlyList<SprintDto>>> GetProjectSprintsAsync(Guid projectId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IDataResult<SprintDto>> CreateAsync(Guid projectId, CreateSprintRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IDataResult<SprintDto>> UpdateAsync(Guid projectId, Guid sprintId, UpdateSprintRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IDataResult<SprintDto>> StartSprintAsync(Guid projectId, Guid sprintId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IDataResult<SprintDto>> CompleteSprintAsync(Guid projectId, Guid sprintId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IResult> DeleteAsync(Guid projectId, Guid sprintId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
}
