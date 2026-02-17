using MicroServiceDotNet.ViewModels;

namespace MicroServiceDotNet.Services
{
    public interface IProfileService
    {
        object GetMyProfile(int userId);
        object UpdateUser(int userId, UpdateProfileUserVM dto);
    }
}
