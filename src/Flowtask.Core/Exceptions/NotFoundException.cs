namespace Flowtask.Core.Exceptions;

public class NotFoundException : FlowtaskException
{
    public NotFoundException(string message) : base(message) { }
    public NotFoundException(string entityName, object key) : base($"Entity '{entityName}' with key '{key}' was not found.") { }
}
