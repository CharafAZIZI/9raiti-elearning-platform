namespace MicroServiceDotNet.Services.ValidateEmailService
{
    public interface IEmailService
    {
        void SendEmail(string toEmail, string subject, string body);
        void SendEmailEnseignantInscription(string toEmail, string nomComplet);
        void SendEmailEnseignantValide(string toEmail, string nomComplet);
    }
}
