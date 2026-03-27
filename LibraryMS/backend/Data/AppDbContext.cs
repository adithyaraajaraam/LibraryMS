using Microsoft.EntityFrameworkCore;

namespace LibraryMS.Data
{
    // ── Models ──────────────────────────────────────────────────────────────

    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = "";
        public string Email { get; set; } = "";
        public string PasswordHash { get; set; } = "";
        public string Role { get; set; } = "user"; // "user" or "admin"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Book
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Author { get; set; } = "";
        public string Genre { get; set; } = "";
        public int Quantity { get; set; } = 1;   // total copies
        public int Available { get; set; } = 1;  // copies currently available
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }

    public class Transaction
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int BookId { get; set; }
        public string Status { get; set; } = "borrowed"; // "borrowed" | "returned"
        public DateTime BorrowedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReturnedAt { get; set; }

        // Navigation (for joins)
        public User? User { get; set; }
        public Book? Book { get; set; }
    }

    public class ActivityLog
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string Username { get; set; } = "";
        public string Action { get; set; } = "";   // e.g. "LOGIN", "BORROW", "RETURN"
        public string Detail { get; set; } = "";   // extra info
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    // ── DB Context ───────────────────────────────────────────────────────────

    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Book> Books => Set<Book>();
        public DbSet<Transaction> Transactions => Set<Transaction>();
        public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Seed one admin user (password: Admin@123)
            modelBuilder.Entity<User>().HasData(new User
            {
                Id = 1,
                Username = "admin",
                Email = "admin@library.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = "admin",
                CreatedAt = DateTime.UtcNow
            });

            // Seed some books
            modelBuilder.Entity<Book>().HasData(
                new Book { Id = 1, Title = "Clean Code", Author = "Robert C. Martin", Genre = "Technology", Quantity = 3, Available = 3 },
                new Book { Id = 2, Title = "The Great Gatsby", Author = "F. Scott Fitzgerald", Genre = "Fiction", Quantity = 2, Available = 2 },
                new Book { Id = 3, Title = "Atomic Habits", Author = "James Clear", Genre = "Self-Help", Quantity = 4, Available = 4 },
                new Book { Id = 4, Title = "1984", Author = "George Orwell", Genre = "Fiction", Quantity = 2, Available = 2 }
            );
        }
    }
}
