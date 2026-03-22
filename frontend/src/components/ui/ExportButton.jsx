// ExportButton.jsx — Reusable CSV download button with loading state.

import { useState } from "react";
import { Download } from "lucide-react";

export default function ExportButton({
  onExport,
  label = "Export CSV",
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading || disabled) return;
    setLoading(true);
    try {
      await onExport();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 8,
        border: "1px solid var(--accent-green-border)",
        background:
          loading || disabled ? "var(--bg-elevated)" : "var(--accent-green-bg)",
        color:
          loading || disabled ? "var(--text-muted)" : "var(--accent-green)",
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: "0.8rem",
        cursor: loading || disabled ? "not-allowed" : "pointer",
        transition: "all 150ms ease",
        opacity: disabled ? 0.5 : 1,
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading)
          e.currentTarget.style.background =
            "color-mix(in srgb, var(--accent-green) 20%, transparent)";
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading)
          e.currentTarget.style.background = "var(--accent-green-bg)";
      }}
    >
      {loading ? (
        <svg
          style={{
            width: 14,
            height: 14,
            animation: "spin 0.8s linear infinite",
            flexShrink: 0,
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" opacity="0.2" />
          <path d="M4 12a8 8 0 018-8V0" />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </svg>
      ) : (
        <Download size={14} style={{ flexShrink: 0 }} />
      )}
      {loading ? "Exporting..." : label}
    </button>
  );
}
