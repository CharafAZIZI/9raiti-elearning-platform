using MicroServiceDotNet.Models;

namespace MicroServiceDotNet.Repository
{
    public interface IAuthRepository
    {
        User GetByEmail(string email);
    }
}
