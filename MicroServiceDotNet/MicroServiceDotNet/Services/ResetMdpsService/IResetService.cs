namespace MicroServiceDotNet.Services.EmailService
{
    public interface IResetService
    {
        void EnvoyerEmail(string destinataire, string sujet, string corps);

    }
}