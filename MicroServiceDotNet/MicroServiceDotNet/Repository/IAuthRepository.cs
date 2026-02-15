using MicroServiceDotNet.Models;

namespace MicroServiceDotNet.Repository
{
    public interface IAuthRepository
    {
        User GetByEmail(string email);
        User AddUser(User user);
        List<User> GetAll();
        User GetById(int id);
        void Delete(int id);

    }
}
