using Flowtask.Core.Results;
using Flowtask.EntityLayer.DTOs.Sprints;

namespace Flowtask.Business.Abstract;

public interface ISprintService
{
    Task<IDataResult<List<SprintDto>>> GetProjectSprintsAsync(Guid projectId, Guid userId);
    Task<IDataResult<SprintDetailDto>> GetSprintByIdAsync(Guid sprintId, Guid userId);
    Task<IDataResult<SprintDto>> CreateSprintAsync(Guid projectId, Guid userId, SprintCreateDto request);
    Task<IDataResult<SprintDto>> UpdateSprintAsync(Guid sprintId, Guid userId, SprintUpdateDto request);
    Task<IDataResult<SprintDto>> StartSprintAsync(Guid sprintId, Guid userId);
    Task<IDataResult<SprintDto>> CompleteSprintAsync(Guid sprintId, Guid userId);
    Task<IResult> DeleteSprintAsync(Guid sprintId, Guid userId);
}
