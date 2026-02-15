using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Linq;
using System.Security.Claims;

namespace MicroServiceDotNet.Filters
{
    public class RoleFilter : IAuthorizationFilter
    {
        private readonly string[] _roles;

        public RoleFilter(params string[] roles)
        {
            _roles = roles;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;

            if (!user.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult(); // 401
                return;
            }

            var role = user.FindFirst(ClaimTypes.Role)?.Value;

            if (!_roles.Contains(role))
            {
                context.Result = new ForbidResult(); // 403
                return;
            }
        }
    }
}
