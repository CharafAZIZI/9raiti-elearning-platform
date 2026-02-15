namespace MicroServiceDotNet.ViewModels
{
    public class LoginResult
    {
        public bool Success { get; set; }
        public bool IsBlocked { get; set; }
        public string Token { get; set; }
    }
}
