namespace Flowtask.Core.Results;

public class PagedDataResult<T> : DataResult<IReadOnlyList<T>>
{
    public PaginationMetadata Pagination { get; set; } = new();

    public PagedDataResult(IReadOnlyList<T> data, int totalCount, int page, int pageSize, string message = "")
        : base(data, true, message)
    {
        Pagination = new PaginationMetadata
        {
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }
}
