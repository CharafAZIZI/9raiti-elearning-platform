using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MicroServiceDotNet.Models
{
    [Table("utilisateur")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [Required]
        [MaxLength(150)]
        public string email { get; set; }

        [Required]
        [JsonIgnore]
        public string mot_de_passe { get; set; }

        [MaxLength(20)]
        public string? telephone { get; set; }

        [Required]
        [MaxLength(100)]
        public string nom { get; set; }

        [Required]
        [MaxLength(100)]
        public string prenom { get; set; }

        [Required]
        [MaxLength(20)]
        public string role { get; set; } = "APPRENANT";

        public bool est_actif { get; set; } = true;
        public bool est_valide { get; set; } = false;
        public bool EmailConfirmed { get; set; } = false;

        public string? EmailConfirmationToken { get; set; }

        [Column("date_creation")]
        public DateTime DateCreation { get; set; } = DateTime.Now;

        public string? photo_profil { get; set; }

        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpiry { get; set; }

        public string provider { get; set; } = "Local";
        public string? google_id { get; set; }

        public Apprenant? Apprenant { get; set; }
        public Enseignant? Enseignant { get; set; }
    }
}