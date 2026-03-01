using Google.Apis.Auth;

namespace MicroServiceDotNet.Services.AuthService
{
    public interface IGoogleAuthService
    {
        GoogleJsonWebSignature.Payload ValidateToken(string idToken);
    }
}
