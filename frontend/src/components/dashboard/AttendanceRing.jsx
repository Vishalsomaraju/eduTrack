// AttendanceRing.jsx — SVG circular progress ring showing a student's
// attendance percentage for one subject. Animation fires once on mount.

import { motion } from "framer-motion";

function ringColor(pct) {
  return "var(--accent)";
}

export default function AttendanceRing({
  percentage,
  subjectName,
  subjectCode,
  size = 120,
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(percentage, 100) / 100) * circumference;
  const stroke = ringColor(percentage);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      {/* Ring + center text */}
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={6}
          />
          {/* Progress */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        </svg>

        {/* Center percentage */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "var(--text-primary)",
            pointerEvents: "none",
          }}
        >
          {percentage}%
        </div>
      </div>

      {/* Subject label below ring */}
      <div
        style={{
          marginTop: 10,
          textAlign: "center",
          maxWidth: size,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: "0.8rem",
            color: "var(--text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: size,
          }}
        >
          {subjectName}
        </div>
        {subjectCode && (
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: "0.7rem",
              color: "var(--text-muted)",
              marginTop: 2,
            }}
          >
            {subjectCode}
          </div>
        )}
      </div>
    </div>
  );
}
