using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using LibraryMS.Data;

namespace LibraryMS.Controllers
{
    [ApiController]
    [Route("api/transactions")]
    [Authorize]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public TransactionsController(AppDbContext db) => _db = db;

        // GET /api/transactions/my  — get current user's borrowed books
        [HttpGet("my")]
        public async Task<IActionResult> MyTransactions()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            // DB Join: Transactions + Books
            var result = await _db.Transactions
                .Where(t => t.UserId == userId)
                .Include(t => t.Book)
                .OrderByDescending(t => t.BorrowedAt)
                .Select(t => new
                {
                    t.Id,
                    t.Status,
                    t.BorrowedAt,
                    t.ReturnedAt,
                    Book = new { t.Book!.Id, t.Book.Title, t.Book.Author, t.Book.Genre }
                })
                .ToListAsync();

            return Ok(result);
        }

        // POST /api/transactions/borrow/{bookId}
        [HttpPost("borrow/{bookId}")]
        public async Task<IActionResult> BorrowBook(int bookId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? "";

            var book = await _db.Books.FindAsync(bookId);
            if (book == null) return NotFound(new { message = "Book not found." });

            if (book.Available <= 0)
                return BadRequest(new { message = "No copies available right now." });

            // Prevent duplicate borrow
            var alreadyBorrowed = await _db.Transactions
                .AnyAsync(t => t.UserId == userId && t.BookId == bookId && t.Status == "borrowed");

            if (alreadyBorrowed)
                return BadRequest(new { message = "You already have this book borrowed." });

            // Decrease available count
            book.Available--;

            var transaction = new Transaction
            {
                UserId = userId,
                BookId = bookId,
                Status = "borrowed"
            };

            _db.Transactions.Add(transaction);

            _db.ActivityLogs.Add(new ActivityLog
            {
                UserId = userId,
                Username = username,
                Action = "BORROW",
                Detail = $"Borrowed book: '{book.Title}'"
            });

            await _db.SaveChangesAsync();
            return Ok(new { message = $"'{book.Title}' borrowed successfully!" });
        }

        // POST /api/transactions/return/{transactionId}
        [HttpPost("return/{transactionId}")]
        public async Task<IActionResult> ReturnBook(int transactionId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? "";

            // Join to get transaction with book
            var transaction = await _db.Transactions
                .Include(t => t.Book)
                .FirstOrDefaultAsync(t => t.Id == transactionId && t.UserId == userId);

            if (transaction == null)
                return NotFound(new { message = "Transaction not found." });

            if (transaction.Status == "returned")
                return BadRequest(new { message = "Book already returned." });

            transaction.Status = "returned";
            transaction.ReturnedAt = DateTime.UtcNow;
            transaction.Book!.Available++;

            _db.ActivityLogs.Add(new ActivityLog
            {
                UserId = userId,
                Username = username,
                Action = "RETURN",
                Detail = $"Returned book: '{transaction.Book.Title}'"
            });

            await _db.SaveChangesAsync();
            return Ok(new { message = $"'{transaction.Book.Title}' returned successfully!" });
        }

        // GET /api/transactions/all  [Admin only] — all transactions with user+book info
        [HttpGet("all")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> AllTransactions()
        {
            var result = await _db.Transactions
                .Include(t => t.User)
                .Include(t => t.Book)
                .OrderByDescending(t => t.BorrowedAt)
                .Select(t => new
                {
                    t.Id,
                    t.Status,
                    t.BorrowedAt,
                    t.ReturnedAt,
                    User = new { t.User!.Id, t.User.Username, t.User.Email },
                    Book = new { t.Book!.Id, t.Book.Title, t.Book.Author }
                })
                .ToListAsync();

            return Ok(result);
        }
    }
}
