using Google.Apis.Auth;

namespace MicroServiceDotNet.Services.AuthService
{
    public class GoogleAuthService : IGoogleAuthService
    {
        private readonly IConfiguration _configuration;
        public GoogleAuthService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public GoogleJsonWebSignature.Payload ValidateToken(string idToken)
        {
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new List<string> { _configuration["GoogleAuth:ClientId"] }
                };
                return GoogleJsonWebSignature.ValidateAsync(idToken, settings).GetAwaiter().GetResult();
            }
            catch (Exception ex)
            {
                throw new Exception("Token Google invalide", ex);
            }
        }
    }
}
