namespace MicroServiceDotNet.Services
{
    public interface ITokenBlacklistService
    {
        void AddToBlacklist(string token);
        bool IsBlacklisted(string token);
    }
}
