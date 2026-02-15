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

        public AuthService(IUserRepository repo, IConfiguration config)
        {
            _repo = repo;
            _config = config;
        }

        public LoginResult Login(string email, string mot_de_passe)
        {
            var user = _repo.GetByEmail(email);

            if (user == null || user.mot_de_passe != mot_de_passe)
            {
                return new LoginResult
                {
                    Success = false
                };
            }

            // Vérification si l’utilisateur est actif
            if (!user.est_actif)
            {
                return new LoginResult
                {
                    Success = false,
                    IsBlocked = true // utilisé dans le controller pour retourner 403
                };
            }

            // Si nécessaire, conserver la vérification existante
            if (!user.est_valide)
            {
                return new LoginResult
                {
                    Success = false,
                    IsBlocked = true
                };
            }

            var claims = new[]
            {
        new Claim(ClaimTypes.Email, user.email)
    };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: creds
            );

            return new LoginResult
            {
                Success = true,
                Token = new JwtSecurityTokenHandler().WriteToken(token)
            };
        }
    }
}