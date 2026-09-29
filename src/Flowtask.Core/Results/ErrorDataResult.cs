namespace Flowtask.Core.Results;

public class ErrorDataResult<T> : DataResult<T>
{
    public ErrorDataResult() : base(default, false) { }
    public ErrorDataResult(string message) : base(default, false, message) { }
    public ErrorDataResult(string message, List<string> errors) : base(default, false, message, errors) { }
    public ErrorDataResult(T? data, string message, List<string> errors) : base(data, false, message, errors) { }
}
