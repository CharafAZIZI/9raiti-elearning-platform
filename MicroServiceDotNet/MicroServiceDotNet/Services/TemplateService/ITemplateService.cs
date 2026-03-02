namespace MicroServiceDotNet.Services.TemplateService
{
    public interface ITemplateService
    {
        string GetResetPasswordEmail(string resetLink);
    }
}
