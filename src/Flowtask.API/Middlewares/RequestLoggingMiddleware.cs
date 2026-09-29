using System.Diagnostics;

namespace Flowtask.API.Middlewares;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var requestPath = context.Request.Path;
        var requestMethod = context.Request.Method;

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            var statusCode = context.Response.StatusCode;

            if (statusCode >= 400)
            {
                _logger.LogWarning("HTTP {Method} {Path} responded {StatusCode} in {Elapsed} ms",
                    requestMethod, requestPath, statusCode, stopwatch.ElapsedMilliseconds);
            }
            else
            {
                _logger.LogInformation("HTTP {Method} {Path} responded {StatusCode} in {Elapsed} ms",
                    requestMethod, requestPath, statusCode, stopwatch.ElapsedMilliseconds);
            }
        }
    }
}
