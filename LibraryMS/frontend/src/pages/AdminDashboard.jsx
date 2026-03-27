import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { adminAPI, booksAPI } from "../utils/api";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [books, setBooks] = useState([]);
  const [tab, setTab] = useState("overview"); // overview | books | logs
  const [showAddBook, setShowAddBook] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [bookForm, setBookForm] = useState({ title: "", author: "", genre: "", quantity: 1 });
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === "overview") {
        const s = await adminAPI.stats(token);
        setStats(s);
      } else if (tab === "books") {
        const b = await booksAPI.getAll(token, {});
        setBooks(b);
      } else if (tab === "logs") {
        const l = await adminAPI.logs(token);
        setLogs(l.logs);
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      if (editBook) {
        await booksAPI.update(token, editBook.id, bookForm);
        showToast("Book updated!", "success");
      } else {
        await booksAPI.add(token, bookForm);
        showToast("Book added!", "success");
      }
      setShowAddBook(false);
      setEditBook(null);
      setBookForm({ title: "", author: "", genre: "", quantity: 1 });
      const b = await booksAPI.getAll(token, {});
      setBooks(b);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await booksAPI.delete(token, id);
      showToast("Book deleted.", "success");
      const b = await booksAPI.getAll(token, {});
      setBooks(b);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const openEdit = (book) => {
    setEditBook(book);
    setBookForm({ title: book.title, author: book.author, genre: book.genre, quantity: book.quantity });
    setShowAddBook(true);
  };

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 3000);
  };

  const LOG_COLORS = {
    LOGIN: "#3b82f6", SIGNUP: "#8b5cf6",
    BORROW: "#f59e0b", RETURN: "#10b981",
    ADD_BOOK: "#6366f1", DELETE_BOOK: "#ef4444", UPDATE_BOOK: "#06b6d4",
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.title}>📊 Admin Dashboard</h2>

        {/* Tab Bar */}
        <div style={styles.tabBar}>
          {[["overview", "📊 Overview"], ["books", "📚 Manage Books"], ["logs", "🗂 Activity Logs"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ ...styles.tabBtn, ...(tab === key ? styles.tabBtnActive : {}) }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={styles.center}>Loading...</div>
        ) : (
          <>
            {/* ── Overview Tab ── */}
            {tab === "overview" && stats && (
              <>
                <div style={styles.statsGrid}>
                  <StatBox label="Total Books" value={stats.totalBooks} icon="📚" color="#1e3a5f" />
                  <StatBox label="Users" value={stats.totalUsers} icon="👥" color="#7c3aed" />
                  <StatBox label="Currently Borrowed" value={stats.totalBorrowed} icon="🔄" color="#f59e0b" />
                  <StatBox label="Total Returned" value={stats.totalReturned} icon="✅" color="#10b981" />
                  <StatBox label="Available Copies" value={stats.totalAvailable} icon="📖" color="#0369a1" />
                </div>
                <h3 style={styles.sectionTitle}>🏆 Most Popular Books</h3>
                <div style={styles.popularList}>
                  {stats.popularBooks.map((b, i) => (
                    <div key={i} style={styles.popularRow}>
                      <span style={styles.rank}>#{i + 1}</span>
                      <div>
                        <p style={styles.popTitle}>{b.title}</p>
                        <p style={styles.popAuthor}>{b.author}</p>
                      </div>
                      <span style={styles.borrowCount}>{b.count} borrows</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Books Tab ── */}
            {tab === "books" && (
              <>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                  <button style={styles.addBtn} onClick={() => { setShowAddBook(true); setEditBook(null); setBookForm({ title: "", author: "", genre: "", quantity: 1 }); }}>
                    + Add Book
                  </button>
                </div>

                {/* Add/Edit Book Form */}
                {showAddBook && (
                  <div style={styles.formCard}>
                    <h3 style={{ margin: "0 0 16px" }}>{editBook ? "✏️ Edit Book" : "➕ Add New Book"}</h3>
                    <form onSubmit={handleSaveBook} style={styles.bookForm}>
                      <input placeholder="Title *" value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} style={styles.input} required />
                      <input placeholder="Author *" value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} style={styles.input} required />
                      <input placeholder="Genre" value={bookForm.genre} onChange={e => setBookForm({ ...bookForm, genre: e.target.value })} style={styles.input} />
                      <input type="number" placeholder="Quantity" min="1" value={bookForm.quantity} onChange={e => setBookForm({ ...bookForm, quantity: parseInt(e.target.value) })} style={styles.input} />
                      <div style={{ display: "flex", gap: 10 }}>
                        <button type="submit" style={styles.saveBtn}>{editBook ? "Update" : "Add"}</button>
                        <button type="button" style={styles.cancelBtn} onClick={() => { setShowAddBook(false); setEditBook(null); }}>Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                <table style={styles.table}>
                  <thead>
                    <tr style={styles.theadRow}>
                      {["Title", "Author", "Genre", "Total", "Available", "Actions"].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => (
                      <tr key={book.id} style={styles.tr}>
                        <td style={styles.td}><strong>{book.title}</strong></td>
                        <td style={styles.td}>{book.author}</td>
                        <td style={styles.td}>{book.genre}</td>
                        <td style={styles.td}>{book.quantity}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.availBadge, background: book.available > 0 ? "#dcfce7" : "#fee2e2", color: book.available > 0 ? "#166534" : "#991b1b" }}>
                            {book.available}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button onClick={() => openEdit(book)} style={styles.editBtn}>Edit</button>
                          <button onClick={() => handleDelete(book.id, book.title)} style={styles.deleteBtn}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* ── Logs Tab ── */}
            {tab === "logs" && (
              <div style={styles.logList}>
                {logs.length === 0 ? (
                  <p style={styles.center}>No logs yet.</p>
                ) : logs.map((log) => (
                  <div key={log.id} style={styles.logRow}>
                    <span style={{ ...styles.logAction, background: LOG_COLORS[log.action] || "#64748b" }}>
                      {log.action}
                    </span>
                    <div style={styles.logInfo}>
                      <span style={styles.logUser}>👤 {log.username}</span>
                      <span style={styles.logDetail}>{log.detail}</span>
                    </div>
                    <span style={styles.logTime}>
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {toast.show && (
        <div style={{ ...styles.toast, background: toast.type === "error" ? "#c62828" : "#2e7d32" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, icon, color }) {
  return (
    <div style={{ ...styles.statBox, borderTop: `4px solid ${color}` }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{ ...styles.statNum, color }}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f5f7fb", fontFamily: "'Segoe UI', sans-serif" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "32px 20px" },
  title: { fontSize: 24, fontWeight: 700, color: "#1e3a5f", marginBottom: 24 },
  tabBar: { display: "flex", gap: 8, marginBottom: 28, borderBottom: "2px solid #e2e8f0", paddingBottom: 0 },
  tabBtn: {
    padding: "10px 20px", border: "none", background: "none",
    cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#64748b",
    borderBottom: "2px solid transparent", marginBottom: -2,
  },
  tabBtnActive: { color: "#1e3a5f", borderBottom: "2px solid #1e3a5f" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 32 },
  statBox: {
    background: "#fff", borderRadius: 12, padding: "20px 16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex",
    flexDirection: "column", alignItems: "center", gap: 6,
  },
  statNum: { fontSize: 36, fontWeight: 800 },
  statLabel: { fontSize: 12, color: "#64748b", fontWeight: 600, textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "#334155", marginBottom: 12 },
  popularList: { display: "flex", flexDirection: "column", gap: 10 },
  popularRow: {
    background: "#fff", borderRadius: 10, padding: "14px 18px",
    display: "flex", alignItems: "center", gap: 16,
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
  rank: { fontWeight: 800, color: "#f59e0b", fontSize: 18, width: 28 },
  popTitle: { margin: 0, fontWeight: 700, color: "#1e293b" },
  popAuthor: { margin: 0, fontSize: 12, color: "#888" },
  borrowCount: { marginLeft: "auto", background: "#f0f9ff", color: "#0369a1", fontWeight: 700, fontSize: 13, padding: "4px 12px", borderRadius: 20 },
  addBtn: { padding: "10px 22px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" },
  formCard: { background: "#fff", borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" },
  bookForm: { display: "flex", flexWrap: "wrap", gap: 12 },
  input: { flex: 1, minWidth: 160, padding: "10px 14px", border: "1.5px solid #dde3ea", borderRadius: 8, fontSize: 14 },
  saveBtn: { padding: "10px 24px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" },
  cancelBtn: { padding: "10px 20px", background: "#f1f5f9", color: "#334155", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" },
  theadRow: { background: "#f8fafc" },
  th: { padding: "13px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", borderBottom: "1px solid #e2e8f0" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "13px 16px", fontSize: 14, color: "#1e293b" },
  availBadge: { padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 },
  editBtn: { padding: "5px 14px", background: "#e0f2fe", color: "#0369a1", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, marginRight: 8 },
  deleteBtn: { padding: "5px 14px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 },
  logList: { display: "flex", flexDirection: "column", gap: 8 },
  logRow: {
    background: "#fff", borderRadius: 10, padding: "12px 16px",
    display: "flex", alignItems: "center", gap: 14,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  logAction: { color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" },
  logInfo: { display: "flex", flexDirection: "column", flex: 1 },
  logUser: { fontSize: 13, fontWeight: 700, color: "#334155" },
  logDetail: { fontSize: 12, color: "#64748b" },
  logTime: { fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" },
  center: { textAlign: "center", padding: "40px 0", color: "#888" },
  toast: {
    position: "fixed", bottom: 28, right: 28, color: "#fff",
    padding: "14px 24px", borderRadius: 10, fontWeight: 600, fontSize: 14,
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)", zIndex: 999,
  },
};
