using Réclamation.Data;
using Réclamation.Models;

namespace Réclamation.Repositories
{
    public class ReclamationRepository : IReclamationRepository
    {
        private readonly AppDbContext _context;

        public ReclamationRepository(AppDbContext context)
        {
            _context = context;
        }

        public Reclamation Add(Reclamation reclamation)
        {
            _context.Reclamations.Add(reclamation);
            _context.SaveChanges();
            return reclamation;
        }

        public IEnumerable<Reclamation> GetAll()
        {
            return _context.Reclamations.ToList();
        }

        public Reclamation? GetById(int id)
        {
            return _context.Reclamations.Find(id);
        }

        public void Delete(int id)
        {
            var reclamation = _context.Reclamations.Find(id);
            if (reclamation != null)
            {
                _context.Reclamations.Remove(reclamation);
                _context.SaveChanges();
            }
        }
    }
}