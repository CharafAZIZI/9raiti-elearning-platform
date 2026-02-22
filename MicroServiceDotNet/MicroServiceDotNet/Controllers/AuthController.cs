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

        // INSCRIPTION
        [HttpPost("inscription")]
        public IActionResult Inscrire([FromBody] CreateUserVM InscVM)
        {
            _service.Inscrire(InscVM);
            return Ok("Inscription réussie");
        }

        // LOGIN
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

            var user = _service.GetUserByEmail(request.email);

            var response = AuthMapper.ToLoginResponse(user, result);

            return Ok(response);
        }

        // LOGOUT
        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            var token = Request.Headers["Authorization"]
                .ToString()
                .Replace("Bearer ", "");

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

        
        // AJOUT : CONFIRMATION EMAIL
   
        //[HttpGet("confirm-email")]
        //public IActionResult ConfirmEmail(string token)
        //{
        //    var result = _service.ConfirmEmail(token);

        //    if (!result)
        //        return BadRequest("Token invalide ou expiré");

        //    return Ok("Email confirmé avec succès");
        //}
    }
}