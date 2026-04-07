namespace MicroServiceDotNet.Services.TemplateService
{
    public class TemplateService : ITemplateService
    {
        private readonly IWebHostEnvironment _env;

        public TemplateService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public string GetResetPasswordEmail(string resetLink)
        {
            var path = Path.Combine(_env.WebRootPath, "reset-email.html");

            if (!File.Exists(path))
                return $"Cliquez ici : {resetLink}";

            var html = File.ReadAllText(path);
            return html.Replace("{{RESET_LINK}}", resetLink);
        }
    }
}
