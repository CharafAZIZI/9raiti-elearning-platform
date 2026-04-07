using MicroServiceDotNet.DTO.ManageProfileUser;
using MicroServiceDotNet.Services.ProfileService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Authorize]
[ApiController]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _service;

    public ProfileController(IProfileService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult GetMyProfile()
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier).Value
        );

        var profile = _service.GetMyProfile(userId);

        return Ok(profile);
    }

    [Authorize]
    [HttpPut]
    public IActionResult UpdateMyProfile([FromBody] UpdateProfileUserVM UpdateVM)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
        var updatedProfile = _service.UpdateUser(userId, UpdateVM);
        return Ok(updatedProfile);
    }

    [HttpPost("update-photo")]
    public IActionResult UpdatePhoto([FromForm] IFormFile file)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        var result = _service.UpdatePhoto(userId, file);

        if (!(bool)result.GetType().GetProperty("success").GetValue(result))
            return BadRequest(result);

        return Ok(result);
    }

}
