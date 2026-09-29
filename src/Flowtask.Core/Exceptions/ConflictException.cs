namespace Flowtask.Core.Exceptions;

public class ConflictException : FlowtaskException
{
    public ConflictException(string message) : base(message) { }
}
