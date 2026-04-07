using Microsoft.EntityFrameworkCore;
using MicroServiceDotNet.Models;

namespace MicroServiceDotNet.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Apprenant> Apprenants { get; set; }
        public DbSet<Enseignant> Enseignants { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 🔹 Table utilisateur
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("utilisateur");

                entity.HasIndex(u => u.email).IsUnique(); // UNIQUE(email)

                entity.Property(u => u.role)
                      .HasDefaultValue("APPRENANT");

                entity.Property(u => u.DateCreation)
                      .HasDefaultValueSql("GETDATE()");

                entity.Property(u => u.est_actif)
                      .HasDefaultValue(true);

                entity.Property(u => u.est_valide)
                      .HasDefaultValue(false);

                entity.Property(u => u.EmailConfirmed)
                      .HasDefaultValue(false);

                entity.Property(u => u.provider)
                      .HasDefaultValue("Local");

                // CHECK constraint (optionnel mais propre)
                entity.HasCheckConstraint("CK_utilisateur_role",
                    "role IN ('ADMIN', 'ENSEIGNANT', 'APPRENANT')");
            });

            // 🔹 Relation 1-1 Apprenant
            modelBuilder.Entity<User>()
                .HasOne(u => u.Apprenant)
                .WithOne(a => a.User)
                .HasForeignKey<Apprenant>(a => a.id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Apprenant>(entity =>
            {
                entity.ToTable("apprenant");

                entity.HasCheckConstraint("CK_apprenant_statut",
                    "statut IN ('ACTIF', 'SUSPENDU')");
            });

            // 🔹 Relation 1-1 Enseignant
            modelBuilder.Entity<User>()
                .HasOne(u => u.Enseignant)
                .WithOne(e => e.User)
                .HasForeignKey<Enseignant>(e => e.id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Enseignant>(entity =>
            {
                entity.ToTable("enseignant");
            });
        }
    }
}