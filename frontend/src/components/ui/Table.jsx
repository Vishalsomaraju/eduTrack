// Table.jsx — Data table with columns config, shimmer skeleton loading,
//             empty state with icon, left-edge accent bar on hover,
//             and custom render fn support.

const SHIMMER_WIDTHS = ["80%", "60%", "70%", "65%", "75%"];

function SkeletonRow({ colCount }) {
  return (
    <tr>
      {Array.from({ length: colCount }).map((_, i) => (
        <td
          key={i}
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              height: "14px",
              borderRadius: "4px",
              width: SHIMMER_WIDTHS[i % SHIMMER_WIDTHS.length],
              background:
                "linear-gradient(90deg, var(--bg-elevated) 0%, rgba(255,255,255,0.05) 50%, var(--bg-elevated) 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />
        </td>
      ))}
    </tr>
  );
}

function EmptyState({ message }) {
  return (
    <tr>
      <td
        colSpan={999}
        style={{
          padding: "60px 24px",
          textAlign: "center",
          verticalAlign: "middle",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {/* Inbox / empty icon */}
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--text-muted)", opacity: 0.4 }}
            aria-hidden="true"
          >
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              color: "var(--text-muted)",
              fontStyle: "italic",
            }}
          >
            {message}
          </span>
        </div>
      </td>
    </tr>
  );
}

function DataRow({ row, rowIndex, columns, onRowClick }) {
  const clickable = !!onRowClick;
  const baseBackground =
    rowIndex % 2 === 0 ? "var(--bg-surface)" : "rgba(255,255,255,0.015)";

  function handleEnter(e) {
    if (!clickable) return;
    e.currentTarget.style.background = "var(--accent-subtle)";
    e.currentTarget.style.boxShadow = "inset 3px 0 0 var(--accent)";
  }

  function handleLeave(e) {
    if (!clickable) return;
    e.currentTarget.style.background = baseBackground;
    e.currentTarget.style.boxShadow = "none";
  }

  return (
    <tr
      onClick={clickable ? () => onRowClick(row) : undefined}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        background: baseBackground,
        cursor: clickable ? "pointer" : "default",
        transition: "all 150ms ease",
      }}
    >
      {columns.map((col) => (
        <td
          key={col.key}
          style={{
            padding: "14px 16px",
            fontSize: "0.875rem",
            fontFamily: "var(--font-body)",
            color: "var(--text-primary)",
            borderBottom: "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
            verticalAlign: "middle",
            whiteSpace: "nowrap",
          }}
        >
          {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
        </td>
      ))}
    </tr>
  );
}

export default function Table({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No data available.",
  onRowClick,
  className = "",
}) {
  if (columns.length === 0) return null;

  return (
    <div
      className={className}
      style={{
        overflowX: "auto",
        borderRadius: "12px",
        border: "1px solid var(--border)",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "var(--font-body)",
        }}
      >
        <thead>
          <tr
            style={{
              background: "var(--bg-elevated)",
              borderBottom: "2px solid var(--border)",
            }}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} colCount={columns.length} />
            ))
          ) : data.length === 0 ? (
            <EmptyState message={emptyMessage} />
          ) : (
            data.map((row, rowIndex) => (
              <DataRow
                key={row.id ?? rowIndex}
                row={row}
                rowIndex={rowIndex}
                columns={columns}
                onRowClick={onRowClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
