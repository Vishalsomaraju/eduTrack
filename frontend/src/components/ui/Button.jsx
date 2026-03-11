// Button.jsx — Reusable action button with 4 variants

import { motion } from "framer-motion";

const variantStyles = {
  primary: {
    background: "var(--accent)",
    color: "var(--bg-base)",
    border: "1px solid var(--accent)",
  },
  secondary: {
    background: "transparent",
    color: "var(--text-primary)",
    border: "1px solid var(--border)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-muted)",
    border: "1px solid transparent",
  },
  danger: {
    background: "var(--accent-red)",
    color: "#fff",
    border: "1px solid var(--accent-red)",
  },
};

const hoverStyles = {
  primary: { background: "var(--accent-hover)" },
  secondary: { background: "var(--bg-surface)" },
  ghost: { background: "var(--bg-surface)" },
  danger: { opacity: 0.9 },
};

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  loading = false,
  type = "button",
  className = "",
}) {
  const style = variantStyles[variant] || variantStyles.primary;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-body text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={style}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
    >
      {loading && <Spinner />}
      {children}
    </motion.button>
  );
}
