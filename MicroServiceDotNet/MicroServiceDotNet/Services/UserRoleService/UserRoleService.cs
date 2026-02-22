using MicroServiceDotNet.DTO.ManageUser;
using MicroServiceDotNet.DTO.RegisterUser;
using MicroServiceDotNet.Mappers;
using MicroServiceDotNet.Models;

namespace MicroServiceDotNet.Services.UserRoleService
{
    public class UserRoleService : IUserRoleService
    {
        public User RegisterUser(RegisterUserVM vm)
        {
            var user = AuthMapper.ToEntity(vm);
            user.role = vm.role.ToUpper();

            switch (user.role)
            {
                case "APPRENANT":
                    user.est_valide = true;
                    user.Apprenant = new Apprenant
                    {
                        statut = "ACTIF",
                        score = 0
                    };
                    break;

                case "ENSEIGNANT":
                    user.est_valide = false;
                    user.Enseignant = new Enseignant
                    {
                        date_embauche = DateTime.Now
                    };
                    break;

                case "ADMIN":
                    user.est_valide = true;
                    break;

                default:
                    throw new Exception("Rôle invalide");
            }

            return user;
        }

        public User CreateUser(CreateUserVM vm)
        {
            var user = UserMapper.ToModel(vm);
            user.role = vm.role.ToUpper();

            switch (user.role)
            {
                case "APPRENANT":
                    user.est_valide = true;
                    user.Apprenant = new Apprenant
                    {
                        statut = "ACTIF",
                        score = 0
                    };
                    break;

                case "ENSEIGNANT":
                    user.est_valide = true;
                    user.Enseignant = new Enseignant
                    {
                        date_embauche = DateTime.Now
                    };
                    break;

                case "ADMIN":
                    user.est_valide = true;
                    break;

                default:
                    throw new Exception("Rôle invalide");
            }

            return user;
        }
    }
}
