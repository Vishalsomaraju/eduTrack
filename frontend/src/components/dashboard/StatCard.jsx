// StatCard.jsx — Reusable metric card used across all role dashboards.
// Shared component: student, faculty, and admin dashboards all import this.

import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const VALUE_COLORS = {
  default: "var(--accent)",
  green: "var(--accent-green)",
  red: "var(--accent-red)",
  amber: "var(--accent-amber)",
  blue: "var(--accent-blue)",
};

// ── Shimmer skeleton ───────────────────────────────────────────────────────
function Skeleton({ w, h, radius = 6 }) {
  return (
    <div
      style={{
        height: h,
        width: w,
        borderRadius: radius,
        background:
          "linear-gradient(90deg, var(--bg-elevated) 0%, rgba(255,255,255,0.04) 50%, var(--bg-elevated) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  color = "default",
  loading = false,
}) {
  const valueColor = VALUE_COLORS[color] ?? VALUE_COLORS.default;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, var(--bg-surface) 0%, rgba(197,125,94,0.03) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "clamp(1.25rem, 2vw, 1.5rem)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Icon — absolute top-right */}
      {Icon && (
        <Icon
          size={20}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "var(--text-muted)",
            opacity: 0.4,
          }}
        />
      )}

      {/* Label */}
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--text-muted)",
          marginBottom: 8,
        }}
      >
        {label}
      </div>

      {/* Value */}
      {loading ? (
        <div style={{ marginBottom: 6 }}>
          <Skeleton h={32} w={96} />
        </div>
      ) : (
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "2rem",
            color: valueColor,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </div>
      )}

      {/* Sub */}
      {loading ? (
        <div style={{ marginTop: 6 }}>
          <Skeleton h={14} w={128} />
        </div>
      ) : (
        sub && (
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            {sub}
          </div>
        )
      )}

      {/* Trend */}
      {!loading && trend && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {trend.direction === "up" ? (
            <ArrowUpRight
              size={14}
              style={{ color: "var(--accent-green)", flexShrink: 0 }}
            />
          ) : (
            <ArrowDownRight
              size={14}
              style={{ color: "var(--accent-red)", flexShrink: 0 }}
            />
          )}
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "0.75rem",
              color:
                trend.direction === "up"
                  ? "var(--accent-green)"
                  : "var(--accent-red)",
            }}
          >
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}
