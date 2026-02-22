using System.ComponentModel.DataAnnotations;

namespace MicroServiceDotNet.DTO.LoginUser
{
    public class LoginRequest
    {
        [Required]
        public string email { get; set; }
        [Required]
        public string mot_de_passe { get; set; }
    }
}
