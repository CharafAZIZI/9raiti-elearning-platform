namespace MicroServiceDotNet.DTO.LoginUser
{
    public class LoginResponse
    {
        public string Email { get; set; }
        public string Role { get; set; }
        public string Token { get; set; }
        public DateTime Expiration { get; set; }

    }
}
