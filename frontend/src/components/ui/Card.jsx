// Card.jsx — Premium glass-surface container panel.
//             Top-edge highlight, layered shadows, optional header,
//             hoverable lift via Framer Motion.

import { motion } from "framer-motion";

export default function Card({
  children,
  title,
  action,
  hoverable = false,
  className = "",
}) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: "var(--bg-surface)",
        borderRadius: "var(--radius-card)",
        /* Base border — top edge gets the glass highlight below */
        border: "1px solid var(--border)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.15)",
      }}
      whileHover={
        hoverable
          ? {
              y: -3,
              boxShadow:
                "0 12px 40px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.2)",
            }
          : {}
      }
      transition={
        hoverable ? { type: "tween", duration: 0.2, ease: "easeOut" } : {}
      }
    >
      {/* Optional header with gradient wash */}
      {(title || action) && (
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background:
              "linear-gradient(180deg, var(--bg-elevated) 0%, transparent 100%)",
          }}
        >
          {title && (
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.9rem",
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              {title}
            </h3>
          )}
          {action && (
            <div style={{ display: "flex", alignItems: "center" }}>
              {action}
            </div>
          )}
        </div>
      )}

      {/* Content area with padding variant */}
      <div className="p-3 sm:p-4 lg:p-5">{children}</div>
    </motion.div>
  );
}
