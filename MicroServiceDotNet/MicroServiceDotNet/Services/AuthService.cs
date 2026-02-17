using MicroServiceDotNet.Mappers;
using MicroServiceDotNet.Models;
using MicroServiceDotNet.Repository;
using MicroServiceDotNet.ViewModels;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MicroServiceDotNet.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _repo;
        private readonly IConfiguration _config;
        private readonly IPasswordService _passwordService;

        public AuthService(IUserRepository repo, IConfiguration config, IPasswordService passwordService)
        {
            _repo = repo;
            _config = config;
            _passwordService = passwordService;
        }

        public void Inscrire(CreateUserVM InscVM)
        {
            var user = AuthMapper.ToEntity(InscVM);

            // HASH ici
            user.mot_de_passe = _passwordService.HashPassword(user, InscVM.mot_de_passe);

            user.role = InscVM.role.ToUpper();

            switch (user.role)
            {
                case "APPRENANT":
                    user.est_valide = true;
                    user.Apprenant = new Apprenant
                    {
                        date_inscription = DateTime.Now,
                        statut = "ACTIF",
                        score = 0
                    };
                    break;

                case "ENSEIGNANT":
                    user.est_valide = false;
                    user.Enseignant = new Enseignant
                    {
                        date_embauche = DateTime.Now
                    };
                    break;

                case "ADMIN":
                    user.est_valide = true;
                    break;

                default:
                    throw new Exception("Rôle invalide");
            }

            _repo.AddUser(user);
        }



        public LoginResult Login(string email, string mot_de_passe)
        {
            var user = _repo.GetByEmail(email);

            if (user == null ||
            !_passwordService.VerifyPassword(user, user.mot_de_passe, mot_de_passe))
            {
                return new LoginResult { Success = false };
            }

            if (!user.est_actif || !user.est_valide)
            {
                return new LoginResult { Success = false, IsBlocked = true };
            }

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
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

        public User GetUserByEmail(string email)
        {
            return _repo.GetByEmail(email);
        }
    }
}