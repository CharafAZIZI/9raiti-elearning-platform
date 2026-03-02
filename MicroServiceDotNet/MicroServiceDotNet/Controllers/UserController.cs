using MicroServiceDotNet.DTO.ManageUser;
using MicroServiceDotNet.Filters;
using MicroServiceDotNet.Mappers;
using MicroServiceDotNet.Repository;
using MicroServiceDotNet.Services.AdminUserService;
using MicroServiceDotNet.Services.PasswordService;
using MicroServiceDotNet.Services.UserRoleService;
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

            try
            {
                var user = _service.CreateUser(vm);
                user.mot_de_passe = null;
                return CreatedAtAction(nameof(GetById), new { id = user.id }, user);
            }
            catch (Exception ex)
            {
                return Conflict(ex.Message);
            }
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
            try
            {
                _service.Delete(id);
                return NoContent();
            }
            catch
            {
                return NotFound();
            }
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
