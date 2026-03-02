using MicroServiceDotNet.DTO.ManageProfileUser;

namespace MicroServiceDotNet.Services.ProfileService
{
    public interface IProfileService
    {
        object GetMyProfile(int userId);
        object UpdateUser(int userId, UpdateProfileUserVM UpdateVM);
    }
}
