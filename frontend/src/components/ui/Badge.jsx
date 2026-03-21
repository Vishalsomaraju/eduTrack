// Badge.jsx — Status pill with 5 color variants, dot indicator, sm/md sizes.
//             Red dot pulses to draw attention to at-risk students.
//             Colors adapt correctly between dark and light themes via CSS vars.

const VARIANT = {
  green: {
    background: "var(--accent-green-bg)",
    color: "var(--accent-green)",
    border: "1px solid var(--accent-green-border)",
  },
  amber: {
    background: "var(--accent-amber-bg)",
    color: "var(--accent-amber)",
    border: "1px solid var(--accent-amber-border)",
  },
  red: {
    background: "var(--accent-red-bg)",
    color: "var(--accent-red)",
    border: "1px solid var(--accent-red-border)",
  },
  blue: {
    background: "var(--accent-blue-bg)",
    color: "var(--accent-blue)",
    border: "1px solid var(--accent-blue-border)",
  },
  gray: {
    background: "rgba(107, 127, 163, 0.1)",
    color: "var(--text-muted)",
    border: "1px solid rgba(107, 127, 163, 0.2)",
  },
};

const SIZE = {
  sm: { fontSize: "0.65rem", padding: "2px 8px" },
  md: { fontSize: "0.75rem", padding: "4px 10px" },
};

export default function Badge({
  children,
  variant = "gray",
  dot = false,
  size = "md",
  className = "",
}) {
  const variantStyle = VARIANT[variant] ?? VARIANT.gray;
  const sizeStyle = SIZE[size] ?? SIZE.md;
  const isPulse = dot && variant === "red";

  return (
    <span
      className={className}
      style={{
        ...variantStyle,
        ...sizeStyle,
        borderRadius: "9999px",
        fontFamily: "var(--font-body)",
        fontWeight: 700,
        letterSpacing: "0.04em",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        backdropFilter: "blur(4px)",
      }}
    >
      {dot && (
        <span
          aria-hidden="true"
          /* badge-dot-pulse class adds the pulsing ring via globals.css */
          className={isPulse ? "badge-dot-pulse" : ""}
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "currentColor",
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}
