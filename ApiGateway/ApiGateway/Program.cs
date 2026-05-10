using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddHttpClient("notification", client =>
{
    client.BaseAddress = new Uri("http://notification-service:8083");
    client.Timeout = Timeout.InfiniteTimeSpan;
});

builder.Services.AddOcelot();

var app = builder.Build();
app.UseCors();

// ─── Proxy SSE manuel AVANT Ocelot ───────────────────────────────────────────
app.Use(async (context, next) =>
{
    if (!context.Request.Path.StartsWithSegments("/api/notifications/stream"))
    {
        await next();
        return;
    }

    // ✅ CORS headers ajoutés dès le début, même en cas d'erreur
    context.Response.Headers["Access-Control-Allow-Origin"] = "http://localhost:4200";
    context.Response.Headers["Access-Control-Allow-Headers"] = "*";
    context.Response.Headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";

    // ✅ Gérer le preflight OPTIONS
    if (context.Request.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
    {
        context.Response.StatusCode = 204;
        return;
    }

    var factory = context.RequestServices.GetRequiredService<IHttpClientFactory>();
    var client = factory.CreateClient("notification");

    var qs = context.Request.QueryString.Value ?? "";
    var targetUrl = $"/api/notifications/stream{qs}";

    using var req = new HttpRequestMessage(HttpMethod.Get, targetUrl);

    foreach (var header in context.Request.Headers)
    {
        if (header.Key.Equals("Host", StringComparison.OrdinalIgnoreCase)) continue;
        req.Headers.TryAddWithoutValidation(header.Key, (IEnumerable<string>)header.Value!);
    }

    try
    {
        using var resp = await client.SendAsync(
            req,
            HttpCompletionOption.ResponseHeadersRead,
            context.RequestAborted
        );

        context.Response.StatusCode = (int)resp.StatusCode;
        context.Response.ContentType = "text/event-stream";
        context.Response.Headers["Cache-Control"] = "no-cache";
        context.Response.Headers["X-Accel-Buffering"] = "no";
        context.Response.Headers["Connection"] = "keep-alive";

        await resp.Content.CopyToAsync(context.Response.Body, context.RequestAborted);
    }
    catch (HttpRequestException ex)
    {
        context.Response.StatusCode = 502;
        await context.Response.WriteAsync($"Notification service unavailable: {ex.Message}");
    }
    catch (OperationCanceledException)
    {
        // Client déconnecté — normal pour SSE, on ignore
    }
});
// ─────────────────────────────────────────────────────────────────────────────

await app.UseOcelot();
app.Run("http://0.0.0.0:9000");