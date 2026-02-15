using Castle.MicroKernel;
using MicroServiceDotNet.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MicroServiceDotNet.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [TypeFilter(typeof(RoleFilter), Arguments = new object[] { new string[] { "ADMIN" } })]
    public class AdminController : ControllerBase
    {
        [HttpGet("dashboard")]
        public IActionResult Dashboard()
        {
            return Ok("Bienvenue ADMIN sur le dashboard");
        }

        [HttpGet("users")]
        public IActionResult ListUsers()
        {
            return Ok("Liste des utilisateurs (ADMIN seulement)");
        }
    }
}
