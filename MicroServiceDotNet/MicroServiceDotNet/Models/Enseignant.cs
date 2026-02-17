using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MicroServiceDotNet.Models
{
    [Table("enseignant", Schema = "dbo")]
    public class Enseignant
    {
        [Key]
        [ForeignKey("User")]
        public int id { get; set; }

        public string? specialite { get; set; }
        public DateTime? date_embauche { get; set; }

        public User User { get; set; }
    }
}
