using MicroServiceDotNet.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace MicroServiceDotNet.Models
{
    [Table("utilisateur", Schema = "dbo")]
    public class User
    {
        public int id { get; set; }
        public string email { get; set; }
        public string telephone { get; set; }
        public string mot_de_passe { get; set; }
        public string nom { get; set; }
        public string prenom { get; set; }
        public Role role { get; set; }
        public bool est_actif { get; set; }
        public bool est_valide { get; set; }
        public DateTime DateCreation { get; set; }
        public string? PhotoProfil { get; set; }
    }
}
