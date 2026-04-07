using MicroServiceDotNet.DTO.ManageUser;
using MicroServiceDotNet.Filters;
using MicroServiceDotNet.Repository;
using MicroServiceDotNet.Services.AdminUserService;

using Microsoft.AspNetCore.Mvc;

namespace MicroServiceDotNet.Controllers
{
    [ApiController]
    [Route("api/users")]
    [TypeFilter(typeof(RoleFilter), Arguments = new object[] { new string[] { "ADMIN" } })]
    public class UserController : ControllerBase
    {
        private readonly IAdminUserService _service;

        public UserController(IAdminUserService service)
        {
            _service = service;
        }

        [HttpPost]
        public IActionResult Create(CreateUserVM vm)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = _service.CreateUser(vm);

            if (user == null)
                return Conflict("Email déjà utilisé");

            return CreatedAtAction(nameof(GetById), new { id = user.id }, user);
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var users = _service.GetAll();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var user = _service.GetById(id);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var deleted = _service.Delete(id);

            if (!deleted)
                return NotFound();

            return NoContent();
        }

        [HttpPatch("valider/{id}")]
        public IActionResult ValiderEnseignant(int id)
        {
            var user = _service.ValiderEnseignant(id);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpPatch("activer/{id}")]
        public IActionResult Activer(int id)
        {
            var user = _service.ChangerEtatCompte(id, true);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpPatch("blocker/{id}")]
        public IActionResult Suspendre(int id)
        {
            var user = _service.ChangerEtatCompte(id, false);
            if (user == null)
                return NotFound();

            return Ok(user);
        }
    }
}
