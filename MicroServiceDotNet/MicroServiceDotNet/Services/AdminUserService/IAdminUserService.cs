using MicroServiceDotNet.DTO.ManageUser;
using MicroServiceDotNet.Models;

namespace MicroServiceDotNet.Services.AdminUserService
{
    public interface IAdminUserService
    {
        User CreateUser(CreateUserVM vm);
        List<User> GetAll();
        User GetById(int id);
        void Delete(int id);
        User ValiderEnseignant(int id);
        User ChangerEtatCompte(int id, bool actif);
    }
}
