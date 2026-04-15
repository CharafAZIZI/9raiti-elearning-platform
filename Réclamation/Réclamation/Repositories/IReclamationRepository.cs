using Réclamation.Models;

namespace Réclamation.Repositories
{
    public interface IReclamationRepository
    {
        Reclamation Add(Reclamation reclamation);
        IEnumerable<Reclamation> GetAll();
        Reclamation? GetById(int id);
        void Delete(int id);
    }
}