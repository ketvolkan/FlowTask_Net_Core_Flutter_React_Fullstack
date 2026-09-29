using System.Text.Json.Serialization;

namespace Flowtask.Core.Results;

public class PagedDataResult<T> : DataResult<IReadOnlyList<T>>
{
    public PaginationMetadata Pagination { get; set; } = new();

    public PagedDataResult() : base(new List<T>(), true, string.Empty)
    {
    }

    [JsonConstructor]
    public PagedDataResult(IReadOnlyList<T> data, bool success, string message, PaginationMetadata pagination)
        : base(data, success, message)
    {
        Pagination = pagination ?? new PaginationMetadata();
    }

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

    public static PagedDataResult<T> Create(IReadOnlyList<T> data, int totalCount, int page, int pageSize, string message = "")
    {
        return new PagedDataResult<T>(data, totalCount, page, pageSize, message);
    }
}
