namespace MicroServiceDotNet.Services.ValidateEmailService
{
    public interface IEmailService
    {
        void SendEmail(string toEmail, string subject, string body);
    }
}
