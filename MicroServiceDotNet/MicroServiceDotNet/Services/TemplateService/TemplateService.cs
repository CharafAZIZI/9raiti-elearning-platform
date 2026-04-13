namespace MicroServiceDotNet.Services.TemplateService
{
    public class TemplateService : ITemplateService
    {
        private readonly IConfiguration _config;

        public TemplateService(IConfiguration config) // ← _env supprimé
        {
            _config = config;
        }

        public string GetResetPasswordEmail(string resetLink) =>
            $@"<!DOCTYPE html>
<html lang=""fr"">
<head><meta charset=""UTF-8""><meta name=""viewport"" content=""width=device-width,initial-scale=1"">
<title>Réinitialisation mot de passe — 9raiti</title></head>
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
    <h1 style=""margin:0;color:#fff;font-size:22px;font-weight:700;"">
      Réinitialisation de mot de passe</h1>
    <p style=""margin:8px 0 0;color:rgba(255,255,255,.8);font-size:13px;"">
      Une demande a été effectuée pour votre compte</p>
  </td></tr>
  <tr><td style=""padding:40px;"">
    <table cellpadding=""0"" cellspacing=""0"" style=""margin:0 auto 28px;""><tr><td align=""center"">
      <div style=""width:72px;height:72px;background:rgba(245,158,11,.1);
                  border:2px solid rgba(245,158,11,.3);border-radius:50%;
                  display:inline-block;line-height:72px;text-align:center;font-size:36px;"">🔐</div>
    </td></tr></table>
    <p style=""color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 16px;"">Bonjour,</p>
    <p style=""color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 20px;"">
      Nous avons reçu une demande de réinitialisation de mot de passe
      pour votre compte <strong style=""color:#f1f5f9;"">9raiti</strong>.</p>
    <div style=""background:rgba(249,115,22,.07);border:1px solid rgba(249,115,22,.2);
                border-radius:12px;padding:14px 20px;margin-bottom:24px;"">
      <p style=""color:#fb923c;font-size:13px;margin:0;"">
        ⏱️ <strong>Ce lien est valable 30 minutes uniquement.</strong></p>
    </div>
    <table cellpadding=""0"" cellspacing=""0"" style=""width:100%;margin:0 auto 24px;""><tr>
      <td align=""center"" style=""background:linear-gradient(135deg,#F59E0B,#D97706);border-radius:12px;
                                   box-shadow:0 4px 20px rgba(245,158,11,.35);"">
        <a href=""{resetLink}"" style=""display:block;padding:16px 44px;color:#fff;
                                        font-size:15px;font-weight:700;text-decoration:none;"">
          🔑 &nbsp;Réinitialiser mon mot de passe</a>
      </td>
    </tr></table>
    <div style=""background:rgba(16,185,129,.05);border:1px solid rgba(16,185,129,.15);
                border-radius:12px;padding:16px 20px;margin-bottom:20px;"">
      <p style=""color:#10b981;font-weight:700;font-size:13px;margin:0 0 8px;"">
        🛡️ Conseils pour un mot de passe sécurisé :</p>
      <p style=""color:#94a3b8;font-size:13px;margin:3px 0;"">✓ &nbsp;Au moins 8 caractères</p>
      <p style=""color:#94a3b8;font-size:13px;margin:3px 0;"">✓ &nbsp;Une lettre majuscule</p>
      <p style=""color:#94a3b8;font-size:13px;margin:3px 0;"">✓ &nbsp;Un chiffre et un caractère spécial</p>
    </div>
    <p style=""color:#475569;font-size:13px;line-height:1.6;margin:0;"">
      🔒 Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
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