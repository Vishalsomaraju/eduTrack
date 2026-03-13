import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Input, Button } from "@/components/ui";

function EyeIcon({ open }) {
  return open ? (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const statPills = ["2,400+ Students", "98% Uptime", "Real-time Data"];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const error = useAuthStore((s) => s.error);
  const { signIn } = useAuth();
  const { theme, toggleTheme } = useTheme();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    await signIn(email.trim(), password);
    setSubmitting(false);
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-base)",
        position: "relative",
      }}
    >
      {/* Theme toggle — top right corner */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "none",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "6px 8px",
          cursor: "pointer",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "all 150ms ease",
          zIndex: 10,
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "var(--text-primary)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "var(--text-muted)")
        }
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* ── Left decorative panel (hidden on mobile) ── */}
      <div
        style={{
          display: "none",
          position: "relative",
          flex: "0 0 50%",
          background: "var(--bg-sidebar)",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem",
        }}
        className="md-panel"
      >
        {/* Center block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            textAlign: "center",
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "var(--accent-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "0.25rem",
              border: "1px solid var(--accent-glow)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "2.5rem",
                color: "var(--accent)",
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              E
            </span>
          </div>

          {/* Brand name */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "2rem",
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            EduTrack
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: "1rem",
              color: "var(--text-muted)",
              margin: 0,
              maxWidth: 240,
              lineHeight: 1.5,
            }}
          >
            Academic management, reimagined
          </p>
        </div>

        {/* Stat pills pinned to bottom */}
        <div
          style={{
            position: "absolute",
            bottom: "2.5rem",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: "0.625rem",
            flexWrap: "wrap",
            padding: "0 2rem",
          }}
        >
          {statPills.map((label) => (
            <span
              key={label}
              style={{
                background: "var(--accent-subtle)",
                color: "var(--accent)",
                borderRadius: "9999px",
                padding: "0.25rem 0.75rem",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "0.75rem",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.5rem",
          background: "var(--bg-base)",
        }}
      >
        <div style={{ width: "100%", maxWidth: 360 }}>
          {/* Form header */}
          <div style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.75rem",
                color: "var(--text-primary)",
                margin: "0 0 0.375rem",
                lineHeight: 1.2,
              }}
            >
              Welcome back
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="you@kprit.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              autoComplete="username"
            />

            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  <EyeIcon open={showPassword} />
                </button>
              }
            />

            {/* Error box */}
            {error && (
              <div
                role="alert"
                style={{
                  background: "var(--accent-red-bg)",
                  border: "1px solid var(--accent-red-border)",
                  color: "var(--accent-red)",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  lineHeight: 1.4,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginTop: "0.5rem" }}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={submitting}
                disabled={submitting}
                size="lg"
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* Footer note */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              textAlign: "center",
              marginTop: "2rem",
              opacity: 0.7,
            }}
          >
            KPRIT · Dept. of CSE · RTRP 2025–26
          </p>
        </div>
      </div>

      {/* Responsive panel visibility via injected style */}
      <style>{`
        @media (min-width: 768px) {
          .md-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
