namespace Flowtask.Core.Results;

public interface IResult
{
    bool Success { get; }
    string Message { get; }
    List<string> Errors { get; }
    string? TraceId { get; }
}
