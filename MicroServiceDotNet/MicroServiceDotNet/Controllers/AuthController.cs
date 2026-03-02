using MicroServiceDotNet.DTO.LoginUser;
using MicroServiceDotNet.DTO.RegisterUser;
using MicroServiceDotNet.DTO.ResetPassword;
using MicroServiceDotNet.Filters;
using MicroServiceDotNet.Mappers;
using MicroServiceDotNet.Repository;
using MicroServiceDotNet.Services.AuthService;
using MicroServiceDotNet.Services.PasswordService;
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
        private readonly IPasswordService _passwordService;
        private readonly IWebHostEnvironment _env;

        public AuthController(
            IUserRepository repo,
            IAuthService service,
            ITokenBlacklistService blacklist,
            IPasswordService passwordService,
            IWebHostEnvironment env)
        {
            _repo = repo;
            _service = service;
            _blacklist = blacklist;
            _passwordService = passwordService;
            _env = env;
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

        [HttpPost("forgot")]
        public IActionResult ForgotPassword([FromBody] ResetPasswordRequest request)
        {
            _passwordService.DemanderReinitialisation(request.Email);

            return Ok("Si l'email existe, un lien de réinitialisation a été envoyé.");
        }


        [HttpPost("reset")]
        public IActionResult ResetPassword([FromBody] ResetPasswordConfirm vm)
        {
            if (!ModelState.IsValid)
                return BadRequest("Données invalides.");

            if (vm.NewPassword != vm.ConfirmPassword)
                return BadRequest("Les mots de passe ne correspondent pas.");

            var result = _passwordService.ConfirmerReinitialisation(vm.Token, vm.NewPassword);

            if (!result)
                return BadRequest(new { message = "Token invalide ou expiré." });

            return Ok(new { message = "Mot de passe réinitialisé avec succès." });
        }


    }
}
