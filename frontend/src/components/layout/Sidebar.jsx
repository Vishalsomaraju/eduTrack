import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  CalendarCheck,
  ClipboardList,
  BarChart2,
  Users,
  GraduationCap,
  BookOpen,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

const NAV_SECTIONS = [
  {
    label: null,
    items: [{ label: "Dashboard", icon: LayoutGrid, path: "/dashboard" }],
  },
  {
    label: "Academic",
    items: [
      { label: "Attendance", icon: CalendarCheck, path: "/attendance" },
      { label: "Marks", icon: ClipboardList, path: "/marks" },
      {
        label: "Analytics",
        icon: BarChart2,
        path: "/analytics",
        roles: ["admin", "faculty"],
      },
    ],
  },
  {
    label: "Admin",
    sectionRoles: ["admin"],
    items: [
      { label: "Students", icon: Users, path: "/students" },
      { label: "Faculty", icon: GraduationCap, path: "/faculty" },
      { label: "Subjects", icon: BookOpen, path: "/subjects" },
    ],
  },
];

function Avatar({ profile, size = 28 }) {
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
        fontSize: "0.65rem",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
}

function NavItem({ item, compact, isActive, onClose }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const Icon = item.icon;

  return (
    <div style={{ position: "relative" }}>
      <Link
        to={item.path}
        onClick={onClose}
        onMouseEnter={() => compact && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          height: 40,
          padding: compact ? "0 13px" : "0 10px",
          borderRadius: 8,
          fontFamily: "var(--font-body)",
          fontWeight: isActive ? 600 : 500,
          fontSize: "0.875rem",
          color: isActive ? "var(--accent)" : "var(--text-muted)",
          textDecoration: "none",
          cursor: "pointer",
          transition: "all 150ms ease",
          background: isActive ? "var(--accent-subtle)" : "transparent",
          boxShadow: isActive ? "inset 3px 0 0 var(--accent)" : "none",
          justifyContent: compact ? "center" : "flex-start",
          whiteSpace: "nowrap",
        }}
      >
        <Icon size={18} strokeWidth={1.75} style={{ flexShrink: 0 }} />
        <span
          style={{
            opacity: compact ? 0 : 1,
            width: compact ? 0 : "auto",
            overflow: "hidden",
            transition: "opacity 150ms ease, width 150ms ease",
          }}
        >
          {item.label}
        </span>
      </Link>

      {compact && showTooltip && (
        <div
          style={{
            position: "absolute",
            left: 52,
            top: "50%",
            transform: "translateY(-50%)",
            background: "var(--bg-overlay)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid var(--border)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 200,
          }}
        >
          {item.label}
        </div>
      )}
    </div>
  );
}

function SidebarContent({ compact, onClose }) {
  const [showUserPopover, setShowUserPopover] = useState(false);
  const location = useLocation();
  const { profile, role } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 10,
          justifyContent: compact ? "center" : "flex-start",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--accent-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--accent)",
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            E
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--text-primary)",
            whiteSpace: "nowrap",
            opacity: compact ? 0 : 1,
            width: compact ? 0 : "auto",
            overflow: "hidden",
            transition: "opacity 150ms ease, width 150ms ease",
          }}
        >
          EduTrack
        </span>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "4px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {NAV_SECTIONS.map((section, si) => {
          if (section.sectionRoles && !section.sectionRoles.includes(role)) {
            return null;
          }
          const visibleItems = section.items.filter(
            (item) => !item.roles || item.roles.includes(role),
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={si} style={{ marginBottom: 4 }}>
              {section.label && !compact && (
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "8px 10px 4px",
                  }}
                >
                  {section.label}
                </div>
              )}
              {visibleItems.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  compact={compact}
                  isActive={location.pathname === item.path}
                  onClose={onClose}
                />
              ))}
            </div>
          );
        })}
      </div>

      <div style={{ padding: "8px 10px", flexShrink: 0 }}>
        <div
          style={{ height: 1, background: "var(--border)", marginBottom: 6 }}
        />

        <button
          onClick={toggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 40,
            width: "100%",
            padding: compact ? "0 13px" : "0 10px",
            borderRadius: 8,
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            cursor: "pointer",
            transition: "all 150ms ease",
            background: "transparent",
            border: "none",
            justifyContent: compact ? "center" : "flex-start",
          }}
        >
          {theme === "dark" ? (
            <Sun size={18} strokeWidth={1.75} style={{ flexShrink: 0 }} />
          ) : (
            <Moon size={18} strokeWidth={1.75} style={{ flexShrink: 0 }} />
          )}
          <span
            style={{
              opacity: compact ? 0 : 1,
              width: compact ? 0 : "auto",
              overflow: "hidden",
              whiteSpace: "nowrap",
              transition: "opacity 150ms ease, width 150ms ease",
            }}
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowUserPopover((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              height: 40,
              width: "100%",
              padding: compact ? "0 13px" : "0 10px",
              borderRadius: 8,
              cursor: "pointer",
              background: "transparent",
              border: "none",
              justifyContent: compact ? "center" : "flex-start",
              overflow: "hidden",
            }}
          >
            <Avatar profile={profile} size={28} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                flex: 1,
                overflow: "hidden",
                opacity: compact ? 0 : 1,
                width: compact ? 0 : "auto",
                transition: "opacity 150ms ease, width 150ms ease",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "0.8rem",
                  color: "var(--text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                }}
              >
                {profile?.name ?? "User"}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: "0.65rem",
                  color: "var(--text-muted)",
                  textTransform: "capitalize",
                }}
              >
                {role ?? ""}
              </span>
            </div>
          </button>

          <AnimatePresence>
            {showUserPopover && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 4 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute",
                  bottom: "110%",
                  left: 0,
                  right: 0,
                  background: "var(--bg-overlay)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  boxShadow: "var(--shadow-md)",
                  padding: 6,
                  zIndex: 100,
                }}
              >
                <button
                  onClick={() => {
                    setShowUserPopover(false);
                    signOut();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    color: "var(--accent-red)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <LogOut size={16} style={{ flexShrink: 0 }} />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  const [isTabletCollapsed, setIsTabletCollapsed] = useState(false);

  useEffect(() => {
    function update() {
      if (typeof window === "undefined") return;
      const w = window.innerWidth;
      setIsTabletCollapsed(w >= 768 && w < 1024);
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:relative top-0 left-0 h-full z-50 md:z-auto transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } w-60 md:w-16 lg:w-60`}
      >
        <SidebarContent compact={isTabletCollapsed} onClose={onClose} />
      </aside>
    </>
  );
}
