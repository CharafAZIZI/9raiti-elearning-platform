using MicroServiceDotNet.Data;
using MicroServiceDotNet.DTO.ResetPassword;
using MicroServiceDotNet.Filters;
using MicroServiceDotNet.Repository;
using MicroServiceDotNet.Services.AdminUserService;
using MicroServiceDotNet.Services.AuthService;
using MicroServiceDotNet.Services.EmailService;
using MicroServiceDotNet.Services.JwtService;
using MicroServiceDotNet.Services.PasswordService;
using MicroServiceDotNet.Services.ProfileService;
using MicroServiceDotNet.Services.TemplateService;
using MicroServiceDotNet.Services.TokenBlacklistService;
using MicroServiceDotNet.Services.UserRoleService;
using MicroServiceDotNet.Services.ValidateEmailService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<ITokenBlacklistService, TokenBlacklistService>();
builder.Services.AddScoped<TokenBlacklistFilter>();
builder.Services.AddScoped<IGoogleAuthService, GoogleAuthService>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IAdminUserService, AdminUserService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IUserRoleService, UserRoleService>();
builder.Services.AddScoped<IResetService, ResetService>();
builder.Services.AddScoped<IEmailService, EmailService>();


builder.Services.AddScoped<ITemplateService, TemplateService>();
builder.Services.Configure<SmtpSettings>(
    builder.Configuration.GetSection("SmtpSettings"));


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]);
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5184" , "http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();

var app = builder.Build();
app.UseRouting(); 
app.UseCors();
app.UseAuthentication();
app.UseStaticFiles();
app.UseAuthorization();
app.MapControllers();
app.Run();