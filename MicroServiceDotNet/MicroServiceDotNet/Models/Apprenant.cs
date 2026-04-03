using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MicroServiceDotNet.Models
{
    [Table("apprenant")]
    public class Apprenant
    {
        [Key]
        public int id { get; set; }

        [MaxLength(100)]
        public string? niveau_scolaire { get; set; }

        [MaxLength(20)]
        public string? statut { get; set; }

        public double? score { get; set; }

        [ForeignKey("id")]
        public User User { get; set; }
    }
}