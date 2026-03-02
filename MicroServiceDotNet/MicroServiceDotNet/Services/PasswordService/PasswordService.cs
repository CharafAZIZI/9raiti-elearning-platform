using MicroServiceDotNet.Models;
using Microsoft.AspNetCore.Identity;
using MicroServiceDotNet.Data;
using MicroServiceDotNet.Services.EmailService;
using MicroServiceDotNet.Services.TemplateService;

namespace MicroServiceDotNet.Services.PasswordService
{
    public class PasswordService : IPasswordService
    {
        private readonly PasswordHasher<User> _hasher;
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ITemplateService _templateService;

        public PasswordService(AppDbContext context, IEmailService emailService, ITemplateService templateService)
        {
            _hasher = new PasswordHasher<User>();
            _context = context;
            _emailService = emailService;
            _templateService = templateService;
        }

        public string HashPassword(User user, string password)
        {
            return _hasher.HashPassword(user, password);
        }

        public bool VerifyPassword(User user, string hashedPassword, string providedPassword)
        {
            var result = _hasher.VerifyHashedPassword(user, hashedPassword, providedPassword);
            return result == PasswordVerificationResult.Success;
        }

        private string HashToken(string token)
        {
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var bytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(token));
            return Convert.ToBase64String(bytes);
        }

        public bool DemanderReinitialisation(string email)
        {
            var user = _context.Users.FirstOrDefault(u => u.email == email);
            if (user == null) return true; // anti enumeration email

            var rawToken = Guid.NewGuid().ToString();
            var hashedToken = HashToken(rawToken);

            user.PasswordResetToken = hashedToken;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(30);

            _context.SaveChanges();

            var resetLink = $"https://localhost:7167/reset-password.html?token={rawToken}";

            var body = _templateService.GetResetPasswordEmail(resetLink);

            _emailService.EnvoyerEmail(user.email,
                "Réinitialisation de mot de passe",
                body);

            return true;
        }

        public bool ConfirmerReinitialisation(string token, string nouveauMotDePasse)
        {
            var hashedToken = HashToken(token);

            var user = _context.Users.FirstOrDefault(u =>
                u.PasswordResetToken == hashedToken &&
                u.PasswordResetTokenExpiry > DateTime.UtcNow);

            if (user == null) return false;

            user.mot_de_passe = HashPassword(user, nouveauMotDePasse);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;

            _context.SaveChanges();
            return true;
        }
    }
}