using MicroServiceDotNet.DTO.ManageUser;
using MicroServiceDotNet.Mappers;
using MicroServiceDotNet.Repository;
using MicroServiceDotNet.Services.PasswordService;
using MicroServiceDotNet.Services.UserRoleService;

namespace MicroServiceDotNet.Services.AdminUserService
{
    public class AdminUserService : IAdminUserService
    {
        private readonly IUserRepository _repo;
        private readonly IPasswordService _passwordService;
        private readonly IUserRoleService _role;

        public AdminUserService(
            IUserRepository repo,
            IPasswordService passwordService,
            IUserRoleService role)
        {
            _repo = repo;
            _passwordService = passwordService;
            _role = role;
        }

        public UserVM CreateUser(CreateUserVM vm)
        {
            var existingUser = _repo.GetByEmail(vm.email);
            if (existingUser != null)
                return null;

            var user = _role.CreateUser(vm);

            user.mot_de_passe =
                _passwordService.HashPassword(user, vm.mot_de_passe);

            user.est_actif = true;
            user.est_valide = true;

            var savedUser = _repo.AddUser(user);

            return UserMapper.ToViewModel(savedUser);
        }

        public List<UserVM> GetAll()
        {
            var users = _repo.GetAll();

            return users
                .Select(u => UserMapper.ToViewModel(u))
                .ToList();
        }

        public UserVM GetById(int id)
        {
            var user = _repo.GetById(id);

            if (user == null)
                return null;

            return UserMapper.ToViewModel(user);
        }

        public bool Delete(int id)
        {
            var user = _repo.GetById(id);

            if (user == null)
                return false;

            _repo.Delete(id);
            return true;
        }

        public UserVM ValiderEnseignant(int id)
        {
            var user = _repo.GetById(id);

            if (user == null)
                return null;

            if (user.role != "ENSEIGNANT")
                return null;

            if (user.est_valide)
                return null;

            user.est_valide = true;

            _repo.Update(user);

            return UserMapper.ToViewModel(user);
        }

        public UserVM ChangerEtatCompte(int id, bool actif)
        {
            var user = _repo.GetById(id);

            if (user == null)
                return null;

            user.est_actif = actif;

            _repo.Update(user);

            return UserMapper.ToViewModel(user);
        }
    }
}