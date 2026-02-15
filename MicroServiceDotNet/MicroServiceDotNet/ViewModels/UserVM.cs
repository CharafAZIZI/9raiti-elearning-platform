namespace MicroServiceDotNet.ViewModels
{
    public class UserVM
    {
        public int id { get; set; }
        public string email { get; set; }
        public string nom { get; set; }
        public string prenom { get; set; }
        public string role { get; set; }
        public bool est_actif { get; set; }
        public bool est_valide { get; set; }
    }
}
