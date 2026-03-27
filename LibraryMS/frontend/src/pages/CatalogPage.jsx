import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { booksAPI, txAPI } from "../utils/api";
import Navbar from "../components/Navbar";

const GENRES = ["All", "Fiction", "Technology", "Self-Help", "Science", "History", "Biography" , "Chemistry"];

export default function CatalogPage() {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (genre !== "All") params.genre = genre;
      if (author) params.author = author;
      const data = await booksAPI.getAll(token, params);
      setBooks(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [genre]); // Re-fetch when genre changes

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  const handleBorrow = async (bookId) => {
    try {
      const res = await txAPI.borrow(token, bookId);
      showToast(res.message, "success");
      fetchBooks();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 3000);
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.title}>📚 Book Catalog</h2>

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearch} style={styles.searchBar}>
          <input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <input
            placeholder="Filter by author..."
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchBtn}>Search</button>
        </form>

        {/* Genre Filter Pills */}
        <div style={styles.genrePills}>
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              style={{ ...styles.pill, ...(genre === g ? styles.pillActive : {}) }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div style={styles.center}>Loading books...</div>
        ) : books.length === 0 ? (
          <div style={styles.center}>No books found.</div>
        ) : (
          <div style={styles.grid}>
            {books.map((book) => (
              <BookCard key={book.id} book={book} onBorrow={handleBorrow} />
            ))}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div style={{ ...styles.toast, background: toast.type === "error" ? "#c62828" : "#2e7d32" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function BookCard({ book, onBorrow }) {
  const genreColor = {
    Fiction: "#7c3aed", Technology: "#0369a1",
    "Self-Help": "#059669", Science: "#d97706",
    History: "#b45309", Biography: "#be185d", Chemistry: "#f9f908",
  };

  return (
    <div style={styles.card}>
      <div style={{ ...styles.genreTag, background: genreColor[book.genre] || "#6b7280" }}>
        {book.genre}
      </div>
      <h3 style={styles.bookTitle}>{book.title}</h3>
      <p style={styles.bookAuthor}>by {book.author}</p>
      <div style={styles.cardFooter}>
        <span style={{ ...styles.badge, background: book.available > 0 ? "#dcfce7" : "#fee2e2",
          color: book.available > 0 ? "#166534" : "#991b1b" }}>
          {book.available > 0 ? `${book.available} available` : "Unavailable"}
        </span>
        <button
          onClick={() => onBorrow(book.id)}
          disabled={book.available === 0}
          style={{ ...styles.borrowBtn, opacity: book.available === 0 ? 0.5 : 1,
            cursor: book.available === 0 ? "not-allowed" : "pointer" }}
        >
          Borrow
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f5f7fb", fontFamily: "'Segoe UI', sans-serif" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "32px 20px" },
  title: { fontSize: 24, fontWeight: 700, color: "#1e3a5f", marginBottom: 24 },
  searchBar: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  searchInput: {
    flex: 1, minWidth: 160, padding: "10px 14px",
    border: "1.5px solid #dde3ea", borderRadius: 8, fontSize: 14, outline: "none",
  },
  searchBtn: {
    padding: "10px 24px", background: "#1e3a5f", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  genrePills: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 },
  pill: {
    padding: "6px 16px", border: "1.5px solid #dde3ea", borderRadius: 20,
    background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500,
  },
  pillActive: { background: "#1e3a5f", color: "#fff", borderColor: "#1e3a5f" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 },
  card: { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" },
  genreTag: {
    display: "inline-block", color: "#fff", fontSize: 11, fontWeight: 700,
    padding: "3px 10px", borderRadius: 20, marginBottom: 12,
  },
  bookTitle: { fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 6px" },
  bookAuthor: { fontSize: 13, color: "#64748b", margin: "0 0 16px" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  badge: { fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20 },
  borrowBtn: {
    padding: "7px 18px", background: "#1e3a5f", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
  },
  center: { textAlign: "center", color: "#888", padding: "60px 0", fontSize: 16 },
  toast: {
    position: "fixed", bottom: 28, right: 28, color: "#fff",
    padding: "14px 24px", borderRadius: 10, fontWeight: 600,
    fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", zIndex: 999,
  },
};
