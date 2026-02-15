using MicroServiceDotNet.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MicroServiceDotNet.Controllers
{
    [ApiController]
    [Route("api/enseignant")]
    [TypeFilter(typeof(RoleFilter), Arguments = new object[] { new string[] {"ENSEIGNANT" } })]
    public class EnseignantController : ControllerBase
    {
        [HttpGet("dashboard")]
        public IActionResult Dashboard()
        {
            return Ok("Bienvenue ENSEIGNANT sur le dashboard");
        }

        [HttpGet("my-courses")]
        public IActionResult MyCourses()
        {
            return Ok("Voici vos cours (ENSEIGNANT seulement)");
        }
    }
}
