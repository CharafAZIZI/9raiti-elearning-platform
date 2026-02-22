using MicroServiceDotNet.Models;

namespace MicroServiceDotNet.Services.JwtService
{
    public interface IJwtService
    {
        string GenerateToken(User user, out DateTime expiration);
    }
}
