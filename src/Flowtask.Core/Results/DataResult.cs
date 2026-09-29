using System.Text.Json.Serialization;

namespace Flowtask.Core.Results;

public class DataResult<T> : Result, IDataResult<T>
{
    public T? Data { get; set; }

    public DataResult()
    {
    }

    public DataResult(T? data, bool success) : base(success)
    {
        Data = data;
    }

    public DataResult(T? data, bool success, string message) : base(success, message)
    {
        Data = data;
    }

    [JsonConstructor]
    public DataResult(T? data, bool success, string message, List<string> errors, string? traceId = null) : base(success, message, errors, traceId)
    {
        Data = data;
    }
}
