using MicroServiceDotNet.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MicroServiceDotNet.Controllers
{
    [ApiController]
    [Route("api/apprenant")]
    [TypeFilter(typeof(RoleFilter), Arguments = new object[] { new string[] { "APPRENANT" } })]
    public class ApprenantController : ControllerBase
    {
        [HttpGet("dashboard")]
        public IActionResult Dashboard()
        {
            return Ok("Bienvenue APPRENANT sur le dashboard");
        }

        [HttpGet("my-lessons")]
        public IActionResult MyLessons()
        {
            return Ok("Voici vos leçons (APPRENANT seulement)");
        }
    }
}
