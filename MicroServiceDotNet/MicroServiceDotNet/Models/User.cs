using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MicroServiceDotNet.Models
{
    [Table("utilisateur", Schema = "dbo")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }
        public string? email { get; set; }
        [JsonIgnore]
        public string? mot_de_passe { get; set; }
        public string? telephone { get; set; }
        public string? nom { get; set; }
        public string? prenom { get; set; }
        public string? role { get; set; }
        public bool est_actif { get; set; } = true;
        public bool est_valide { get; set; } = false;
        public bool EmailConfirmed { get; set; } = false;
        public string? EmailConfirmationToken { get; set; }

        [Column("date_creation")]
        public DateTime? DateCreation { get; set; }
        [Column("photo_profil")]
        public string? photo_profil { get; set; }
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpiry { get; set; }
        public Apprenant? Apprenant { get; set; }
        public Enseignant? Enseignant { get; set; }
        public string? provider { get; set; } = "Local";
        public string? google_id { get; set; }

    }
}
