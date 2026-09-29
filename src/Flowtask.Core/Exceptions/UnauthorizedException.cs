namespace Flowtask.Core.Exceptions;

public class UnauthorizedException : FlowtaskException
{
    public UnauthorizedException(string message = "Authentication failed or token is invalid.") : base(message) { }
}
