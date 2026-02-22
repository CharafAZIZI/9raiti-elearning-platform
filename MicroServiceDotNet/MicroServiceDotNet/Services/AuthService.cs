using MicroServiceDotNet.Mappers;
using MicroServiceDotNet.Models;
using MicroServiceDotNet.Repository;
using MicroServiceDotNet.ViewModels;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Security.Cryptography;
using System.Linq;

namespace MicroServiceDotNet.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _repo;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;

        // Constructeur modifié pour injecter IEmailService
        public AuthService(IUserRepository repo, IConfiguration config, IEmailService emailService)
        {
            _repo = repo;
            _config = config;
            _emailService = emailService; 
        }

        //AJOUT : GENERATE TOKEN METHOD
        //private string GenerateEmailToken()
        //{
        //    return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        //}


        public void Inscrire(CreateUserVM InscVM)
        {
            var user = AuthMapper.ToEntity(InscVM);
            user.mot_de_passe = BCrypt.Net.BCrypt.HashPassword(InscVM.mot_de_passe);

            switch (InscVM.role.ToUpper())
            {
                case "APPRENANT":
                case "ADMIN":
                    user.est_valide = true;
                    break;
                case "ENSEIGNANT":
                    user.est_valide = false;
                    break;
                default:
                    throw new Exception("Rôle invalide");
            }
        }

        //    // AJOUT : EMAIL CONFIRMATION DATA
        //    var token = GenerateEmailToken();
        //    user.email_token = token;
        //    user.email_confirme = false;

        //    _repo.AddUser(user);

        //    // AJOUT : ENVOI EMAIL via EmailService
        //    var confirmationLink = $"https://localhost:7167/api/auth/confirm-email?token={token}";
        //    _emailService.SendEmail(
        //        user.email,
        //        "Confirmation Email",
        //        $"Cliquez ici pour confirmer votre compte : {confirmationLink}"
        //    );
        //}

        public LoginResult Login(string email, string mot_de_passe)
        {
            var user = _repo.GetByEmail(email);

            if (user == null || user.mot_de_passe != mot_de_passe)
            {
                return new LoginResult { Success = false };
            }

            //// AJOUT : VERIFICATION EMAIL
            //if (!user.email_confirme)
            {
                return new LoginResult { Success = false };
            }

            if (!user.est_actif || !user.est_valide)
            {
                return new LoginResult { Success = false, IsBlocked = true };
            }

            var claims = new[]
            {
                new Claim(ClaimTypes.Email, user.email),
                new Claim(ClaimTypes.Role, user.role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiration = DateTime.Now.AddMinutes(30);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: expiration,
                signingCredentials: creds
            );

            return new LoginResult
            {
                Success = true,
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Role = user.role,
                Expiration = expiration
            };
        }

        //// AJOUT : CONFIRM EMAIL METHOD
        //public bool ConfirmEmail(string token)
        //{
        //    var user = _repo.GetAll()
        //                    .FirstOrDefault(u => u.email_token == token);

        //    if (user == null)
        //        return false;

        //    user.email_confirme = true;
        //    user.email_token = null;

        //    _repo.Update(user);

        //    return true;
        //}

        public User GetUserByEmail(string email)
        {
            return _repo.GetByEmail(email);
        }
    }
}