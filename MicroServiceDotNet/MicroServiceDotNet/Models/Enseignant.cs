using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MicroServiceDotNet.Models
{
    [Table("enseignant")]
    public class Enseignant
    {
        [Key]
        public int id { get; set; }

        [MaxLength(150)]
        public string? specialite { get; set; }

        public DateTime? date_embauche { get; set; }

        [ForeignKey("id")]
        public User User { get; set; }
    }
}