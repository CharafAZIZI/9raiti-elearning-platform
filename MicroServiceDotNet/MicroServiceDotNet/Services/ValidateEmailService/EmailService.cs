using MicroServiceDotNet.Services.EmailService;
using System.Net;
using System.Net.Mail;

namespace MicroServiceDotNet.Services.ValidateEmailService
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
            var smtpServer = _config["SmtpSettings:SmtpServer"];
            var port = int.Parse(_config["SmtpSettings:Port"]);
            var from = _config["SmtpSettings:From"];
            var username = _config["SmtpSettings:Username"];
            var password = _config["SmtpSettings:Password"];

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

        // ── Email inscription enseignant ─────────────────────────────
        public void SendEmailEnseignantInscription(string toEmail, string nomComplet)
        {
            var smtpServer = _config["SmtpSettings:SmtpServer"];
            var port = int.Parse(_config["SmtpSettings:Port"]);
            var from = _config["SmtpSettings:From"];
            var username = _config["SmtpSettings:Username"];
            var password = _config["SmtpSettings:Password"];

            string subject = "9raiti — Votre inscription est en cours de traitement";
            string htmlBody = GetHtmlBodyEnseignantInscription(nomComplet);

            using var client = new SmtpClient(smtpServer, port)
            {
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true
            };

            using var mail = new MailMessage(from, toEmail, subject, htmlBody)
            {
                IsBodyHtml = true
            };

            client.Send(mail);
        }

        // ── Email validation admin ────────────────────────────────────
        public void SendEmailEnseignantValide(string toEmail, string nomComplet)
        {
            var smtpServer = _config["SmtpSettings:SmtpServer"];
            var port = int.Parse(_config["SmtpSettings:Port"]);
            var from = _config["SmtpSettings:From"];
            var username = _config["SmtpSettings:Username"];
            var password = _config["SmtpSettings:Password"];

            string subject = "9raiti — Votre compte enseignant est activé !";
            string htmlBody = GetHtmlBodyEnseignantValide(nomComplet);

            using var client = new SmtpClient(smtpServer, port)
            {
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true
            };

            using var mail = new MailMessage(from, toEmail, subject, htmlBody)
            {
                IsBodyHtml = true
            };

            client.Send(mail);
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

        private string GetHtmlBodyEnseignantInscription(string nomComplet)
        {
            return $@"
<!DOCTYPE html>
<html lang=""fr"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>Inscription en cours</title>
</head>
<body style=""margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;"">

  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#f8fafc;padding:40px 20px;"">
    <tr>
      <td align=""center"">
        <table width=""600"" cellpadding=""0"" cellspacing=""0""
               style=""background:#ffffff;border-radius:16px;overflow:hidden;
                      box-shadow:0 4px 24px rgba(0,0,0,0.08);"">

          <!-- Header -->
          <tr>
            <td style=""background:linear-gradient(135deg,#F59E0B,#D97706);
                        padding:36px 40px;text-align:center;"">
              <div style=""width:56px;height:56px;background:rgba(255,255,255,0.2);
                           border-radius:14px;display:inline-flex;align-items:center;
                           justify-content:center;font-size:28px;font-weight:bold;
                           color:white;margin-bottom:12px;"">9</div>
              <h1 style=""color:white;margin:0;font-size:24px;font-weight:700;
                          letter-spacing:-0.5px;"">9raiti</h1>
              <p style=""color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px;"">
                Plateforme E-Learning
              </p>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style=""padding:40px;"">

              <!-- Icône statut -->
              <div style=""text-align:center;margin-bottom:28px;"">
                <div style=""width:72px;height:72px;background:#FEF3C7;border-radius:50%;
                             display:inline-flex;align-items:center;justify-content:center;
                             font-size:36px;"">⏳</div>
              </div>

              <h2 style=""color:#0f172a;font-size:22px;font-weight:700;
                          margin:0 0 12px;text-align:center;"">
                Inscription reçue avec succès
              </h2>

              <p style=""color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;"">
                Bonjour <strong style=""color:#0f172a;"">{nomComplet}</strong>,
              </p>

              <p style=""color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;"">
                Nous avons bien reçu votre demande d'inscription en tant qu'<strong>enseignant</strong>
                sur la plateforme <strong>9raiti</strong>.
              </p>

              <!-- Encadré statut -->
              <div style=""background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;
                           padding:20px 24px;margin:24px 0;"">
                <div style=""display:flex;align-items:flex-start;gap:12px;"">
                  <span style=""font-size:20px;margin-top:2px;"">📋</span>
                  <div>
                    <p style=""color:#92400E;font-weight:700;font-size:14px;margin:0 0 6px;"">
                      Compte en cours de traitement
                    </p>
                    <p style=""color:#B45309;font-size:13px;line-height:1.6;margin:0;"">
                      Votre compte est actuellement en attente de validation par notre équipe administrative.
                      Vous recevrez un email de confirmation dès que votre compte sera activé.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Étapes -->
              <p style=""color:#0f172a;font-weight:700;font-size:14px;margin:24px 0 12px;"">
                Prochaines étapes :
              </p>
              <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
                <tr>
                  <td style=""padding:8px 0;"">
                    <div style=""display:flex;align-items:center;gap:12px;"">
                      <div style=""width:32px;height:32px;background:#F59E0B;border-radius:50%;
                                   color:white;font-weight:700;font-size:14px;
                                   display:inline-flex;align-items:center;
                                   justify-content:center;flex-shrink:0;"">1</div>
                      <span style=""color:#475569;font-size:14px;"">
                        Vérification de vos informations par l'administrateur
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style=""padding:8px 0;"">
                    <div style=""display:flex;align-items:center;gap:12px;"">
                      <div style=""width:32px;height:32px;background:#F59E0B;border-radius:50%;
                                   color:white;font-weight:700;font-size:14px;
                                   display:inline-flex;align-items:center;
                                   justify-content:center;flex-shrink:0;"">2</div>
                      <span style=""color:#475569;font-size:14px;"">
                        Activation de votre compte (sous 24–48h)
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style=""padding:8px 0;"">
                    <div style=""display:flex;align-items:center;gap:12px;"">
                      <div style=""width:32px;height:32px;background:#F59E0B;border-radius:50%;
                                   color:white;font-weight:700;font-size:14px;
                                   display:inline-flex;align-items:center;
                                   justify-content:center;flex-shrink:0;"">3</div>
                      <span style=""color:#475569;font-size:14px;"">
                        Email de confirmation avec accès à la plateforme
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style=""background:#f8fafc;border-top:1px solid #e2e8f0;
                        padding:24px 40px;text-align:center;"">
              <p style=""color:#94a3b8;font-size:12px;margin:0;"">
                © 2025 9raiti — Plateforme E-Learning<br>
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>";
        }

        private string GetHtmlBodyEnseignantValide(string nomComplet)
        {
            string loginUrl = "http://localhost:4200/login";

            return $@"
<!DOCTYPE html>
<html lang=""fr"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>Compte activé</title>
</head>
<body style=""margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;"">

  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#f8fafc;padding:40px 20px;"">
    <tr>
      <td align=""center"">
        <table width=""600"" cellpadding=""0"" cellspacing=""0""
               style=""background:#ffffff;border-radius:16px;overflow:hidden;
                      box-shadow:0 4px 24px rgba(0,0,0,0.08);"">

          <!-- Header -->
          <tr>
            <td style=""background:linear-gradient(135deg,#F59E0B,#D97706);
                        padding:36px 40px;text-align:center;"">
              <div style=""width:56px;height:56px;background:rgba(255,255,255,0.2);
                           border-radius:14px;display:inline-flex;align-items:center;
                           justify-content:center;font-size:28px;font-weight:bold;
                           color:white;margin-bottom:12px;"">9</div>
              <h1 style=""color:white;margin:0;font-size:24px;font-weight:700;"">9raiti</h1>
              <p style=""color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px;"">
                Plateforme E-Learning
              </p>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style=""padding:40px;"">

              <!-- Icône succès -->
              <div style=""text-align:center;margin-bottom:28px;"">
                <div style=""width:72px;height:72px;background:#D1FAE5;border-radius:50%;
                             display:inline-flex;align-items:center;justify-content:center;
                             font-size:36px;"">✅</div>
              </div>

              <h2 style=""color:#0f172a;font-size:22px;font-weight:700;
                          margin:0 0 12px;text-align:center;"">
                Votre compte est activé !
              </h2>

              <p style=""color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;"">
                Bonjour <strong style=""color:#0f172a;"">{nomComplet}</strong>,
              </p>

              <p style=""color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;"">
                Bonne nouvelle ! Votre compte enseignant sur <strong>9raiti</strong>
                a été <strong style=""color:#059669;"">validé et activé</strong> par notre équipe.
                Vous pouvez dès maintenant accéder à la plateforme.
              </p>

              <!-- Encadré succès -->
              <div style=""background:#ECFDF5;border:1px solid #A7F3D0;border-radius:12px;
                           padding:20px 24px;margin:24px 0;"">
                <div style=""display:flex;align-items:flex-start;gap:12px;"">
                  <span style=""font-size:20px;margin-top:2px;"">🎓</span>
                  <div>
                    <p style=""color:#065F46;font-weight:700;font-size:14px;margin:0 0 6px;"">
                      Accès enseignant accordé
                    </p>
                    <p style=""color:#047857;font-size:13px;line-height:1.6;margin:0;"">
                      Vous avez maintenant accès à toutes les fonctionnalités enseignant :
                      création de cours, gestion des modules, suivi des apprenants.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Bouton connexion -->
              <div style=""text-align:center;margin:32px 0;"">
                <a href=""{loginUrl}""
                   style=""display:inline-block;background:linear-gradient(135deg,#F59E0B,#D97706);
                          color:white;text-decoration:none;padding:14px 40px;
                          border-radius:12px;font-weight:700;font-size:15px;
                          box-shadow:0 4px 16px rgba(245,158,11,0.35);"">
                  Accéder à mon espace enseignant →
                </a>
              </div>

              <!-- Fonctionnalités -->
              <p style=""color:#0f172a;font-weight:700;font-size:14px;margin:0 0 12px;"">
                Ce que vous pouvez faire maintenant :
              </p>
              <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
                <tr>
                  <td style=""padding:6px 0;"">
                    <span style=""color:#475569;font-size:14px;"">
                      📚 &nbsp;Créer et publier vos cours
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style=""padding:6px 0;"">
                    <span style=""color:#475569;font-size:14px;"">
                      📦 &nbsp;Gérer vos modules et catégories
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style=""padding:6px 0;"">
                    <span style=""color:#475569;font-size:14px;"">
                      👥 &nbsp;Suivre la progression de vos apprenants
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style=""padding:6px 0;"">
                    <span style=""color:#475569;font-size:14px;"">
                      📝 &nbsp;Créer des évaluations et quiz
                    </span>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style=""background:#f8fafc;border-top:1px solid #e2e8f0;
                        padding:24px 40px;text-align:center;"">
              <p style=""color:#94a3b8;font-size:12px;margin:0;"">
                © 2025 9raiti — Plateforme E-Learning<br>
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>";
        }
    }
}