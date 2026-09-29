using Flowtask.Core.Results;
using Flowtask.EntityLayer.DTOs.Issues;

namespace Flowtask.Business.Abstract;

public interface IIssueService
{
    Task<IDataResult<PagedDataResult<IssueDto>>> GetIssuesAsync(Guid userId, IssueFilterParams filter);
    Task<IDataResult<IssueDto>> GetIssueByIdAsync(Guid issueId, Guid userId);
    Task<IDataResult<IssueDto>> CreateIssueAsync(Guid projectId, Guid userId, IssueCreateDto request);
    Task<IDataResult<IssueDto>> UpdateIssueAsync(Guid issueId, Guid userId, IssueUpdateDto request);
    Task<IDataResult<IssueDto>> UpdateStatusAsync(Guid issueId, Guid userId, UpdateIssueStatusDto request);
    Task<IDataResult<IssueDto>> AssignIssueAsync(Guid issueId, Guid userId, AssignIssueDto request);
    Task<IResult> DeleteIssueAsync(Guid issueId, Guid userId);
}
