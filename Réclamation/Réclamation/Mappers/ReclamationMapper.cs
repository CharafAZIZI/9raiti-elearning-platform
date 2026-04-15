using Réclamation.DTOs;
using Réclamation.Models;

namespace Réclamation.Mappers
{
    public static class ReclamationMapper
    {
        public static Reclamation ToEntity(this ReclamationDto dto)
        {
            return new Reclamation
            {
                Email = dto.Email,
                TypeReclamation = dto.TypeReclamation,
                Message = dto.Message
            };
        }

        public static ReclamationDto ToDto(this Reclamation entity)
        {
            return new ReclamationDto
            {
                Email = entity.Email,
                TypeReclamation = entity.TypeReclamation,
                Message = entity.Message
            };
        }
    }
}
