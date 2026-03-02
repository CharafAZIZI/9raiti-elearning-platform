using MicroServiceDotNet.DTO.LoginUser;
using MicroServiceDotNet.DTO.RegisterUser;
using MicroServiceDotNet.Filters;
using MicroServiceDotNet.Mappers;
using MicroServiceDotNet.Repository;
using MicroServiceDotNet.Services.AuthService;
using MicroServiceDotNet.Services.TokenBlacklistService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MicroServiceDotNet.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _repo;
        private readonly IAuthService _service;
        private readonly ITokenBlacklistService _blacklist;

        public AuthController(
            IUserRepository repo,
            IAuthService service,
            ITokenBlacklistService blacklist)
        {
            _repo = repo;
            _service = service;
            _blacklist = blacklist;
        }
        // INSCRIPTION
        [HttpPost("inscription")]
        public IActionResult Inscrire([FromBody] RegisterUserVM vm)
        {
            var result = _service.Inscrire(vm);

            if (!result.Success)
                return Conflict(result.Message);

            return Ok("Inscription réussie. Vérifiez votre email.");
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

            // On récupère l'utilisateur
            var user = _repo.GetByEmail(request.email);

            //  AJOUT : Vérification Email
            if (user != null && !user.EmailConfirmed)
            {
                return StatusCode(403, "Veuillez confirmer votre email avant de vous connecter.");
            }

            var response = AuthMapper.ToLoginResponse(user, result);

            return Ok(response);
        }
        // CONFIRMATION EMAIL
        [HttpGet("confirm-email")]
        public IActionResult ConfirmEmail(string token)
        {
            if (string.IsNullOrEmpty(token))
                return Redirect("/email-templates/invalide-token.html");

            var user = _repo.GetByConfirmationToken(token);

            if (user == null)
                return Redirect("/email-templates/invalide-token.html");

            user.EmailConfirmed = true;
            user.EmailConfirmationToken = null;

            _repo.Update(user);
            return Redirect("/email-templates/email-confirmed.html");
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
        // ENDPOINT SECURISE
        [HttpGet]
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