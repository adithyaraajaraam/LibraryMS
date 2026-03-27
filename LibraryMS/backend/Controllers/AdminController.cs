using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LibraryMS.Data;

namespace LibraryMS.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AdminController(AppDbContext db) => _db = db;

        // GET /api/admin/stats  — dashboard summary numbers
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalBooks = await _db.Books.CountAsync();
            var totalUsers = await _db.Users.CountAsync(u => u.Role == "user");
            var totalBorrowed = await _db.Transactions.CountAsync(t => t.Status == "borrowed");
            var totalReturned = await _db.Transactions.CountAsync(t => t.Status == "returned");
            var totalAvailable = await _db.Books.SumAsync(b => b.Available);

            // Most borrowed books (top 5) — using a join
            var popularBooks = await _db.Transactions
                .GroupBy(t => t.BookId)
                .Select(g => new { BookId = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .Join(_db.Books,
                      t => t.BookId,
                      b => b.Id,
                      (t, b) => new { b.Title, b.Author, t.Count })
                .ToListAsync();

            return Ok(new
            {
                totalBooks,
                totalUsers,
                totalBorrowed,
                totalReturned,
                totalAvailable,
                popularBooks
            });
        }

        // GET /api/admin/logs — activity logs
        [HttpGet("logs")]
        public async Task<IActionResult> GetLogs([FromQuery] int page = 1, [FromQuery] int limit = 20)
        {
            var logs = await _db.ActivityLogs
                .OrderByDescending(l => l.Timestamp)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            var total = await _db.ActivityLogs.CountAsync();

            return Ok(new { logs, total, page, limit });
        }

        // GET /api/admin/users — list all users
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _db.Users
                .Select(u => new { u.Id, u.Username, u.Email, u.Role, u.CreatedAt })
                .ToListAsync();

            return Ok(users);
        }
    }
}
