using MicroServiceDotNet.DTO.ManageUser;
using MicroServiceDotNet.DTO.RegisterUser;
using MicroServiceDotNet.Models;

namespace MicroServiceDotNet.Services.UserRoleService
{
    public interface IUserRoleService
    {
        User RegisterUser(RegisterUserVM vm);
        User CreateUser(CreateUserVM vm);
    }
}
