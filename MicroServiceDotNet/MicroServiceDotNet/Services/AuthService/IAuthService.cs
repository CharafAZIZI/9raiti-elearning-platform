using MicroServiceDotNet.DTO.LoginUser;
using MicroServiceDotNet.DTO.RegisterUser;
using MicroServiceDotNet.Models;

namespace MicroServiceDotNet.Services.AuthService
{
    public interface IAuthService
    {
        LoginResult Inscrire(RegisterUserVM vm);
        LoginResult Login(string email, string mot_de_passe);
        LoginResult LoginWithGoogle(string idToken);
    }
}
