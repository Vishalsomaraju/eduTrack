import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/hooks/useTheme";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import AttendancePage from "@/pages/AttendancePage";
import MarksPage from "@/pages/MarksPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import PageShell from "@/components/layout/PageShell";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

// ── Stub pages (full implementations in Month 2) ──────────────
function StubPage({ title }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        fontFamily: "var(--font-display)",
        color: "var(--text-primary)",
        fontSize: "1.25rem",
        fontWeight: 600,
      }}
    >
      {title}
    </div>
  );
}

function RootRedirect() {
  const { user, loading } = useAuthStore();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

// ── AppContent — must be inside BrowserRouter so hooks work ───
function AppContent() {
  // Session listener runs for the entire app lifetime
  useAuth({ initialize: true });

  // Apply theme to <html data-theme="..."> + persist to localStorage
  useTheme();

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<RootRedirect />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageShell>
                <DashboardPage />
              </PageShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <PageShell>
                <AttendancePage />
              </PageShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/marks"
          element={
            <ProtectedRoute>
              <PageShell>
                <MarksPage />
              </PageShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <PageShell>
                <AnalyticsPage />
              </PageShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageShell>
                <ProfilePage />
              </PageShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute roles={["admin"]}>
              <PageShell>
                <StubPage title="Students" />
              </PageShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty"
          element={
            <ProtectedRoute roles={["admin"]}>
              <PageShell>
                <StubPage title="Faculty" />
              </PageShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/subjects"
          element={
            <ProtectedRoute roles={["admin"]}>
              <PageShell>
                <StubPage title="Subjects" />
              </PageShell>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
