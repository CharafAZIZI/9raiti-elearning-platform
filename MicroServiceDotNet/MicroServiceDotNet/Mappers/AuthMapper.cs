using MicroServiceDotNet.Models;
using MicroServiceDotNet.ViewModels;

namespace MicroServiceDotNet.Mappers
{
    public static class AuthMapper
    {
        public static LoginResponse ToLoginResponse(User user, LoginResult result)
        {
            return new LoginResponse
            {
                Email = user.email,
                Role = result.Role,
                Token = result.Token,
                Expiration = result.Expiration
            };
        }
    }
}
