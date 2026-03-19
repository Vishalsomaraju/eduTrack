import { useLocation } from "react-router-dom";
import { Bell, Menu, Moon, Sun } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/hooks/useTheme";

const ROUTE_TITLES = {
  "/dashboard": "Dashboard",
  "/attendance": "Attendance",
  "/marks": "Marks",
  "/analytics": "Analytics",
  "/students": "Students",
  "/faculty": "Faculty",
  "/subjects": "Subjects",
};

function Avatar({ profile, size = 32 }) {
  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile?.name ?? "User"}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }
  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "??";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--accent-subtle)",
        color: "var(--accent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "0.7rem",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
}

export default function Navbar({ onMenuToggle }) {
  const location = useLocation();
  const { profile } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const title = ROUTE_TITLES[location.pathname] ?? "EduTrack";

  return (
    <header
      className="h-14 flex items-center justify-between px-3 sm:px-4 lg:px-6"
      style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          className="lg:hidden p-2 rounded-md"
          onClick={onMenuToggle}
          aria-label="Toggle navigation"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-primary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          <Menu size={20} />
        </button>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--text-primary)",
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
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
        <button
          aria-label="Notifications"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            transition: "color 150ms ease",
            padding: 0,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-primary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          <Bell size={20} />
        </button>
        <Avatar profile={profile} size={32} />
      </div>
    </header>
  );
}
