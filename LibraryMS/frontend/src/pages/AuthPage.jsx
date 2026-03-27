import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../utils/api";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Simple client-side validation
    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }
    if (!isLogin && !form.username) {
      setError("Username is required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await authAPI.login(form.email, form.password);
        login(res.token, res.user);
        navigate(res.user.role === "admin" ? "/admin" : "/catalog");
      } else {
        await authAPI.signup(form.username, form.email, form.password);
        setSuccess("Account created! Please login.");
        setIsLogin(true);
        setForm({ username: "", email: "", password: "" });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoBox}>
          <span style={styles.logoIcon}>📚</span>
          <h1 style={styles.logoText}>LibraryMS</h1>
          <p style={styles.logoSub}>Library Management System</p>
        </div>

        {/* Tab Switch */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(isLogin ? styles.tabActive : {}) }}
            onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
          >
            Login
          </button>
          <button
            style={{ ...styles.tab, ...(!isLogin ? styles.tabActive : {}) }}
            onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div style={styles.field}>
              <label style={styles.label}>Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                style={styles.input}
              />
            </div>
          )}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              style={styles.input}
            />
          </div>

          {error && <div style={styles.error}>⚠ {error}</div>}
          {success && <div style={styles.successMsg}>✓ {success}</div>}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        {isLogin && (
          <p style={styles.hint}>
              
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
  logoBox: { textAlign: "center", marginBottom: 28 },
  logoIcon: { fontSize: 48 },
  logoText: { margin: "8px 0 4px", fontSize: 26, fontWeight: 700, color: "#1e3a5f" },
  logoSub: { color: "#888", fontSize: 13, margin: 0 },
  tabs: {
    display: "flex",
    background: "#f0f4f8",
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    padding: "10px",
    border: "none",
    background: "transparent",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    color: "#666",
    transition: "all 0.2s",
  },
  tabActive: {
    background: "#fff",
    color: "#1e3a5f",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#444" },
  input: {
    padding: "11px 14px",
    border: "1.5px solid #ddd",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    transition: "border 0.2s",
  },
  error: {
    background: "#fff3f3",
    border: "1px solid #ffcdd2",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#c62828",
    fontSize: 13,
  },
  successMsg: {
    background: "#f0fff4",
    border: "1px solid #c8e6c9",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#2e7d32",
    fontSize: 13,
  },
  btn: {
    padding: "13px",
    background: "#1e3a5f",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 4,
  },
  hint: { textAlign: "center", color: "#aaa", fontSize: 12, marginTop: 16 },
};
