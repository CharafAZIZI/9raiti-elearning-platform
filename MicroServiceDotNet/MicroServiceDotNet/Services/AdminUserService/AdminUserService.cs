using MicroServiceDotNet.Data;
using MicroServiceDotNet.DTO.ManageUser;
using MicroServiceDotNet.DTO.RegisterUser;
using MicroServiceDotNet.Mappers;
using MicroServiceDotNet.Models;
using MicroServiceDotNet.Repository;
using MicroServiceDotNet.Services.PasswordService;
using MicroServiceDotNet.Services.UserRoleService;
using Microsoft.EntityFrameworkCore;

namespace MicroServiceDotNet.Services.AdminUserService
{
    public class AdminUserService : IAdminUserService
    {
        private readonly AppDbContext _context;
        private readonly IUserRepository _repo;
        private readonly IPasswordService _passwordService;
        private readonly IUserRoleService _role;

        public AdminUserService(
            AppDbContext context,
            IUserRepository repo,
            IPasswordService passwordService,
            IUserRoleService role)
        {
            _context = context;
            _repo = repo;
            _passwordService = passwordService;
            _role = role;
        }

        public User CreateUser(CreateUserVM vm)
        {
            var existingUser = _repo.GetByEmail(vm.email);
            if (existingUser != null)
                throw new Exception("Email déjà utilisé");

            var user = _role.CreateUser(new CreateUserVM
            {
                nom = vm.nom,
                prenom = vm.prenom,
                email = vm.email,
                telephone = vm.telephone,
                role = vm.role,
                mot_de_passe = vm.mot_de_passe
            });

            user.mot_de_passe =
                _passwordService.HashPassword(user, vm.mot_de_passe);

            return _repo.AddUser(user);
        }

        public List<User> GetAll()
        {
            return _context.Users
                .Include(u => u.Apprenant)
                .Include(u => u.Enseignant)
                .ToList();
        }

        public User GetById(int id)
        {
            return _context.Users
                .Include(u => u.Apprenant)
                .Include(u => u.Enseignant)
                .FirstOrDefault(u => u.id == id);
        }

        public void Delete(int id)
        {
            var user = GetById(id);
            _context.Users.Remove(user);
            _context.SaveChanges();
        }

        public User ValiderEnseignant(int id)
        {
            var user = _repo.GetById(id);
            if (user == null)
                return null;
            if (user.role != "ENSEIGNANT")
                throw new Exception("Utilisateur non enseignant");
            user.est_valide = true;
            _repo.Update(user);
            return user;
        }

        public User ChangerEtatCompte(int id, bool actif)
        {
            var user = _repo.GetById(id);
            if (user == null)
                return null;

            user.est_actif = actif;
            _repo.Update(user);
            return user;
        }
    }
}
