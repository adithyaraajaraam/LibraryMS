import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = isAdmin
    ? [
        { path: "/admin", label: "📊 Dashboard" },
        { path: "/catalog", label: "📚 Books" },
        { path: "/borrow", label: "🔄 My Borrows" },
      ]
    : [
        { path: "/catalog", label: "📚 Catalog" },
        { path: "/borrow", label: "🔄 My Books" },
      ];

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <span style={styles.logo}>📚</span>
        <span style={styles.brandText}>LibraryMS</span>
      </div>
      <div style={styles.links}>
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            style={{
              ...styles.link,
              ...(location.pathname === link.path ? styles.activeLink : {}),
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div style={styles.userArea}>
        <span style={styles.userInfo}>
          👤 {user?.username}
          {isAdmin && <span style={styles.adminBadge}>ADMIN</span>}
        </span>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: "#1e3a5f",
    padding: "0 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  logo: { fontSize: 24 },
  brandText: { color: "#fff", fontWeight: 700, fontSize: 18 },
  links: { display: "flex", gap: 4 },
  link: {
    color: "#a8c6e8",
    textDecoration: "none",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    transition: "all 0.2s",
  },
  activeLink: {
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
  },
  userArea: { display: "flex", alignItems: "center", gap: 14 },
  userInfo: { color: "#a8c6e8", fontSize: 13, display: "flex", alignItems: "center", gap: 8 },
  adminBadge: {
    background: "#f59e0b",
    color: "#000",
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 4,
  },
  logoutBtn: {
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "6px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
};
