using MicroServiceDotNet.Models;

namespace MicroServiceDotNet.Services
{
    public interface IAdminUserService
    {
        User ValiderEnseignant(int userId);
        User ChangerEtatCompte(int userId, bool actif);
    }
}
