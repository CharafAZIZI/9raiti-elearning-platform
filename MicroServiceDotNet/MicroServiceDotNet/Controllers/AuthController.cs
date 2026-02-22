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

        public AuthController(IUserRepository repo,IAuthService service, ITokenBlacklistService blacklist)
        {
            _repo = repo;
            _service = service;
            _blacklist = blacklist;
        }

        [HttpPost]
        public IActionResult Inscrire([FromBody] RegisterUserVM vm)
        {
            var result = _service.Inscrire(vm);

            if (!result.Success)
                return Conflict(result.Message);

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
            var user = _repo.GetByEmail(request.email);

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
