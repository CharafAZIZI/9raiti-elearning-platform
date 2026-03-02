using MicroServiceDotNet.Models;

namespace MicroServiceDotNet.Services.PasswordService
{
    public interface IPasswordService
    {
        string HashPassword(User user, string password);
        bool VerifyPassword(User user, string hashedPassword, string providedPassword);
        bool DemanderReinitialisation(string email);
        bool ConfirmerReinitialisation(string token, string nouveauMotDePasse);
    }
}
