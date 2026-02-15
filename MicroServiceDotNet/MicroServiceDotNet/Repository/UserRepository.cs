using MicroServiceDotNet.Data;
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
    }
}
