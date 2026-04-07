using MailKit.Net.Smtp;
using MicroServiceDotNet.DTO;
using MicroServiceDotNet.DTO.ResetPassword;
using Microsoft.Extensions.Options;
using MimeKit;

namespace MicroServiceDotNet.Services.EmailService
{
    public class ResetService : IResetService
    {
        private readonly SmtpSettings _smtp;

        public ResetService(IOptions<SmtpSettings> smtpOptions)
        {
            _smtp = smtpOptions.Value;
        }

        public void EnvoyerEmail(string destinataire, string sujet, string corps)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_smtp.SenderName, _smtp.SenderEmail));
            message.To.Add(new MailboxAddress("", destinataire));
            message.Subject = sujet;
            message.Body = new TextPart("html") { Text = corps };
            using var client = new SmtpClient();
            client.Connect(_smtp.SmtpServer, _smtp.Port, MailKit.Security.SecureSocketOptions.StartTls);
            client.Authenticate(_smtp.Username, _smtp.Password);
            client.Send(message);
            client.Disconnect(true);
        }
    }
}