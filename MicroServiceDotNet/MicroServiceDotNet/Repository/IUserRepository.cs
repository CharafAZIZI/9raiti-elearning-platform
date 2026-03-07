using Google.Apis.Auth;
using MicroServiceDotNet.Models;

namespace MicroServiceDotNet.Repository
{
    public interface IUserRepository
    {
        User GetByEmail(string email);
        User AddUser(User user);
        List<User> GetAll();
        User GetById(int id);
        void Delete(int id);
        void Update(User user);
<<<<<<< HEAD
        User GetByConfirmationToken(string token);

=======
        public User GetOrCreateFromGooglePayload(GoogleJsonWebSignature.Payload payload);
>>>>>>> 0d4fa9da73c6ff7f066946d733aa1662500032dc
    }
}