namespace Réclamation.Models
{
    public class Reclamation
    {
        public int Id { get; set; }

        public string Email { get; set; } = string.Empty;

        public string TypeReclamation { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public DateTime DateCreation { get; set; } = DateTime.UtcNow;
    }
}
