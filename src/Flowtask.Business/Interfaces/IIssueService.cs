using Flowtask.Business.DTOs.Issues;
using Flowtask.Core.Results;

namespace Flowtask.Business.Interfaces;

public interface IIssueService
{
    Task<IDataResult<IssueDto>> GetByIdAsync(Guid projectId, Guid issueId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<PagedDataResult<IssueDto>> GetIssuesAsync(Guid projectId, IssueFilterParams filterParams, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IDataResult<IssueDto>> CreateAsync(Guid projectId, CreateIssueRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IDataResult<IssueDto>> UpdateAsync(Guid projectId, Guid issueId, UpdateIssueRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IDataResult<IssueDto>> UpdateStatusAsync(Guid projectId, Guid issueId, UpdateIssueStatusRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IDataResult<IssueDto>> AssignIssueAsync(Guid projectId, Guid issueId, AssignIssueRequest request, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
    Task<IResult> DeleteAsync(Guid projectId, Guid issueId, Guid currentUserId, bool isSystemAdmin = false, CancellationToken cancellationToken = default);
}
