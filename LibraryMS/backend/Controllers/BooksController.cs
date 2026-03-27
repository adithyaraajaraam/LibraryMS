using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using LibraryMS.Data;

namespace LibraryMS.Controllers
{
    [ApiController]
    [Route("api/books")]
    [Authorize]
    public class BooksController : ControllerBase
    {
        private readonly AppDbContext _db;

        public BooksController(AppDbContext db) => _db = db;

        // GET /api/books?search=clean&genre=Tech&author=Robert
        [HttpGet]
        public async Task<IActionResult> GetBooks(
            [FromQuery] string? search,
            [FromQuery] string? genre,
            [FromQuery] string? author)
        {
            var query = _db.Books.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(b => b.Title.ToLower().Contains(search.ToLower()));

            if (!string.IsNullOrWhiteSpace(genre))
                query = query.Where(b => b.Genre.ToLower() == genre.ToLower());

            if (!string.IsNullOrWhiteSpace(author))
                query = query.Where(b => b.Author.ToLower().Contains(author.ToLower()));

            var books = await query.OrderBy(b => b.Title).ToListAsync();
            return Ok(books);
        }

        // GET /api/books/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBook(int id)
        {
            var book = await _db.Books.FindAsync(id);
            if (book == null) return NotFound(new { message = "Book not found." });
            return Ok(book);
        }

        // POST /api/books  [Admin only]
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> AddBook([FromBody] BookDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.Author))
                return BadRequest(new { message = "Title and Author are required." });

            var book = new Book
            {
                Title = dto.Title,
                Author = dto.Author,
                Genre = dto.Genre,
                Quantity = dto.Quantity,
                Available = dto.Quantity
            };

            _db.Books.Add(book);
            await _db.SaveChangesAsync();

            var adminName = User.FindFirst(ClaimTypes.Name)?.Value ?? "admin";
            _db.ActivityLogs.Add(new ActivityLog
            {
                Username = adminName,
                Action = "ADD_BOOK",
                Detail = $"Added book: '{book.Title}' by {book.Author}"
            });
            await _db.SaveChangesAsync();

            return Ok(new { message = "Book added successfully.", book });
        }

        // PUT /api/books/{id}  [Admin only]
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateBook(int id, [FromBody] BookDto dto)
        {
            var book = await _db.Books.FindAsync(id);
            if (book == null) return NotFound(new { message = "Book not found." });

            book.Title = dto.Title;
            book.Author = dto.Author;
            book.Genre = dto.Genre;
            book.Quantity = dto.Quantity;
            // Adjust available by the difference in quantity
            book.Available = Math.Max(0, book.Available + (dto.Quantity - book.Quantity));

            await _db.SaveChangesAsync();

            var adminName = User.FindFirst(ClaimTypes.Name)?.Value ?? "admin";
            _db.ActivityLogs.Add(new ActivityLog
            {
                Username = adminName,
                Action = "UPDATE_BOOK",
                Detail = $"Updated book: '{book.Title}'"
            });
            await _db.SaveChangesAsync();

            return Ok(new { message = "Book updated.", book });
        }

        // DELETE /api/books/{id}  [Admin only]
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var book = await _db.Books.FindAsync(id);
            if (book == null) return NotFound(new { message = "Book not found." });

            _db.Books.Remove(book);

            var adminName = User.FindFirst(ClaimTypes.Name)?.Value ?? "admin";
            _db.ActivityLogs.Add(new ActivityLog
            {
                Username = adminName,
                Action = "DELETE_BOOK",
                Detail = $"Deleted book: '{book.Title}'"
            });

            await _db.SaveChangesAsync();
            return Ok(new { message = "Book deleted." });
        }
    }

    public class BookDto
    {
        public string Title { get; set; } = "";
        public string Author { get; set; } = "";
        public string Genre { get; set; } = "";
        public int Quantity { get; set; } = 1;
    }
}
