// UITest.jsx — TESTING PAGE ONLY. Delete after auth is built.
// Shows every variant of every UI primitive with a theme toggle.

import { useState, useEffect } from "react";
import { Button, Card, Badge, Input, Table } from "../components/ui";

// ── Sample data for Table demo ──────────────────────────────
const STUDENTS = [
  {
    id: 1,
    name: "Arjun Mehta",
    subject: "Data Structures",
    attendance: "92%",
    status: "present",
    grade: "A",
  },
  {
    id: 2,
    name: "Priya Sharma",
    subject: "Algorithms",
    attendance: "68%",
    status: "at-risk",
    grade: "C",
  },
  {
    id: 3,
    name: "Rahul Gupta",
    subject: "DBMS",
    attendance: "78%",
    status: "late",
    grade: "B",
  },
  {
    id: 4,
    name: "Sneha Patel",
    subject: "Networks",
    attendance: "45%",
    status: "absent",
    grade: "D",
  },
  {
    id: 5,
    name: "Vikram Nair",
    subject: "OS",
    attendance: "88%",
    status: "present",
    grade: "A+",
  },
];

const STATUS_VARIANT = {
  present: "green",
  late: "amber",
  absent: "red",
  "at-risk": "red",
};

const COLUMNS = [
  { key: "name", label: "Student" },
  { key: "subject", label: "Subject" },
  {
    key: "attendance",
    label: "Attendance",
    render: (val) => {
      const pct = parseInt(val);
      const variant = pct >= 80 ? "green" : pct >= 70 ? "amber" : "red";
      return <Badge variant={variant}>{val}</Badge>;
    },
  },
  {
    key: "status",
    label: "Status",
    render: (val) => (
      <Badge variant={STATUS_VARIANT[val] ?? "gray"} dot>
        {val}
      </Badge>
    ),
  },
  { key: "grade", label: "Grade" },
];

// ── Section wrapper — amber left border, Syne 2rem title ────
function Section({ title, children }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "2rem",
            color: "var(--text-primary)",
            borderLeft: "3px solid var(--accent)",
            paddingLeft: "16px",
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {title}
        </h2>
        <div
          style={{
            height: "1px",
            background: "var(--border)",
            marginTop: "16px",
          }}
        />
      </div>
      {children}
    </section>
  );
}

// ── Row helper ──────────────────────────────────────────────
function Row({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {label && (
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
          }}
        >
          {label}
        </span>
      )}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Eye icon for password toggle ────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ── Search icon ─────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ── Main test page ──────────────────────────────────────────
