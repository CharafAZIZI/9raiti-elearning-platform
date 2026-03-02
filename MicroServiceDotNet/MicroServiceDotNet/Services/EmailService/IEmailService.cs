namespace MicroServiceDotNet.Services.EmailService
{
    public interface IEmailService
    {
        void EnvoyerEmail(string destinataire, string sujet, string corps);
    }
}