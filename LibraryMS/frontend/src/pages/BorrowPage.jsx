import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { txAPI } from "../utils/api";
import Navbar from "../components/Navbar";

export default function BorrowPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const fetchMyBooks = async () => {
    setLoading(true);
    try {
      const data = await txAPI.myBooks(token);
      setTransactions(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyBooks(); }, []);

  const handleReturn = async (txId) => {
    try {
      const res = await txAPI.returnBook(token, txId);
      showToast(res.message, "success");
      fetchMyBooks();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 3000);
  };

  const borrowed = transactions.filter(t => t.status === "borrowed");
  const returned = transactions.filter(t => t.status === "returned");

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.title}>🔄 My Books</h2>

        {/* Stats row */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={styles.statNum}>{borrowed.length}</span>
            <span style={styles.statLabel}>Currently Borrowed</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNum}>{returned.length}</span>
            <span style={styles.statLabel}>Returned</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNum}>{transactions.length}</span>
            <span style={styles.statLabel}>Total Transactions</span>
          </div>
        </div>

        {/* Currently Borrowed */}
        <h3 style={styles.sectionTitle}>📖 Currently Borrowed</h3>
        {loading ? (
          <p style={styles.empty}>Loading...</p>
        ) : borrowed.length === 0 ? (
          <div style={styles.emptyBox}>
            <p>You have no books currently borrowed.</p>
            <a href="/catalog" style={styles.browseLink}>Browse Catalog →</a>
          </div>
        ) : (
          <div style={styles.list}>
            {borrowed.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} onReturn={handleReturn} />
            ))}
          </div>
        )}

        {/* History */}
        {returned.length > 0 && (
          <>
            <h3 style={{ ...styles.sectionTitle, marginTop: 32 }}>📋 History</h3>
            <div style={styles.list}>
              {returned.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
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

function TransactionRow({ tx, onReturn }) {
  const borrowed = tx.status === "borrowed";
  const borrowDate = new Date(tx.borrowedAt).toLocaleDateString();
  const returnDate = tx.returnedAt ? new Date(tx.returnedAt).toLocaleDateString() : null;

  return (
    <div style={styles.card}>
      <div style={styles.cardLeft}>
        <span style={styles.bookIcon}>📘</span>
        <div>
          <p style={styles.bookTitle}>{tx.book.title}</p>
          <p style={styles.bookMeta}>by {tx.book.author} · {tx.book.genre}</p>
          <p style={styles.dateInfo}>
            Borrowed: {borrowDate}
            {returnDate && ` · Returned: ${returnDate}`}
          </p>
        </div>
      </div>
      <div style={styles.cardRight}>
        <span style={{ ...styles.statusBadge,
          background: borrowed ? "#dbeafe" : "#dcfce7",
          color: borrowed ? "#1e40af" : "#166534",
        }}>
          {borrowed ? "Borrowed" : "Returned"}
        </span>
        {borrowed && onReturn && (
          <button onClick={() => onReturn(tx.id)} style={styles.returnBtn}>
            Return
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f5f7fb", fontFamily: "'Segoe UI', sans-serif" },
  container: { maxWidth: 800, margin: "0 auto", padding: "32px 20px" },
  title: { fontSize: 24, fontWeight: 700, color: "#1e3a5f", marginBottom: 24 },
  statsRow: { display: "flex", gap: 16, marginBottom: 32 },
  statCard: {
    flex: 1, background: "#fff", borderRadius: 12, padding: "20px 16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)", textAlign: "center",
  },
  statNum: { display: "block", fontSize: 36, fontWeight: 700, color: "#1e3a5f" },
  statLabel: { fontSize: 12, color: "#888", fontWeight: 600 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "#334155", marginBottom: 16 },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: {
    background: "#fff", borderRadius: 12, padding: "18px 20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex",
    justifyContent: "space-between", alignItems: "center",
  },
  cardLeft: { display: "flex", gap: 16, alignItems: "center" },
  bookIcon: { fontSize: 28 },
  bookTitle: { margin: 0, fontWeight: 700, color: "#1e293b", fontSize: 15 },
  bookMeta: { margin: "2px 0", fontSize: 13, color: "#64748b" },
  dateInfo: { margin: 0, fontSize: 12, color: "#94a3b8" },
  cardRight: { display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" },
  statusBadge: { fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 },
  returnBtn: {
    padding: "7px 18px", background: "#1e3a5f", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  empty: { color: "#888", textAlign: "center", padding: "20px 0" },
  emptyBox: { textAlign: "center", padding: "40px 0", color: "#888" },
  browseLink: { color: "#1e3a5f", fontWeight: 600, textDecoration: "none", fontSize: 14 },
  toast: {
    position: "fixed", bottom: 28, right: 28, color: "#fff",
    padding: "14px 24px", borderRadius: 10, fontWeight: 600, fontSize: 14,
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)", zIndex: 999,
  },
};