export default function UITest() {
  const [theme, setTheme] = useState("dark");
  const [showPassword, setShowPassword] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [emailVal, setEmailVal] = useState("");
  const [passwordVal, setPasswordVal] = useState("");
  const [tableState, setTableState] = useState("data");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* ── Sticky Header ─────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background:
                "linear-gradient(135deg, var(--accent-btn-from) 0%, var(--accent-btn-to) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px var(--accent-btn-shadow)",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "0.8rem",
                color: "var(--accent-btn-text)",
                lineHeight: 1,
              }}
            >
              E
            </span>
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.05rem",
              color: "var(--text-primary)",
            }}
          >
            EduTrack{" "}
            <span
              style={{
                fontWeight: 400,
                fontSize: "0.85rem",
                color: "var(--text-muted)",
              }}
            >
              UI Kit
            </span>
          </span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        >
          {theme === "dark" ? "☀ Light Mode" : "⏾ Dark Mode"}
        </Button>
      </header>

      {/* ── Content ───────────────────────────────────────── */}
      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "40px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "64px",
        }}
      >
        {/* ── 1. BUTTON ─────────────────────────────────── */}
        <Section title="Button">
          <Row label="Variants">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </Row>

          <Row label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Row>

          <Row label="States">
            <Button disabled>Disabled</Button>
            <Button loading>Saving…</Button>
            <Button variant="secondary" loading>
              Uploading
            </Button>
            <Button variant="danger" disabled>
              Disabled Danger
            </Button>
          </Row>

          <Row label="Full width">
            <div style={{ width: "100%" }}>
              <Button fullWidth>Full Width Primary</Button>
            </div>
          </Row>

          <Row label="Ghost underline demo">
            <Button variant="ghost" size="sm">
              Learn more →
            </Button>
            <Button variant="ghost" size="md">
              View all students
            </Button>
            <Button variant="ghost" size="lg">
              Explore dashboard
            </Button>
          </Row>
        </Section>

        {/* ── 2. CARD ───────────────────────────────────── */}
        <Section title="Card">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            <Card>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                Plain card — no title, no action. Default padding.
              </p>
            </Card>

            <Card title="Attendance Summary">
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                Card with title. Note the gradient header wash.
              </p>
            </Card>

            <Card
              title="Student Marks"
              action={
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              }
            >
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                Title + action slot. Ghost button fits perfectly here.
              </p>
            </Card>

            <Card padding="sm" title="sm padding">
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                Compact padding for dense data panels.
              </p>
            </Card>

            <Card hoverable title="Hoverable">
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                Hover me — lifts 3px with deeper shadow.
              </p>
            </Card>

            <Card padding="lg" title="lg padding">
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                Generous padding for hero/summary panels.
              </p>
            </Card>
          </div>
        </Section>

        {/* ── 3. BADGE ──────────────────────────────────── */}
        <Section title="Badge">
          <Row label="All variants — md, no dot">
            <Badge variant="green">Present</Badge>
            <Badge variant="amber">Late</Badge>
            <Badge variant="red">At Risk</Badge>
            <Badge variant="blue">Faculty</Badge>
            <Badge variant="gray">Neutral</Badge>
          </Row>

          <Row label="With dot — red dot pulses">
            <Badge variant="green" dot>
              Present
            </Badge>
            <Badge variant="amber" dot>
              Late
            </Badge>
            <Badge variant="red" dot>
              Absent
            </Badge>
            <Badge variant="blue" dot>
              Info
            </Badge>
            <Badge variant="gray" dot>
              Unknown
            </Badge>
          </Row>

          <Row label="Small size">
            <Badge variant="green" size="sm">
              Present
            </Badge>
            <Badge variant="amber" size="sm">
              Late
            </Badge>
            <Badge variant="red" size="sm" dot>
              Absent
            </Badge>
            <Badge variant="blue" size="sm" dot>
              Faculty
            </Badge>
            <Badge variant="gray" size="sm">
              Default
            </Badge>
          </Row>
        </Section>

        {/* ── 4. INPUT ──────────────────────────────────── */}
        <Section title="Input">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            <Input
              label="Student Name"
              placeholder="e.g. Arjun Mehta"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />

            <Input
              label="Search"
              placeholder="Search students…"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              icon={<SearchIcon />}
            />

            <Input
              label="Email Address"
              placeholder="student@college.edu"
              type="email"
              value={emailVal}
              onChange={(e) => setEmailVal(e.target.value)}
            />

            <Input
              label="Password"
              placeholder="Enter password"
              type={showPassword ? "text" : "password"}
              value={passwordVal}
              onChange={(e) => setPasswordVal(e.target.value)}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    padding: 0,
                    display: "flex",
                    transition: "color 150ms ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--text-primary)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--text-muted)")
                  }
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              }
            />

            <Input
              label="Roll Number"
              placeholder="e.g. CS2024001"
              value=""
              onChange={() => {}}
              error="This roll number is already registered."
            />

            <Input
              label="Institution"
              placeholder="NIT Trichy"
              value="NIT Trichy"
              onChange={() => {}}
              disabled
            />
          </div>
        </Section>

        {/* ── 5. TABLE ──────────────────────────────────── */}
        <Section title="Table">
          <Row label="Toggle table state">
            <Button
              variant={tableState === "data" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setTableState("data")}
            >
              Live Data
            </Button>
            <Button
              variant={tableState === "loading" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setTableState("loading")}
            >
              Loading
            </Button>
            <Button
              variant={tableState === "empty" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setTableState("empty")}
            >
              Empty
            </Button>
          </Row>

          <Card padding="sm">
            <Table
              columns={COLUMNS}
              data={tableState === "data" ? STUDENTS : []}
              loading={tableState === "loading"}
              emptyMessage="No students match this criteria."
              onRowClick={
                tableState === "data"
                  ? (row) => console.info("[UITest] Row clicked:", row)
                  : undefined
              }
            />
          </Card>

          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            ↑ Live Data: rows are clickable (amber left bar on hover, check
            console). Loading: shimmer skeleton. Empty: inbox icon + italic
            message. Attendance and Status use Badge render fns.
          </p>
        </Section>
      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer
        style={{
          marginTop: "40px",
          padding: "24px",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          fontFamily: "var(--font-body)",
        }}
      >
        EduTrack UI Kit — Delete this page after auth is built.
      </footer>
    </div>
  );
}
