using MicroServiceDotNet.Services.EmailService;
using System.Net;
using System.Net.Mail;

namespace MicroServiceDotNet.Services.ValidateEmailService
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        // ← IWebHostEnvironment _env supprimé

        public EmailService(IConfiguration config) // ← _env supprimé
        {
            _config = config;
        }

        // ── Envoi générique ───────────────────────────────────────
        private void Send(string toEmail, string subject, string htmlBody)
        {
            var smtpServer = _config["SmtpSettings:SmtpServer"];
            var port = int.Parse(_config["SmtpSettings:Port"]);
            var from = _config["SmtpSettings:From"];
            var username = _config["SmtpSettings:Username"];
            var password = _config["SmtpSettings:Password"];

            // Fix SSL pour Docker
            System.Net.ServicePointManager.ServerCertificateValidationCallback =
                (sender, certificate, chain, errors) => true;

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

        // ── Email confirmation compte ─────────────────────────────
        public void SendEmail(string toEmail, string subject, string confirmationLink)
        {
            Send(toEmail, subject, BuildConfirmEmailHtml(confirmationLink));
        }

        // ── Email enseignant inscription ──────────────────────────
        public void SendEmailEnseignantInscription(string toEmail, string nomComplet)
        {
            Send(toEmail, "9raiti — Votre inscription est en cours de traitement",
                 BuildEnseignantInscriptionHtml(nomComplet));
        }

        // ── Email enseignant validé ───────────────────────────────
        public void SendEmailEnseignantValide(string toEmail, string nomComplet)
        {
            Send(toEmail, "9raiti — Votre compte enseignant est activé !",
                 BuildEnseignantValideHtml(nomComplet));
        }

        // ══════════════════════════════════════════════════════════
        // TEMPLATES HTML (style 9raiti amber/dark)
        // ══════════════════════════════════════════════════════════

        private string BuildConfirmEmailHtml(string link) => $@"<!DOCTYPE html>
<html lang=""fr"">
<head><meta charset=""UTF-8""><meta name=""viewport"" content=""width=device-width,initial-scale=1"">
<title>Confirmez votre compte 9raiti</title></head>
<body style=""margin:0;padding:0;background:#080c14;font-family:'Segoe UI',Arial,sans-serif;"">
<table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#080c14;padding:48px 20px;"">
<tr><td align=""center"">
<table width=""540"" cellpadding=""0"" cellspacing=""0""
       style=""background:#0f1623;border-radius:20px;border:1px solid rgba(255,255,255,.06);
              box-shadow:0 20px 60px rgba(0,0,0,.6);"">
  <!-- HEADER -->
  <tr><td align=""center"" style=""background:linear-gradient(135deg,#F59E0B,#D97706);padding:40px 40px 36px;"">
    <div style=""width:56px;height:56px;background:rgba(0,0,0,.2);border-radius:14px;
                display:inline-block;line-height:56px;text-align:center;
                font-size:26px;font-weight:800;color:white;margin-bottom:16px;"">9</div>
    <div style=""font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;
                color:rgba(0,0,0,.5);margin-bottom:8px;"">9raiti</div>
    <h1 style=""margin:0;color:#fff;font-size:22px;font-weight:700;"">Confirmez votre adresse email</h1>
    <p style=""margin:8px 0 0;color:rgba(255,255,255,.8);font-size:13px;"">
      Une dernière étape pour activer votre compte</p>
  </td></tr>
  <!-- BODY -->
  <tr><td style=""padding:40px;"">
    <table cellpadding=""0"" cellspacing=""0"" style=""margin:0 auto 28px;""><tr><td align=""center"">
      <div style=""width:72px;height:72px;background:rgba(245,158,11,.1);
                  border:2px solid rgba(245,158,11,.3);border-radius:50%;
                  display:inline-block;line-height:72px;text-align:center;font-size:36px;"">✉️</div>
    </td></tr></table>
    <p style=""color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 16px;"">Bonjour,</p>
    <p style=""color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 28px;"">
      Merci de vous être inscrit sur <strong style=""color:#f1f5f9;"">9raiti</strong>.
      Pour activer votre compte, confirmez votre adresse email :</p>
    <table cellpadding=""0"" cellspacing=""0"" style=""width:100%;margin:0 auto 28px;""><tr>
      <td align=""center"" style=""background:linear-gradient(135deg,#F59E0B,#D97706);border-radius:12px;
                                   box-shadow:0 4px 20px rgba(245,158,11,.35);"">
        <a href=""{link}"" style=""display:block;padding:16px 44px;color:#fff;
                                   font-size:15px;font-weight:700;text-decoration:none;"">
          ✅ &nbsp;Confirmer mon compte</a>
      </td>
    </tr></table>
    <div style=""background:rgba(245,158,11,.05);border:1px solid rgba(245,158,11,.15);
                border-radius:12px;padding:16px 20px;margin-bottom:20px;"">
      <p style=""color:#F59E0B;font-weight:700;font-size:13px;margin:0 0 8px;"">
        📚 Après confirmation, vous pourrez :</p>
      <p style=""color:#94a3b8;font-size:13px;margin:3px 0;"">📖 &nbsp;Accéder à tous les cours</p>
      <p style=""color:#94a3b8;font-size:13px;margin:3px 0;"">🎯 &nbsp;Suivre votre progression</p>
      <p style=""color:#94a3b8;font-size:13px;margin:3px 0;"">🏆 &nbsp;Obtenir des certifications</p>
    </div>
    <p style=""color:#475569;font-size:13px;line-height:1.6;margin:0;"">
      ⚠️ Si vous n'avez pas créé de compte, ignorez cet email.
      Ce lien expire dans <strong style=""color:#94a3b8;"">24 heures</strong>.</p>
  </td></tr>
  <!-- FOOTER -->
  <tr><td style=""height:1px;background:rgba(255,255,255,.06);""></td></tr>
  <tr><td align=""center"" style=""padding:24px 40px;"">
    <p style=""margin:0 0 4px;color:#475569;font-size:12px;"">
      © 2025 <strong style=""color:#F59E0B;"">9raiti</strong> — Plateforme E-Learning</p>
    <p style=""margin:0;color:#2d3d52;font-size:11px;"">
      Email automatique, merci de ne pas y répondre.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>";

        private string BuildEnseignantInscriptionHtml(string nomComplet) => $@"<!DOCTYPE html>
<html lang=""fr"">
<head><meta charset=""UTF-8""><meta name=""viewport"" content=""width=device-width,initial-scale=1"">
<title>Inscription en cours — 9raiti</title></head>
<body style=""margin:0;padding:0;background:#080c14;font-family:'Segoe UI',Arial,sans-serif;"">
<table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#080c14;padding:48px 20px;"">
<tr><td align=""center"">
<table width=""540"" cellpadding=""0"" cellspacing=""0""
       style=""background:#0f1623;border-radius:20px;border:1px solid rgba(255,255,255,.06);
              box-shadow:0 20px 60px rgba(0,0,0,.6);"">
  <tr><td align=""center"" style=""background:linear-gradient(135deg,#F59E0B,#D97706);padding:40px 40px 36px;"">
    <div style=""width:56px;height:56px;background:rgba(0,0,0,.2);border-radius:14px;
                display:inline-block;line-height:56px;text-align:center;
                font-size:26px;font-weight:800;color:white;margin-bottom:16px;"">9</div>
    <div style=""font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;
                color:rgba(0,0,0,.5);margin-bottom:8px;"">9raiti</div>
    <h1 style=""margin:0;color:#fff;font-size:22px;font-weight:700;"">Inscription reçue !</h1>
    <p style=""margin:8px 0 0;color:rgba(255,255,255,.8);font-size:13px;"">
      Votre demande est en cours de traitement</p>
  </td></tr>
  <tr><td style=""padding:40px;"">
    <table cellpadding=""0"" cellspacing=""0"" style=""margin:0 auto 28px;""><tr><td align=""center"">
      <div style=""width:72px;height:72px;background:rgba(245,158,11,.1);
                  border:2px solid rgba(245,158,11,.3);border-radius:50%;
                  display:inline-block;line-height:72px;text-align:center;font-size:36px;"">⏳</div>
    </td></tr></table>
    <p style=""color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 16px;"">
      Bonjour <strong style=""color:#f1f5f9;"">{nomComplet}</strong>,</p>
    <p style=""color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 24px;"">
      Nous avons bien reçu votre demande d'inscription en tant
      qu'<strong style=""color:#F59E0B;"">enseignant</strong> sur la plateforme
      <strong style=""color:#f1f5f9;"">9raiti</strong>.</p>
    <div style=""background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.2);
                border-radius:12px;padding:20px 24px;margin-bottom:24px;"">
      <p style=""color:#F59E0B;font-weight:700;font-size:13px;margin:0 0 12px;"">
        📋 Prochaines étapes :</p>
      <p style=""color:#94a3b8;font-size:13px;margin:5px 0;"">
        1️⃣ &nbsp;Vérification de vos informations par l'administrateur</p>
      <p style=""color:#94a3b8;font-size:13px;margin:5px 0;"">
        2️⃣ &nbsp;Activation de votre compte (sous 24–48h)</p>
      <p style=""color:#94a3b8;font-size:13px;margin:5px 0;"">
        3️⃣ &nbsp;Email de confirmation avec accès à la plateforme</p>
    </div>
    <div style=""background:rgba(16,185,129,.05);border:1px solid rgba(16,185,129,.15);
                border-radius:12px;padding:14px 20px;"">
      <p style=""color:#10b981;font-size:13px;margin:0;"">
        ✅ &nbsp;Votre compte sera activé dès validation par notre équipe.</p>
    </div>
  </td></tr>
  <tr><td style=""height:1px;background:rgba(255,255,255,.06);""></td></tr>
  <tr><td align=""center"" style=""padding:24px 40px;"">
    <p style=""margin:0 0 4px;color:#475569;font-size:12px;"">
      © 2025 <strong style=""color:#F59E0B;"">9raiti</strong> — Plateforme E-Learning</p>
    <p style=""margin:0;color:#2d3d52;font-size:11px;"">
      Email automatique, merci de ne pas y répondre.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>";

        private string BuildEnseignantValideHtml(string nomComplet)
        {
            string loginUrl = $"{_config["AppSettings:FrontendUrl"]}/login";
            return $@"<!DOCTYPE html>
<html lang=""fr"">
<head><meta charset=""UTF-8""><meta name=""viewport"" content=""width=device-width,initial-scale=1"">
<title>Compte activé — 9raiti</title></head>
<body style=""margin:0;padding:0;background:#080c14;font-family:'Segoe UI',Arial,sans-serif;"">
<table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#080c14;padding:48px 20px;"">
<tr><td align=""center"">
<table width=""540"" cellpadding=""0"" cellspacing=""0""
       style=""background:#0f1623;border-radius:20px;border:1px solid rgba(255,255,255,.06);
              box-shadow:0 20px 60px rgba(0,0,0,.6);"">
  <tr><td align=""center"" style=""background:linear-gradient(135deg,#F59E0B,#D97706);padding:40px 40px 36px;"">
    <div style=""width:56px;height:56px;background:rgba(0,0,0,.2);border-radius:14px;
                display:inline-block;line-height:56px;text-align:center;
                font-size:26px;font-weight:800;color:white;margin-bottom:16px;"">9</div>
    <div style=""font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;
                color:rgba(0,0,0,.5);margin-bottom:8px;"">9raiti</div>
    <h1 style=""margin:0;color:#fff;font-size:22px;font-weight:700;"">Votre compte est activé !</h1>
    <p style=""margin:8px 0 0;color:rgba(255,255,255,.8);font-size:13px;"">
      Bienvenue sur 9raiti</p>
  </td></tr>
  <tr><td style=""padding:40px;"">
    <table cellpadding=""0"" cellspacing=""0"" style=""margin:0 auto 28px;""><tr><td align=""center"">
      <div style=""width:72px;height:72px;background:rgba(16,185,129,.1);
                  border:2px solid rgba(16,185,129,.3);border-radius:50%;
                  display:inline-block;line-height:72px;text-align:center;font-size:36px;"">✅</div>
    </td></tr></table>
    <p style=""color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 16px;"">
      Bonjour <strong style=""color:#f1f5f9;"">{nomComplet}</strong>,</p>
    <p style=""color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 24px;"">
      Bonne nouvelle ! Votre compte enseignant sur <strong style=""color:#f1f5f9;"">9raiti</strong>
      a été <strong style=""color:#10b981;"">validé et activé</strong>.
      Vous pouvez maintenant accéder à la plateforme.</p>
    <div style=""background:rgba(16,185,129,.05);border:1px solid rgba(16,185,129,.15);
                border-radius:12px;padding:20px 24px;margin-bottom:28px;"">
      <p style=""color:#10b981;font-weight:700;font-size:13px;margin:0 0 10px;"">
        🎓 Accès enseignant accordé :</p>
      <p style=""color:#94a3b8;font-size:13px;margin:4px 0;"">📚 &nbsp;Créer et publier vos cours</p>
      <p style=""color:#94a3b8;font-size:13px;margin:4px 0;"">📦 &nbsp;Gérer vos modules et catégories</p>
      <p style=""color:#94a3b8;font-size:13px;margin:4px 0;"">👥 &nbsp;Suivre la progression de vos apprenants</p>
    </div>
    <table cellpadding=""0"" cellspacing=""0"" style=""width:100%;margin:0 auto 0;""><tr>
      <td align=""center"" style=""background:linear-gradient(135deg,#F59E0B,#D97706);border-radius:12px;
                                   box-shadow:0 4px 20px rgba(245,158,11,.35);"">
        <a href=""{loginUrl}"" style=""display:block;padding:16px 44px;color:#fff;
                                       font-size:15px;font-weight:700;text-decoration:none;"">
          Accéder à mon espace enseignant →</a>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style=""height:1px;background:rgba(255,255,255,.06);""></td></tr>
  <tr><td align=""center"" style=""padding:24px 40px;"">
    <p style=""margin:0 0 4px;color:#475569;font-size:12px;"">
      © 2025 <strong style=""color:#F59E0B;"">9raiti</strong> — Plateforme E-Learning</p>
    <p style=""margin:0;color:#2d3d52;font-size:11px;"">
      Email automatique, merci de ne pas y répondre.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>";
        }
    }
}