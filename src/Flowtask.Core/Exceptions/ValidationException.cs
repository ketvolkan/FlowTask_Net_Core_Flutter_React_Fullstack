namespace Flowtask.Core.Exceptions;

public class ValidationException : FlowtaskException
{
    public List<string> ValidationErrors { get; }

    public ValidationException(string message) : base(message)
    {
        ValidationErrors = new List<string> { message };
    }

    public ValidationException(List<string> errors) : base("One or more validation failures have occurred.")
    {
        ValidationErrors = errors;
    }
}
