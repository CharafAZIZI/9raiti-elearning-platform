using MicroServiceDotNet.DTO.ManageUser;
using MicroServiceDotNet.DTO.RegisterUser;

namespace MicroServiceDotNet.Services.AdminUserService
{
    public interface IAdminUserService
    {
        UserVM CreateUser(CreateUserVM vm);
        List<UserVM> GetAll();
        UserVM GetById(int id);
        bool Delete(int id);
        UserVM ValiderEnseignant(int id);
        UserVM ChangerEtatCompte(int id, bool actif);
    }
}