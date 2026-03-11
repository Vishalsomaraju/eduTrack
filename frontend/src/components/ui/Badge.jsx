// Badge.jsx — Small status tag with color variants

const variantStyles = {
  green: {
    background: "rgba(16, 185, 129, 0.15)",
    color: "var(--accent-green)",
    borderColor: "var(--accent-green)",
  },
  amber: {
    background: "rgba(245, 166, 35, 0.15)",
    color: "var(--accent)",
    borderColor: "var(--accent)",
  },
  red: {
    background: "rgba(239, 68, 68, 0.15)",
    color: "var(--accent-red)",
    borderColor: "var(--accent-red)",
  },
  blue: {
    background: "rgba(59, 130, 246, 0.15)",
    color: "var(--accent-blue)",
    borderColor: "var(--accent-blue)",
  },
  gray: {
    background: "rgba(107, 127, 163, 0.15)",
    color: "var(--text-muted)",
    borderColor: "var(--text-muted)",
  },
};

export default function Badge({ children, variant = "gray", className = "" }) {
  const style = variantStyles[variant] || variantStyles.gray;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
