using MicroServiceDotNet.Filters;
using MicroServiceDotNet.Mappers;
using MicroServiceDotNet.Services;
using MicroServiceDotNet.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MicroServiceDotNet.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _service;
        private readonly ITokenBlacklistService _blacklist;

        public AuthController(IAuthService service, ITokenBlacklistService blacklist)
        {
            _service = service;
            _blacklist = blacklist;
        }

        [HttpPost("inscription")]
        public IActionResult Inscrire([FromBody] CreateUserVM InscVM)
        {
            _service.Inscrire(InscVM);
            return Ok("Inscription réussie");
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var result = _service.Login(request.email, request.mot_de_passe);

            if (!result.Success)
            {
                if (result.IsBlocked)
                    return StatusCode(403, "Votre compte n’est pas encore autorisé.");

                return Unauthorized("Identifiants invalides");
            }

            // On récupère l'utilisateur via le service
            var user = _service.GetUserByEmail(request.email);

            // Mapping via le mapper séparé
            var response = AuthMapper.ToLoginResponse(user, result);

            return Ok(response);
        }

        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            _blacklist.AddToBlacklist(token);
            return Ok("Déconnexion réussie");
        }

        [HttpGet("secure")]
        [Authorize]
        [ServiceFilter(typeof(TokenBlacklistFilter))]
        public IActionResult SecureEndpoint()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;

            return Ok($"Vous êtes connecté : {email} - Rôle : {role}");
        }

        
    }
}
