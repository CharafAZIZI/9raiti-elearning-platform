using MicroServiceDotNet.Models;

namespace MicroServiceDotNet.Services
{
    public interface IPasswordService
    {
        string HashPassword(User user, string password);
        bool VerifyPassword(User user, string hashedPassword, string providedPassword);
    }
}
