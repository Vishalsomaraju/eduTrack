import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import LoginPage from '@/pages/LoginPage'
import AttendancePage from '@/pages/AttendancePage'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import PageShell from '@/components/layout/PageShell'

// ── Stub pages (full implementations in Month 2) ──────────────
function StubPage({ title }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        fontFamily: 'var(--font-display)',
        color: 'var(--text-primary)',
        fontSize: '1.25rem',
        fontWeight: 600,
      }}
    >
      {title}
    </div>
  )
}

// ── AppContent — must be inside BrowserRouter so hooks work ───
function AppContent() {
  // Session listener runs for the entire app lifetime
  useAuth()

  // Apply theme to <html data-theme="..."> + persist to localStorage
  useTheme()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PageShell>
              <StubPage title="Dashboard" />
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
              <StubPage title="Marks" />
            </PageShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute allowedRoles={['admin', 'faculty']}>
            <PageShell>
              <StubPage title="Analytics" />
            </PageShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/students"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PageShell>
              <StubPage title="Students" />
            </PageShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/faculty"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PageShell>
              <StubPage title="Faculty" />
            </PageShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/subjects"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PageShell>
              <StubPage title="Subjects" />
            </PageShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
