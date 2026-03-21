import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Sun,
  Moon,
  Menu,
  X,
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  BarChart2,
  UserCircle,
  BookOpen,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/hooks/useTheme";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/marks", label: "Marks", icon: ClipboardList },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

export default function TopNav() {
  const { profile } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials =
    profile?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: 56,
          width: "100%",
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: 0,
        }}
      >
        {/* LEFT — Logo + Name */}
        <Link
          to="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginRight: 40,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1rem",
              color: "#fff",
            }}
          >
            E
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "var(--text-primary)",
            }}
          >
            EduTrack
          </span>
        </Link>

        {/* CENTER — Nav links (desktop) */}
        <div
          className="hidden md:flex"
          style={{
            alignItems: "center",
            gap: 4,
            flex: 1,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 8,
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "0.875rem",
                textDecoration: "none",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                background: isActive ? "var(--accent-subtle)" : "transparent",
                transition: "all 150ms ease",
              })}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* RIGHT — Theme toggle + Profile */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginLeft: "auto",
          }}
        >
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Profile avatar — links to /profile */}
          <Link to="/profile" style={{ textDecoration: "none" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--accent-subtle)",
                border: "1px solid var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.8rem",
                color: "var(--accent)",
                cursor: "pointer",
              }}
            >
              {initials}
            </div>
          </Link>

          {/* Mobile hamburger */}
          <button
            className="flex items-center justify-center md:hidden"
            onClick={() => {
              console.log('hamburger clicked', !mobileOpen);
              setMobileOpen((o) => !o);
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div
          className="flex flex-col md:hidden"
          style={{
            position: "fixed",
            top: 56,
            left: 0,
            right: 0,
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border)",
            padding: "8px 16px",
            zIndex: 100,
            gap: 4,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 8,
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "0.9rem",
                textDecoration: "none",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                background: isActive ? "var(--accent-subtle)" : "transparent",
              })}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </>
  );
}
