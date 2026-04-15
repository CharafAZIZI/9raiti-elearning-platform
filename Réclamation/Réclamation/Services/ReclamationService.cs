using System.Collections.Generic;
using System.Linq;
using Réclamation.DTOs;
using Réclamation.Repositories;
using Réclamation.Mappers;

namespace Réclamation.Services
{
    public class ReclamationService : IReclamationService
    {
        private readonly IReclamationRepository _repository;

        public ReclamationService(IReclamationRepository repository)
        {
            _repository = repository;
        }

        public ReclamationDto Create(ReclamationDto dto)
        {
            var entity = dto.ToEntity();
            var created = _repository.Add(entity);
            return created.ToDto();
        }

        public IEnumerable<ReclamationDto> GetAll()
        {
            return _repository
                .GetAll()
                .Select(r => r.ToDto())
                .ToList();
        }

        public void Delete(int id)
        {
            _repository.Delete(id);
        }
    }
}