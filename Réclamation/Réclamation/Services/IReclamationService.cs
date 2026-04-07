using Réclamation.DTOs;

namespace Réclamation.Services
{
    public interface IReclamationService
    {
        ReclamationDto Create(ReclamationDto dto);
        IEnumerable<ReclamationDto> GetAll();
        void Delete(int id);
    }
}