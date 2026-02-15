using MicroServiceDotNet.Models;
using MicroServiceDotNet.ViewModels;

namespace MicroServiceDotNet.Mappers
{
    public class UserMapper
    {
        public static User ToModel(CreateUserVM vm)
        {
            return new User
            {
                email = vm.email,
                telephone = vm.telephone,
                mot_de_passe = vm.mot_de_passe,
                nom = vm.nom,
                prenom = vm.prenom,
                role = vm.role,
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
