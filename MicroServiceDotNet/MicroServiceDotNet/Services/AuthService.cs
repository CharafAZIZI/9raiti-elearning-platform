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
        private readonly IAuthRepository _repo;
        private readonly IConfiguration _config;

        public AuthService(IAuthRepository repo, IConfiguration config)
        {
            _repo = repo;
            _config = config;
        }

        //public LoginResult Login(string email, string mot_de_passe)
        //{
        //    var user = _repo.GetByEmail(email);

        //    if (user == null || user.mot_de_passe != mot_de_passe)
        //    {
        //        return new LoginResult { Success = false };
        //    }

        //    if (!user.est_actif || !user.est_valide)
        //    {
        //        return new LoginResult { Success = false, IsBlocked = true };
        //    }

        //    // Claims avec rôle depuis la base
        //    var claims = new[]
        //    {
        //        new Claim(ClaimTypes.Email, user.email),
        //        new Claim(ClaimTypes.Role, user.role)
        //    };

        //    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
        //    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        //    var token = new JwtSecurityToken(
        //        issuer: _config["Jwt:Issuer"],
        //        audience: _config["Jwt:Audience"],
        //        claims: claims,
        //        expires: DateTime.Now.AddMinutes(30),
        //        signingCredentials: creds
        //    );

        //    return new LoginResult
        //    {
        //        Success = true,
        //        Token = new JwtSecurityTokenHandler().WriteToken(token),
        //        Role = user.role
        //    };
        //}

        public LoginResult Login(string email, string mot_de_passe)
        {
            var user = _repo.GetByEmail(email);

            if (user == null || user.mot_de_passe != mot_de_passe)
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

        public User GetUserByEmail(string email)
        {
            return _repo.GetByEmail(email);
        }

    }
}