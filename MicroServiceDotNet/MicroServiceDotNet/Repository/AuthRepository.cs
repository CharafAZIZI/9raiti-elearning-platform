using MicroServiceDotNet.Data;
using MicroServiceDotNet.Models;

namespace MicroServiceDotNet.Repository
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppDbContext _context;

        public AuthRepository(AppDbContext context)
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

    }
}
