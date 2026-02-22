namespace MicroServiceDotNet.Services.TokenBlacklistService
{
    public class TokenBlacklistService : ITokenBlacklistService
    {
        private static List<string> _blacklistedTokens = new List<string>();

        public void AddToBlacklist(string token)
        {
            _blacklistedTokens.Add(token);
        }

        public bool IsBlacklisted(string token)
        {
            return _blacklistedTokens.Contains(token);
        }
    }
}
