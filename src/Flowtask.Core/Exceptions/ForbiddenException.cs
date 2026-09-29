namespace Flowtask.Core.Exceptions;

public class ForbiddenException : FlowtaskException
{
    public ForbiddenException(string message = "You do not have permission to access this resource.") : base(message) { }
}
