using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MicroServiceDotNet.Models
{
    [Table("apprenant", Schema = "dbo")]
    public class Apprenant
    {
        [Key]
        [ForeignKey("User")]
        public int id { get; set; }

        public string? niveau_scolaire { get; set; }
        public DateTime? date_inscription { get; set; }
        public string? statut { get; set; }
        public double? score { get; set; }

        public User User { get; set; }
    }
}
