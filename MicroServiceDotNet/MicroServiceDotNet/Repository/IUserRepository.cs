using MicroServiceDotNet.Models;

namespace MicroServiceDotNet.Repository
{
    public interface IUserRepository
    {
        User GetByEmail(string email);
    }
}
