// RecentActivity.jsx — Timeline of recent attendance records for the student.
// Displays last 10 records sorted by date desc.
//
// Props:
//   records  = [{ date, status, subject_name }]
//   loading  = bool

import { Calendar } from "lucide-react";
import { Badge, Card } from "@/components/ui";

const STATUS_COLORS = {
  present: "var(--accent-green)",
  absent: "var(--accent-red)",
  late: "var(--accent-amber)",
};

const STATUS_BADGE_VARIANTS = {
  present: "green",
  absent: "red",
  late: "amber",
};

// ── Skeleton row ───────────────────────────────────────────────────────────
function SkeletonRow() {
  const shimmer = {
    background:
      "linear-gradient(90deg, var(--bg-elevated) 0%, rgba(255,255,255,0.04) 50%, var(--bg-elevated) 100%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
    borderRadius: 4,
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ minWidth: 80 }}>
        <div style={{ ...shimmer, height: 14, width: 36, marginBottom: 4 }} />
        <div style={{ ...shimmer, height: 12, width: 28 }} />
      </div>
      <div style={{ ...shimmer, height: 8, width: 8, borderRadius: "50%" }} />
      <div style={{ flex: 1 }}>
        <div
          style={{ ...shimmer, height: 14, width: "60%", marginBottom: 4 }}
        />
        <div style={{ ...shimmer, height: 20, width: 56 }} />
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function RecentActivity({ records = [], loading = false }) {
  if (loading) {
    return (
      <Card title="Recent Activity">
        {[0, 1, 2, 3, 4].map((i) => (
          <SkeletonRow key={i} />
        ))}
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card title="Recent Activity">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 0",
            gap: 10,
          }}
        >
          <Calendar
            size={28}
            style={{ color: "var(--text-muted)", opacity: 0.5 }}
          />
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              color: "var(--text-muted)",
              fontStyle: "italic",
            }}
          >
            No recent activity
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Recent Activity">
      {records.map((record, idx) => {
        const date = new Date(record.date + "T00:00:00");
        const day = date.toLocaleDateString("en-GB", { day: "2-digit" });
        const month = date.toLocaleDateString("en-GB", { month: "short" });
        const dotColor = STATUS_COLORS[record.status] ?? "var(--text-muted)";
        const badgeVariant = STATUS_BADGE_VARIANTS[record.status] ?? "default";
        const isLast = idx === records.length - 1;

        return (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 0",
              borderBottom: isLast ? "none" : "1px solid var(--border)",
            }}
          >
            {/* Date column */}
            <div style={{ minWidth: 80 }}>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "var(--text-primary)",
                  lineHeight: 1,
                }}
              >
                {day}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                {month}
              </div>
            </div>

            {/* Status dot */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: dotColor,
                flexShrink: 0,
              }}
            />

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  color: "var(--text-primary)",
                  marginBottom: 4,
                }}
              >
                {record.subject_name}
              </div>
              <Badge variant={badgeVariant} size="sm">
                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
              </Badge>
            </div>
          </div>
        );
      })}
    </Card>
  );
}
