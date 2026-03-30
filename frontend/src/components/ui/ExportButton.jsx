// ExportButton.jsx — Slim CSV download trigger.
// Matches EduTrack design tokens. Drop-in anywhere.
//
// Props:
//   onClick  — fn  (call downloadCSV inside)
//   label    — string (default "Export CSV")
//   disabled — bool

import { Download } from "lucide-react";

export default function ExportButton({
  onClick,
  label = "Export CSV",
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 8,
        border: "1px solid var(--border)",
        background: "transparent",
        color: disabled ? "var(--text-muted)" : "var(--text-secondary)",
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: "0.8rem",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 150ms ease",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "var(--bg-elevated)";
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.color = "var(--accent)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.color = disabled
          ? "var(--text-muted)"
          : "var(--text-secondary)";
      }}
    >
      <Download size={14} />
      {label}
    </button>
  );
}
