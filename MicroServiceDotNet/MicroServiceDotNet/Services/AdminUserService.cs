using MicroServiceDotNet.Models;
using MicroServiceDotNet.Repository;

namespace MicroServiceDotNet.Services
{
    public class AdminUserService : IAdminUserService
    {
        private readonly IUserRepository _repo;

        public AdminUserService(IUserRepository repo)
        {
            _repo = repo;
        }

        public User ValiderEnseignant(int Id)
        {
            var user = _repo.GetById(Id);
            if (user == null)
                return null;

            user.est_valide = true;
            _repo.Update(user);

            return user;
        }

        public User ChangerEtatCompte(int Id, bool actif)
        {
            var user = _repo.GetById(Id);
            if (user == null)
                return null;

            user.est_actif = actif;
            _repo.Update(user);

            return user;
        }
    }
}
