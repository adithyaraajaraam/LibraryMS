import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import CatalogPage from "./pages/CatalogPage";
import BorrowPage from "./pages/BorrowPage";
import AdminDashboard from "./pages/AdminDashboard";

// Protect routes — redirect to login if not authenticated
function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ textAlign: "center", padding: "80px", fontSize: 18 }}>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/catalog" replace />;

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />

          <Route path="/catalog" element={
            <PrivateRoute><CatalogPage /></PrivateRoute>
          } />

          <Route path="/borrow" element={
            <PrivateRoute><BorrowPage /></PrivateRoute>
          } />

          <Route path="/admin" element={
            <PrivateRoute adminOnly={true}><AdminDashboard /></PrivateRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
