namespace Flowtask.Core.Results;

public class ErrorResult : Result
{
    public ErrorResult() : base(false) { }
    public ErrorResult(string message) : base(false, message) { }
    public ErrorResult(string message, List<string> errors) : base(false, message, errors) { }
}
