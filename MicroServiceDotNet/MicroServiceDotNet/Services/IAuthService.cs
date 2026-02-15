using MicroServiceDotNet.Models;
using MicroServiceDotNet.ViewModels;

namespace MicroServiceDotNet.Services
{
    public interface IAuthService
    {
        LoginResult Login(string email, string mot_de_passe);
        User GetUserByEmail(string email);
    }
}
