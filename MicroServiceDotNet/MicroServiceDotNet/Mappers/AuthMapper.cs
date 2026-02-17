using MicroServiceDotNet.Models;
using MicroServiceDotNet.ViewModels;

namespace MicroServiceDotNet.Mappers
{
    public static class AuthMapper
    {
        public static LoginResponse ToLoginResponse(User user, LoginResult result)
        {
            return new LoginResponse
            {
                Email = user.email,
                Role = result.Role,
                Token = result.Token,
                Expiration = result.Expiration
            };
        }

        public static User ToEntity(CreateUserVM InscVM)
        {
            return new User
            {
                nom = InscVM.nom,
                prenom = InscVM.prenom,
                email = InscVM.email,
                telephone = InscVM.telephone,
                role = InscVM.role,
                est_actif = true,
                DateCreation = DateTime.UtcNow
            };
        }
    }
}
