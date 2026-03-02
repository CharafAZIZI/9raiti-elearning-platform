namespace MicroServiceDotNet.Services.AuthService
{
    public interface IEmailService
    {
        void SendEmail(string toEmail, string subject, string body);
    }
}
