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
            modelBuilder.Entity<User>()
                .HasOne(u => u.Apprenant)
                .WithOne(a => a.User)
                .HasForeignKey<Apprenant>(a => a.id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Enseignant)
                .WithOne(e => e.User)
                .HasForeignKey<Enseignant>(e => e.id)
                .OnDelete(DeleteBehavior.Cascade);
        }

    }

}
