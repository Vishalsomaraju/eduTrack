import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

function Spinner() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 36, height: 36,
        border: '2px solid rgba(197,125,94,0.2)',
        borderTop: '2px solid #C57D5E',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin {
        to { transform: rotate(360deg) }
      }`}</style>
    </div>
  );
}

export default function ProtectedRoute({ children, roles, allowedRoles }) {
  const { user, role, loading } = useAuthStore();
  const resolvedRoles = roles ?? allowedRoles;

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--bg-base)",
        }}
      >
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (resolvedRoles && !resolvedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
