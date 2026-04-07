using Microsoft.EntityFrameworkCore;
using Réclamation.Models;

namespace Réclamation.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Reclamation> Reclamations { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Reclamation>()
                .ToTable("Reclamation");  // ← ligne ajoutée

            modelBuilder.Entity<Reclamation>()
                .HasKey(r => r.Id);

            modelBuilder.Entity<Reclamation>()
                .Property(r => r.Email)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<Reclamation>()
                .Property(r => r.TypeReclamation)
                .IsRequired()
                .HasMaxLength(50);

            modelBuilder.Entity<Reclamation>()
                .Property(r => r.Message)
                .IsRequired();
        }
    }
}