using MicroServiceDotNet.Filters;
using MicroServiceDotNet.Models;
using MicroServiceDotNet.Services;
using Microsoft.AspNetCore.Mvc;

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

        [HttpPost("login")]
        public IActionResult Login(User user)
        {
            var result = _service.Login(user.email, user.mot_de_passe);

            if (!result.Success)
            {
                if (result.IsBlocked)
                    return StatusCode(403, "Votre compte n’est pas encore autorisé.");

                return Unauthorized("Invalid Credentials");
            }

            return Ok(new { user.email, Token = result.Token });
        }

        [HttpPost("logout")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public IActionResult Logout()
        {
            var token = Request.Headers["Authorization"]
                .ToString()
                .Replace("Bearer ", "");

            _blacklist.AddToBlacklist(token);

            return Ok("Déconnexion réussie");
        }

    [HttpGet("secure")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        [ServiceFilter(typeof(TokenBlacklistFilter))]
        public IActionResult SecureEndpoint()
        {
            return Ok("You are authenticated");
        }
    } 
}
