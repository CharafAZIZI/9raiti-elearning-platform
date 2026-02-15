using System.ComponentModel.DataAnnotations.Schema;

namespace MicroServiceDotNet.Models
{
    [Table("utilisateur", Schema = "dbo")]
    public class User
    {
        public int id { get; set; }
        public string email { get; set; }
        public string mot_de_passe { get; set; }
        public bool est_actif { get; set; }
        public bool est_valide { get; set; }
    }
}
