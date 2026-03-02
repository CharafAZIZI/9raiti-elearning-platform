using System.ComponentModel.DataAnnotations;

namespace MicroServiceDotNet.DTO.RegisterUser
{
    public class RegisterUserVM
    {
        [Required]
        public string nom { get; set; }
        [Required]
        public string prenom { get; set; }
        [Required]
        [EmailAddress]
        public string email { get; set; }
        [Phone]
        public string? telephone { get; set; }
        [Required]
        [MinLength(6)]
        public string mot_de_passe { get; set; }
        [Required]
        [Compare("mot_de_passe", ErrorMessage = "Les mots de passe ne correspondent pas")]
        public string confirmation_mot_de_passe { get; set; }
        [Required]
        public string role { get; set; }
    }
}
