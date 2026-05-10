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

// HttpClient dédié au microservice notification pour le proxy SSE
builder.Services.AddHttpClient("notification", client =>
{
    client.BaseAddress = new Uri("http://localhost:8083");
    client.Timeout = Timeout.InfiniteTimeSpan; // SSE = connexion infinie
});

builder.Services.AddOcelot();

var app = builder.Build();

app.UseCors();

// ─── Proxy SSE manuel AVANT Ocelot ───────────────────────────────────────────
// Ocelot bufferise les réponses et ne supporte pas les SSE (text/event-stream).
// Ce middleware intercepte /api/notifications/stream et le proxyfie directement.
app.Use(async (context, next) =>
{
    if (!context.Request.Path.StartsWithSegments("/api/notifications/stream"))
    {
        await next();
        return;
    }

    var factory = context.RequestServices.GetRequiredService<IHttpClientFactory>();
    var client = factory.CreateClient("notification");

    // Reconstruire l'URL downstream avec le query string (token=...)
    var qs = context.Request.QueryString.Value ?? "";
    var targetUrl = $"/api/notifications/stream{qs}";

    using var req = new HttpRequestMessage(HttpMethod.Get, targetUrl);

    // Transférer les headers utiles (Authorization si présent)
    foreach (var header in context.Request.Headers)
    {
        if (header.Key.Equals("Host", StringComparison.OrdinalIgnoreCase)) continue;
        req.Headers.TryAddWithoutValidation(header.Key, (IEnumerable<string>)header.Value!);
    }

    using var resp = await client.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, context.RequestAborted);

    context.Response.StatusCode = (int)resp.StatusCode;
    context.Response.ContentType = "text/event-stream";
    context.Response.Headers["Cache-Control"] = "no-cache";
    context.Response.Headers["X-Accel-Buffering"] = "no";
    context.Response.Headers["Connection"] = "keep-alive";

    // Stream infini : copier octet par octet sans bufferiser
    await resp.Content.CopyToAsync(context.Response.Body, context.RequestAborted);
});
// ─────────────────────────────────────────────────────────────────────────────

await app.UseOcelot();

app.Run("http://0.0.0.0:9000");