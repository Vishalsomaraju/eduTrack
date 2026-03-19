// AttendanceHeatmap.jsx — Monthly heatmap grid showing attendance density.
// Each cell = one day, color intensity = attendance %.
//
// Props:
//   data    — [{ date: 'YYYY-MM-DD', percentage: 87 }]
//   loading — bool

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui";

const DAY_HEADERS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const LEGEND_ITEMS = [
  { label: "< 40%", color: "var(--accent-red)", opacity: 0.8 },
  { label: "40–60%", color: "var(--accent-red)", opacity: 0.4 },
  { label: "60–75%", color: "var(--accent-amber)", opacity: 0.6 },
  { label: "75–90%", color: "var(--accent-green)", opacity: 0.55 },
  { label: "≥ 90%", color: "var(--accent-green)", opacity: 0.9 },
];

function getCellStyle(pct) {
  if (pct >= 90) return { background: "var(--accent-green)", opacity: 0.9 };
  if (pct >= 75) return { background: "var(--accent-green)", opacity: 0.55 };
  if (pct >= 60) return { background: "var(--accent-amber)", opacity: 0.6 };
  if (pct >= 40) return { background: "var(--accent-red)", opacity: 0.4 };
  return { background: "var(--accent-red)", opacity: 0.8 };
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function HeatmapSkeleton() {
  return (
    <div>
      {/* Day headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 36px)",
          gap: 4,
          marginBottom: 4,
        }}
      >
        {DAY_HEADERS.map((h) => (
          <div
            key={h}
            style={{
              width: 36,
              textAlign: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "0.6rem",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            {h}
          </div>
        ))}
      </div>
      {/* Shimmer cells */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 36px)",
          gap: 4,
        }}
      >
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              background:
                "linear-gradient(90deg, var(--bg-elevated) 0%, rgba(255,255,255,0.04) 50%, var(--bg-elevated) 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
              animationDelay: `${(i % 7) * 0.05}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AttendanceHeatmap({ data = [], loading = false }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed

  // Build date → percentage lookup
  const dataMap = useMemo(() => {
    const map = {};
    for (const entry of data) {
      map[entry.date] = entry.percentage;
    }
    return map;
  }, [data]);

  // Month navigation
  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    const isCurrentMonth =
      viewYear === now.getFullYear() && viewMonth === now.getMonth();
    if (isCurrentMonth) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const isAtCurrentMonth =
    viewYear === now.getFullYear() && viewMonth === now.getMonth();

  // Build grid cells
  const { cells, daysInMonth } = useMemo(() => {
    const days = new Date(viewYear, viewMonth + 1, 0).getDate();
    // Monday-first offset: getDay() 0=Sun,1=Mon...6=Sat → Mon=0 offset
    const offset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

    const result = [];
    // Empty placeholder cells at start
    for (let i = 0; i < offset; i++) {
      result.push(null);
    }
    // Day cells
    for (let d = 1; d <= days; d++) {
      const mm = String(viewMonth + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      const dateStr = `${viewYear}-${mm}-${dd}`;
      const pct = dataMap[dateStr];
      result.push({ day: d, date: dateStr, pct });
    }

    return { cells: result, daysInMonth: days };
  }, [viewYear, viewMonth, dataMap]);

  // Today's date string
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // Month label
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    "en-GB",
    { month: "long", year: "numeric" },
  );

  const navigator = (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button
        onClick={prevMonth}
        aria-label="Previous month"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          padding: "2px 4px",
          borderRadius: 4,
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "var(--text-primary)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "var(--text-muted)")
        }
      >
        <ChevronLeft size={14} />
      </button>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          minWidth: 90,
          textAlign: "center",
        }}
      >
        {monthLabel}
      </span>
      <button
        onClick={nextMonth}
        disabled={isAtCurrentMonth}
        aria-label="Next month"
        style={{
          background: "none",
          border: "none",
          cursor: isAtCurrentMonth ? "default" : "pointer",
          color: isAtCurrentMonth ? "var(--border)" : "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          padding: "2px 4px",
          borderRadius: 4,
        }}
        onMouseEnter={(e) => {
          if (!isAtCurrentMonth)
            e.currentTarget.style.color = "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          if (!isAtCurrentMonth)
            e.currentTarget.style.color = "var(--text-muted)";
        }}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );

  return (
    <Card title="Attendance Heatmap" action={navigator}>
      {loading ? (
        <HeatmapSkeleton />
      ) : (
        <>
          {/* Day headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 36px)",
              gap: 4,
              marginBottom: 4,
            }}
          >
            {DAY_HEADERS.map((h) => (
              <div
                key={h}
                style={{
                  width: 36,
                  textAlign: "center",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 36px)",
              gap: 4,
            }}
          >
            {cells.map((cell, i) => {
              if (!cell) {
                return (
                  <div key={`empty-${i}`} style={{ width: 36, height: 36 }} />
                );
              }

              const isToday = cell.date === todayStr;
              const hasPct = cell.pct !== undefined;
              const cellStyle = hasPct
                ? getCellStyle(cell.pct)
                : { background: "var(--bg-elevated)", opacity: 0.4 };

              return (
                <div
                  key={cell.date}
                  title={hasPct ? `${cell.date}: ${cell.pct}%` : cell.date}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    background: cellStyle.background,
                    opacity: cellStyle.opacity,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.65rem",
                    color: "var(--bg-base)",
                    fontWeight: hasPct ? 600 : 400,
                    boxShadow: isToday ? "0 0 0 2px var(--accent)" : undefined,
                    cursor: hasPct ? "default" : "default",
                    userSelect: "none",
                  }}
                >
                  {cell.day}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 14,
              flexWrap: "wrap",
            }}
          >
            {LEGEND_ITEMS.map((item) => (
              <div
                key={item.label}
                style={{ display: "flex", alignItems: "center", gap: 5 }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: item.color,
                    opacity: item.opacity,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
