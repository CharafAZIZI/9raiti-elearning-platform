using MicroServiceDotNet.Data;
using MicroServiceDotNet.Mappers;
using MicroServiceDotNet.Models;
using MicroServiceDotNet.Repository;
using MicroServiceDotNet.Services;
using MicroServiceDotNet.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace MicroServiceDotNet.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "ADMIN")]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _repo;
        private readonly IPasswordService _passwordService;
        private readonly IAdminUserService _service;

        public UserController(IUserRepository repo, IPasswordService passwordService, IAdminUserService service)
        {
            _repo = repo;
            _passwordService = passwordService;
            _service = service;
        }

        [HttpPost("createUser")]
        public IActionResult Create(CreateUserVM vm)    
        {
            if (!ModelState.IsValid)
                return StatusCode(400,ModelState);

            var existingUser = _repo.GetByEmail(vm.email);
            if (existingUser != null)
                return StatusCode(409);

            var user = UserMapper.ToModel(vm);

            user.mot_de_passe = _passwordService.HashPassword(user, vm.mot_de_passe);

            var createdUser = _repo.AddUser(user);

            createdUser.mot_de_passe = null;

            return StatusCode(201, createdUser);
        }

        [HttpGet("getAll")]
        public IActionResult GetAll()
        {
            var users = _repo.GetAll();

            if (users == null || users.Count == 0)
                return StatusCode(404);

            return StatusCode(200, users);
        }

        [HttpGet("getById/{id}")]
        public IActionResult GetById(int id)
        {
            var user = _repo.GetById(id);

            if (user == null)
                return StatusCode(404);

            return StatusCode(200, user);
        }

        [HttpDelete("delete/{id}")]
        public IActionResult Delete(int id)
        {
            var user = _repo.GetById(id);

            if (user == null)
                return StatusCode(404);

            _repo.Delete(id);

            return StatusCode(204);
        }

        [HttpPut("valider/{id}")]
        public IActionResult ValiderEnseignant(int id)
        {
            var user = _service.ValiderEnseignant(id);

            if (user == null)
                return StatusCode(404);

            return StatusCode(200, user);
        }


        [HttpPut("activer/{id}")]
        public IActionResult Activer(int id)
        {
            var user = _service.ChangerEtatCompte(id, true);

            if (user == null)
                return StatusCode(404);

            return StatusCode(200, user);
        }


        [HttpPut("suspendre/{id}")]
        public IActionResult Suspendre(int id)
        {
            var user = _service.ChangerEtatCompte(id, false);

            if (user == null)
                return StatusCode(404);

            return StatusCode(200, user);
        }

    }
}
