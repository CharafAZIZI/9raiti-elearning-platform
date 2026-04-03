using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

// 🔹 Charger ocelot.json
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

// 🔹 CORS (Angular)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 🔹 Ocelot
builder.Services.AddOcelot();

var app = builder.Build();

// 🔥 IMPORTANT : exposer le port pour Docker
app.Urls.Add("http://0.0.0.0:9000");

// 🔹 Middleware
app.UseCors();

// 🔹 Ocelot (gateway)
await app.UseOcelot();

// 🔹 Lancer l'app
app.Run();