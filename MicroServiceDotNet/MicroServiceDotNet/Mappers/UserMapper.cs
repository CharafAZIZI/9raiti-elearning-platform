using MicroServiceDotNet.DTO.ManageUser;
using MicroServiceDotNet.Models;

namespace MicroServiceDotNet.Mappers
{
    public class UserMapper
    {
        public static User ToModel(CreateUserVM vm)
        {
            return new User
            {
                email = vm.email,
                mot_de_passe = vm.mot_de_passe,
                nom = vm.nom,
                prenom = vm.prenom,
                telephone = vm.telephone,
                role = vm.role,
                est_actif = true,
                est_valide = true
            };
        }

        public static UserVM ToViewModel(User user)
        {
            return new UserVM
            {
                id = user.id,
                email = user.email,
                nom = user.nom,
                prenom = user.prenom,
                role = user.role,
                est_actif = user.est_actif,
                est_valide = user.est_valide
            };
        }
    }
}
