using MicroServiceDotNet.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace MicroServiceDotNet.Filters
{
    public class TokenBlacklistFilter : IAuthorizationFilter
    {
        private readonly ITokenBlacklistService _blacklist;

        public TokenBlacklistFilter(ITokenBlacklistService blacklist)
        {
            _blacklist = blacklist;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var token = context.HttpContext.Request.Headers["Authorization"]
                .ToString()
                .Replace("Bearer ", "");

            if (_blacklist.IsBlacklisted(token))
            {
                context.Result = new UnauthorizedResult();
            }
        }
    }
}
