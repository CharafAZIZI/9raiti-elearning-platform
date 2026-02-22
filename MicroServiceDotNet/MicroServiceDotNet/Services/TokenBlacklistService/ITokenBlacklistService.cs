namespace MicroServiceDotNet.Services.TokenBlacklistService
{
    public interface ITokenBlacklistService
    {
        void AddToBlacklist(string token);
        bool IsBlacklisted(string token);
    }
}
