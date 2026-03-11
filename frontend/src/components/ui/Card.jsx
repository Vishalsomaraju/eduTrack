// Card.jsx — Container panel for dashboard sections

export default function Card({ children, title, action, className = "" }) {
  return (
    <div
      className={`rounded-xl p-6 border ${className}`}
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border)",
      }}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3
              className="font-display font-semibold text-lg"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
