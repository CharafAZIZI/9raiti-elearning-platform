using MicroServiceDotNet.Services.AuthService;
using System.Net;
using System.Net.Mail;

namespace MicroServiceDotNet.Services.EmailService
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly IWebHostEnvironment _env;

        public EmailService(IConfiguration config, IWebHostEnvironment env)
        {
            _config = config;
            _env = env;
        }

        public void SendEmail(string toEmail, string subject, string confirmationLink)
        {
            try
            {
                var smtpServer = _config["EmailSettings:SmtpServer"];
                var port = int.Parse(_config["EmailSettings:Port"]);
                var from = _config["EmailSettings:From"];
                var username = _config["EmailSettings:Username"];
                var password = _config["EmailSettings:Password"];

                using (SmtpClient client = new SmtpClient(smtpServer, port))
                {
                    client.UseDefaultCredentials = false;
                    client.Credentials = new NetworkCredential(username, password);
                    client.EnableSsl = true;

                    string htmlBody = GetHtmlBody(confirmationLink);

                    using (MailMessage mail = new MailMessage(from, toEmail, subject, htmlBody))
                    {
                        mail.IsBodyHtml = true;
                        client.Send(mail);
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Erreur envoi email : " + ex.Message);
            }
        }

        private string GetHtmlBody(string link)
        {
            string templatePath = Path.Combine(
                _env.WebRootPath,
                "email-templates",
                "ConfirmEmailTemplate.html");

            string html = File.ReadAllText(templatePath);

            return html.Replace("{{LINK}}", link);
        }
    }
}