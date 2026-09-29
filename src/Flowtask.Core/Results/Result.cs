using System.Text.Json.Serialization;

namespace Flowtask.Core.Results;

public class Result : IResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string> Errors { get; set; } = new();
    public string? TraceId { get; set; }

    public Result()
    {
    }

    public Result(bool success)
    {
        Success = success;
    }

    public Result(bool success, string message) : this(success)
    {
        Message = message;
    }

    [JsonConstructor]
    public Result(bool success, string message, List<string> errors, string? traceId = null) : this(success, message)
    {
        Errors = errors ?? new List<string>();
        TraceId = traceId;
    }
}
