// AttendanceCalendar.jsx — Monthly calendar view of a student's attendance.
// Props: records=[{date, status}], month (0-indexed), year

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STATUS_STYLE = {
  present: {
    background: "var(--accent-green-bg)",
    color: "var(--accent-green)",
    border: "1px solid var(--accent-green-border)",
  },
  absent: {
    background: "var(--accent-red-bg)",
    color: "var(--accent-red)",
    border: "1px solid var(--accent-red-border)",
  },
  late: {
    background: "var(--accent-amber-bg)",
    color: "var(--accent-amber)",
    border: "1px solid var(--accent-amber-border)",
  },
};

// Returns how many days in a given month
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Returns the ISO weekday of the 1st (0=Mon, 6=Sun)
function firstWeekday(year, month) {
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
}

// Zero-pad a number to 2 digits
function pad(n) {
  return String(n).padStart(2, "0");
}

export default function AttendanceCalendar({
  records = [],
  month: initMonth,
  year: initYear,
}) {
  const today = new Date();

  const [month, setMonth] = useState(initMonth ?? today.getMonth());
  const [year, setYear] = useState(initYear ?? today.getFullYear());

  // Build lookup: "YYYY-MM-DD" → status
  const recordMap = {};
  for (const r of records) {
    recordMap[r.date] = r.status;
  }

  const totalDays = daysInMonth(year, month);
  const offset = firstWeekday(year, month);
  // Pad to full weeks
  const totalCells = Math.ceil((offset + totalDays) / 7) * 7;

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  function dateStr(day) {
    return `${year}-${pad(month + 1)}-${pad(day)}`;
  }

  function isToday(day) {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  }

  function isFuture(day) {
    const d = new Date(year, month, day);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d > t;
  }

  return (
    <Card title="Monthly View">
      {/* ── Month nav ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Previous month"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            padding: 4,
            borderRadius: 6,
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "0.9rem",
            color: "var(--text-primary)",
          }}
        >
          {MONTH_NAMES[month]} {year}
        </span>

        <button
          type="button"
          onClick={nextMonth}
          aria-label="Next month"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            padding: 4,
            borderRadius: 6,
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ── Weekday headers ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          marginBottom: 4,
        }}
      >
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--text-muted)",
              padding: "4px 0",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* ── Calendar grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
        }}
      >
        {Array.from({ length: totalCells }, (_, i) => {
          const day = i - offset + 1;
          const valid = day >= 1 && day <= totalDays;
          if (!valid) return <div key={i} style={{ aspectRatio: "1" }} />;

          const ds = dateStr(day);
          const status = recordMap[ds];
          const future = isFuture(day);
          const todayCell = isToday(day);
          const sStyle = status ? STATUS_STYLE[status] : {};

          return (
            <div
              key={i}
              style={{
                aspectRatio: "1",
                maxWidth: 36,
                maxHeight: 36,
                width: "100%",
                margin: "0 auto",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-body)",
                fontSize: "0.8rem",
                fontWeight: status ? 600 : 400,
                color: status ? sStyle.color : "var(--text-muted)",
                background: status ? sStyle.background : "transparent",
                border: status ? sStyle.border : "1px solid transparent",
                boxShadow: todayCell ? "0 0 0 2px var(--accent)" : "none",
                opacity: future ? 0.3 : 1,
                pointerEvents: future ? "none" : "auto",
                cursor: "default",
                userSelect: "none",
              }}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* ── Legend ── */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 16,
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "Present", color: "var(--accent-green)" },
          { label: "Absent", color: "var(--accent-red)" },
          { label: "Late", color: "var(--accent-amber)" },
        ].map(({ label, color }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
