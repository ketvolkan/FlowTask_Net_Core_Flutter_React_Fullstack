using System.Net;
using System.Text.Json;
using Flowtask.Core.Exceptions;
using Flowtask.Core.Results;

namespace Flowtask.API.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        var traceId = context.TraceIdentifier;

        var statusCode = HttpStatusCode.InternalServerError;
        var message = "An unhandled server error occurred.";
        var errors = new List<string>();

        switch (exception)
        {
            case NotFoundException notFoundEx:
                statusCode = HttpStatusCode.NotFound;
                message = notFoundEx.Message;
                _logger.LogWarning(notFoundEx, "Resource not found: {Message}", notFoundEx.Message);
                break;

            case ValidationException valEx:
                statusCode = HttpStatusCode.BadRequest;
                message = valEx.Message;
                errors = valEx.ValidationErrors;
                _logger.LogWarning(valEx, "Validation failure: {Message}", valEx.Message);
                break;

            case ForbiddenException forbiddenEx:
                statusCode = HttpStatusCode.Forbidden;
                message = forbiddenEx.Message;
                _logger.LogWarning(forbiddenEx, "Forbidden access attempt: {Message}", forbiddenEx.Message);
                break;

            case UnauthorizedException unauthEx:
                statusCode = HttpStatusCode.Unauthorized;
                message = unauthEx.Message;
                _logger.LogWarning(unauthEx, "Unauthorized request: {Message}", unauthEx.Message);
                break;

            case ConflictException conflictEx:
                statusCode = HttpStatusCode.Conflict;
                message = conflictEx.Message;
                _logger.LogWarning(conflictEx, "Conflict occurred: {Message}", conflictEx.Message);
                break;

            default:
                _logger.LogError(exception, "Unhandled Exception: {Message} [TraceId: {TraceId}]", exception.Message, traceId);
                break;
        }

        context.Response.StatusCode = (int)statusCode;

        var response = new ErrorResult(message, errors)
        {
            TraceId = traceId
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
