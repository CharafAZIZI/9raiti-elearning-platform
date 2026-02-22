using MicroServiceDotNet.Services;
using System.Net;
using System.Net.Mail;

public class EmailService : IEmailService
{
    public void SendEmail(string to, string subject, string body)
    {
        var smtpClient = new SmtpClient("smtp.gmail.com")
        {
            Port = 587,
            Credentials = new NetworkCredential("tonemail@gmail.com", "mot_de_passe_app"),
            EnableSsl = true,
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress("tonemail@gmail.com"),
            Subject = subject,
            Body = body,
            IsBodyHtml = true,
        };

        mailMessage.To.Add(to);

        smtpClient.Send(mailMessage);
    }
}