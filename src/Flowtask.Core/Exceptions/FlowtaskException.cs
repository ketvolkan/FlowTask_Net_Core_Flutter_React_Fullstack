namespace Flowtask.Core.Exceptions;

public class FlowtaskException : Exception
{
    public FlowtaskException(string message) : base(message) { }
    public FlowtaskException(string message, Exception innerException) : base(message, innerException) { }
}
