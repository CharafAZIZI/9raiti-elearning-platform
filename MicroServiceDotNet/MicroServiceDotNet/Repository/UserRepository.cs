using Google.Apis.Auth;
using MicroServiceDotNet.Data;
using MicroServiceDotNet.Mappers;
using MicroServiceDotNet.Models;

namespace MicroServiceDotNet.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public User GetByEmail(string email)
        {
            return _context.Users.FirstOrDefault(u => u.email == email);
        }

        public User AddUser(User user)
        {
            _context.Users.Add(user);
            _context.SaveChanges();
            return user;
        }

        public List<User> GetAll()
        {
            return _context.Users.ToList();
        }

        public User GetById(int id)
        {
            return _context.Users.Find(id);
        }

        public void Delete(int id)
        {
            var user = GetById(id);
            _context.Users.Remove(user);
            _context.SaveChanges();
        }

        public void Update(User user)
        {
            _context.Users.Update(user);
            _context.SaveChanges();
        }

        public User GetOrCreateFromGooglePayload(GoogleJsonWebSignature.Payload payload)
        {
            var user = GetByEmail(payload.Email);
            if (user != null) return user;

            user = AuthMapper.FromGooglePayload(payload);
            AddUser(user);
            return user;
        }
    }
}
