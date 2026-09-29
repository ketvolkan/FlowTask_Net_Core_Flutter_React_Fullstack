using Flowtask.Core.Results;
using Flowtask.Core.Utilities;
using Flowtask.EntityLayer.DTOs.Projects;

namespace Flowtask.Business.Abstract;

public interface IProjectService
{
    Task<IDataResult<PagedDataResult<ProjectDto>>> GetUserProjectsAsync(Guid userId, PaginationParams pagination);
    Task<IDataResult<ProjectDetailDto>> GetProjectByIdAsync(Guid projectId, Guid userId);
    Task<IDataResult<ProjectDto>> CreateProjectAsync(Guid userId, ProjectCreateDto request);
    Task<IDataResult<ProjectDto>> UpdateProjectAsync(Guid projectId, Guid userId, ProjectUpdateDto request);
    Task<IResult> DeleteProjectAsync(Guid projectId, Guid userId);
}
