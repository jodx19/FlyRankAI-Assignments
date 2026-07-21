using Microsoft.EntityFrameworkCore;

namespace FlyRank.DatabaseApi
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<TaskEntity> Tasks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed initial data
            modelBuilder.Entity<TaskEntity>().HasData(
                new TaskEntity { Id = 1, Title = "Database Integration Setup", Description = "Connected PostgreSQL via Docker and EF Core", IsCompleted = true },
                new TaskEntity { Id = 2, Title = "Health Check Verification", Description = "Verified DB Connection Health Endpoint", IsCompleted = true }
            );
        }
    }
}
