using System.ComponentModel.DataAnnotations;

namespace MicroServiceDotNet.ViewModels
{
    public class UpdateProfileUserVM
    {
        public string? email { get; set; }
        public string? mot_de_passe { get; set; }

        [Compare("mot_de_passe", ErrorMessage = "Les mots de passe ne correspondent pas")]
        public string? confirmation_mot_de_passe { get; set; }
        public string? telephone { get; set; }
        public string? nom { get; set; }
        public string? prenom { get; set; }
        public string? niveau_scolaire { get; set; } 
        public string? statut { get; set; } 
        public double? score { get; set; } 
        public string? specialite { get; set; }
    }
}
