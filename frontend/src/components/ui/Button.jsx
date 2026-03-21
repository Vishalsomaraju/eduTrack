// Button.jsx — Premium action button: 4 variants, 3 sizes,
//              gradient fills, glow shadows, ghost underline,
//              loading state that preserves button width.

import { motion } from "framer-motion";
import { useState } from "react";

const SIZE = {
  sm: { height: "32px", padding: "0 12px", fontSize: "0.8rem" },
  md: { height: "40px", padding: "0 20px", fontSize: "0.875rem" },
  lg: { height: "48px", padding: "0 28px", fontSize: "1rem" },
};

function Spinner() {
  return (
    <svg
      className="animate-spin"
      style={{ width: 16, height: 16, flexShrink: 0 }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        style={{ opacity: 0.2 }}
      />
      <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function buildStyle(variant, hovered, isInactive) {
  const h = hovered && !isInactive;

  switch (variant) {
    case "primary":
      return {
        background: "linear-gradient(135deg, var(--accent-btn-from) 0%, var(--accent-btn-to) 100%)",
        color: "var(--accent-btn-text)",
        border: "none",
        borderTop: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: h
          ? "0 4px 20px var(--accent-btn-shadow), inset 0 1px 0 rgba(255,255,255,0.18)"
          : "0 2px 8px var(--accent-btn-shadow), inset 0 1px 0 rgba(255,255,255,0.18)",
        filter: h ? "brightness(1.1)" : undefined,
      };

    case "secondary":
      return {
        background: h
          ? "var(--accent-subtle)"
          : "color-mix(in srgb, var(--bg-elevated) 80%, transparent)",
        color: "var(--text-primary)",
        border: h
          ? "1px solid color-mix(in srgb, var(--accent) 60%, transparent)"
          : "1px solid var(--border)",
        backdropFilter: "blur(8px)",
      };

    case "ghost":
      return {
        background: "transparent",
        color: h ? "var(--text-primary)" : "var(--text-muted)",
        border: "1px solid transparent",
      };

    case "danger":
      return {
        background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
        color: "#ffffff",
        border: "none",
        boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
      };

    default:
      return {};
  }
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  loading = false,
  size = "md",
  fullWidth = false,
  type = "button",
  className = "",
}) {
  const [hovered, setHovered] = useState(false);
  const isInactive = disabled || loading;
  const sz = SIZE[size] ?? SIZE.md;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isInactive}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={isInactive ? {} : { scale: 1.02 }}
      whileTap={isInactive ? {} : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={[
        "inline-flex items-center justify-center relative",
        isInactive ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...sz,
        ...buildStyle(variant, hovered, isInactive),
        borderRadius: "10px",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        letterSpacing: "0.02em",
        transition: "all 150ms ease",
        userSelect: "none",
        outline: "none",
      }}
    >
      {/* Children invisible when loading — preserves button width */}
      <span
        style={{
          opacity: loading ? 0 : 1,
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {variant === "ghost" ? (
          /* Ghost gets an animated underline */
          <span style={{ position: "relative" }}>
            {children}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: -2,
                left: 0,
                width: hovered && !isInactive ? "100%" : 0,
                height: "1px",
                background: "currentColor",
                display: "block",
                transition: "width 200ms ease",
              }}
            />
          </span>
        ) : (
          children
        )}
      </span>

      {/* Centered spinner overlaid when loading */}
      {loading && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spinner />
        </span>
      )}
    </motion.button>
  );
}
