// MarksEntry.jsx — Faculty/admin interface for entering marks.
// Accepts optional subjectId prop (from MarksPage). When provided,
// the internal subject selector is hidden and the page controls selection.

import { useEffect, useRef, useState } from "react";
import { Badge, Button, Card } from "@/components/ui";
import {
  computeGrade,
  computePercentage,
  gradeBadgeVariant,
  percentageColor,
  useMarks,
} from "@/hooks/useMarks";
import { useAuthStore } from "@/stores/authStore";

const DEFAULT_MAX = { internal: 30, assignment: 10 };

// ── Initials avatar ────────────────────────────────────────────────────────
function Avatar({ name }) {
  const initials = (name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "var(--accent-subtle)",
        border: "1px solid var(--accent)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "0.7rem",
        color: "var(--accent)",
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  );
}

// ── Styled select dropdown (reusable within this file) ─────────────────────
function StyledSelect({ label, value, onChange, options, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label && (
        <label
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
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "var(--input-bg)",
          color: "var(--text-primary)",
          border: "1px solid var(--input-border)",
          borderRadius: 10,
          height: 42,
          padding: "0 14px",
          fontFamily: "var(--font-body)",
          fontSize: "0.875rem",
          outline: "none",
          cursor: "pointer",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Type toggle pills ──────────────────────────────────────────────────────
function TypeToggle({ value, onChange }) {
  const types = [
    { key: "internal", label: "Internal" },
    { key: "assignment", label: "Assignment" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
        Type
      </span>
      <div style={{ display: "flex", gap: 0 }}>
        {types.map((t, i) => {
          const selected = value === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              style={{
                background: selected
                  ? "var(--accent-subtle)"
                  : "var(--bg-elevated)",
                color: selected ? "var(--accent)" : "var(--text-muted)",
                border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                padding: "0 16px",
                height: 42,
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all 150ms ease",
                borderRadius: i === 0 ? "10px 0 0 10px" : "0 10px 10px 0",
                marginLeft: i === 0 ? 0 : -1,
                position: "relative",
                zIndex: selected ? 1 : 0,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Success / Error banner ──────────────────────────────────────────────────
function Banner({ banner, onDismiss }) {
  if (!banner) return null;
  const isSuccess = banner.type === "success";
  return (
    <div
      role="status"
      style={{
        padding: "12px 16px",
        borderRadius: 10,
        border: `1px solid ${isSuccess ? "var(--accent-green-border)" : "var(--accent-red-border)"}`,
        background: isSuccess
          ? "var(--accent-green-bg)"
          : "var(--accent-red-bg)",
        color: isSuccess ? "var(--accent-green)" : "var(--accent-red)",
        fontFamily: "var(--font-body)",
        fontSize: "0.875rem",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 16,
      }}
    >
      {banner.message}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "currentColor",
          fontSize: "1rem",
          lineHeight: 1,
          flexShrink: 0,
          opacity: 0.7,
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function MarksEntry({ subjectId: propSubjectId }) {
  const { role } = useAuthStore();
  const {
    fetchSubjects,
    fetchMarks,
    fetchStudentsForSubject,
    upsertBulkMarks,
  } = useMarks();

  // External subjectId controls selection when provided by a parent page.
  const [subjects, setSubjects] = useState([]);
  const [internalSubjectId, setInternalSubjectId] = useState("");
  const selectedSubject = propSubjectId || internalSubjectId;

  const [markType, setMarkType] = useState("internal");
  const [maxScore, setMaxScore] = useState(DEFAULT_MAX.internal);
  // Track whether user manually changed maxScore so we don't overwrite it on type toggle.
  const userChangedMaxScore = useRef(false);

  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});
  const [tableLoaded, setTableLoaded] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [tableError, setTableError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);

  // Load subjects for internal selector (skipped when controlled externally)
  useEffect(() => {
    if (propSubjectId) return;
    fetchSubjects().then(({ data }) => {
      const list = data ?? [];
      setSubjects(list);
      if (list.length > 0) setInternalSubjectId(list[0].id);
    });
  }, [propSubjectId]);

  // Reset table when controlled subjectId changes from the parent page
  useEffect(() => {
    setTableLoaded(false);
    setStudents([]);
    setScores({});
    setTableError(null);
  }, [propSubjectId]);

  // Update maxScore default when type toggles (only if user hasn't customised it)
  function handleTypeChange(type) {
    setMarkType(type);
    if (!userChangedMaxScore.current) {
      setMaxScore(DEFAULT_MAX[type]);
    }
    // Reset loaded table so stale data isn't shown for the new type
    setTableLoaded(false);
    setStudents([]);
    setScores({});
  }

  // Load students + pre-fill existing marks
  async function handleLoad() {
    if (!selectedSubject) return;
    setLoadingTable(true);
    setTableError(null);

    const [studentsRes, marksRes] = await Promise.all([
      fetchStudentsForSubject(selectedSubject),
      fetchMarks(selectedSubject),
    ]);

    setLoadingTable(false);

    if (studentsRes.error) {
      setTableError(studentsRes.error.message);
      return;
    }

    const studentList = studentsRes.data ?? [];

    // Build a lookup of existing marks for the selected type
    const existingByStudent = {};
    for (const m of marksRes.data ?? []) {
      if (m.type === markType) {
        existingByStudent[m.student_id] = m;
      }
    }

    const initialScores = {};
    for (const s of studentList) {
      const existing = existingByStudent[s.id];
      initialScores[s.id] = existing != null ? String(existing.score) : "";
    }

    setStudents(studentList);
    setScores(initialScores);
    setTableLoaded(true);
  }

  function handleScoreChange(studentId, raw) {
    setScores((prev) => ({ ...prev, [studentId]: raw }));
  }

  function handleSetAllMax() {
    const next = {};
    for (const s of students) next[s.id] = String(maxScore);
    setScores(next);
  }

  function handleClearAll() {
    const next = {};
    for (const s of students) next[s.id] = "";
    setScores(next);
  }

  async function handleSave() {
    // Validate: no score exceeds maxScore
    for (const s of students) {
      const val = parseFloat(scores[s.id]);
      if (!isNaN(val) && val > maxScore) {
        setBanner({
          type: "error",
          message: `Score for ${s.name} exceeds max score of ${maxScore}.`,
        });
        return;
      }
    }

    // Build records — only include students with a filled score
    const records = students
      .filter((s) => scores[s.id] !== "" && scores[s.id] != null)
      .map((s) => ({
        student_id: s.id,
        subject_id: selectedSubject,
        type: markType,
        score: parseFloat(scores[s.id]),
        max_score: maxScore,
      }));

    if (records.length === 0) {
      setBanner({ type: "error", message: "No scores to save." });
      return;
    }

    setSaving(true);
    const { error } = await upsertBulkMarks(records);
    setSaving(false);

    if (error) {
      setBanner({
        type: "error",
        message: error.message ?? "Failed to save marks.",
      });
    } else {
      setBanner({
        type: "success",
        message: `Marks saved for ${records.length} student${records.length !== 1 ? "s" : ""}.`,
      });
      // Auto-dismiss after 3 seconds
      setTimeout(() => setBanner(null), 3000);
    }
  }

  const filledCount = students.filter(
    (s) => scores[s.id] !== "" && scores[s.id] != null,
  ).length;

  // Guard: only faculty and admin see this component
  if (role !== "faculty" && role !== "admin") return null;

  const subjectOptions = subjects.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.code})`,
  }));

  return (
    <Card title="Enter Marks">
      {/* ── Top controls row ─────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "flex-end",
          marginBottom: 20,
        }}
      >
        {/* Subject selector — only shown when not controlled externally */}
        {!propSubjectId && subjects.length > 0 && (
          <StyledSelect
            label="Subject"
            value={internalSubjectId}
            onChange={setInternalSubjectId}
            options={subjectOptions}
            style={{ flex: "1 1 200px", minWidth: 180 }}
          />
        )}

        <TypeToggle value={markType} onChange={handleTypeChange} />

        {/* Max Score input */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
            }}
          >
            Max Score
          </label>
          <input
            type="number"
            min={1}
            value={maxScore}
            onChange={(e) => {
              userChangedMaxScore.current = true;
              setMaxScore(Number(e.target.value));
            }}
            style={{
              width: 100,
              height: 42,
              background: "var(--input-bg)",
              color: "var(--text-primary)",
              border: "1px solid var(--input-border)",
              borderRadius: 10,
              padding: "0 12px",
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              outline: "none",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        </div>

        <Button
          variant="secondary"
          onClick={handleLoad}
          loading={loadingTable}
          disabled={!selectedSubject}
        >
          Load Students
        </Button>
      </div>

      {/* ── Error state ─────────────────────────────────────── */}
      {tableError && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            color: "var(--accent-red)",
            margin: "12px 0",
          }}
        >
          {tableError}
        </p>
      )}

      {/* ── Banner ──────────────────────────────────────────── */}
      <Banner banner={banner} onDismiss={() => setBanner(null)} />

      {/* ── Student marks table ──────────────────────────────── */}
      {tableLoaded && (
        <>
          {/* Bulk actions bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Button variant="ghost" size="sm" onClick={handleSetAllMax}>
              Set All to Max
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              Clear All
            </Button>
            <span
              style={{
                marginLeft: "auto",
                fontFamily: "var(--font-body)",
                fontSize: "0.8rem",
                color: "var(--text-muted)",
              }}
            >
              {filledCount} / {students.length} filled
            </span>
          </div>

          {students.length === 0 ? (
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                fontStyle: "italic",
                padding: "32px 0",
                textAlign: "center",
              }}
            >
              No students enrolled in this subject.
            </p>
          ) : (
            <div
              style={{
                overflowX: "auto",
                borderRadius: 12,
                border: "1px solid var(--border)",
                marginBottom: 16,
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
                    {[
                      "Student",
                      "Score",
                      `/${maxScore}`,
                      "Percentage",
                      "Grade",
                    ].map((h) => (
                      <th
                        key={h}
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
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => {
                    const rawVal = scores[student.id] ?? "";
                    const numVal = parseFloat(rawVal);
                    const hasVal = rawVal !== "" && !isNaN(numVal);
                    const isOver = hasVal && numVal > maxScore;
                    const pct = hasVal
                      ? computePercentage(numVal, maxScore)
                      : null;
                    const grade = pct != null ? computeGrade(pct) : null;

                    return (
                      <tr
                        key={student.id}
                        style={{
                          background:
                            idx % 2 === 0
                              ? "var(--bg-surface)"
                              : "rgba(255,255,255,0.015)",
                          borderBottom:
                            "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
                        }}
                      >
                        {/* Student */}
                        <td
                          style={{
                            padding: "12px 16px",
                            verticalAlign: "middle",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <Avatar name={student.name} />
                            <span
                              style={{
                                fontFamily: "var(--font-body)",
                                fontSize: "0.875rem",
                                color: "var(--text-primary)",
                                fontWeight: 500,
                              }}
                            >
                              {student.name}
                            </span>
                          </div>
                        </td>

                        {/* Score input */}
                        <td
                          style={{
                            padding: "12px 16px",
                            verticalAlign: "middle",
                          }}
                        >
                          <input
                            type="number"
                            min={0}
                            max={maxScore}
                            value={rawVal}
                            onChange={(e) =>
                              handleScoreChange(student.id, e.target.value)
                            }
                            placeholder="—"
                            style={{
                              width: 80,
                              height: 34,
                              background: "var(--input-bg)",
                              color: "var(--text-primary)",
                              border: `1px solid ${isOver ? "var(--accent-red)" : "var(--input-border)"}`,
                              borderRadius: 8,
                              padding: "0 10px",
                              fontFamily: "var(--font-body)",
                              fontSize: "0.875rem",
                              outline: "none",
                              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.15)",
                            }}
                          />
                        </td>

                        {/* /maxScore */}
                        <td
                          style={{
                            padding: "12px 16px",
                            verticalAlign: "middle",
                            fontFamily: "var(--font-body)",
                            fontSize: "0.875rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          /{maxScore}
                        </td>

                        {/* Percentage */}
                        <td
                          style={{
                            padding: "12px 16px",
                            verticalAlign: "middle",
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: "0.875rem",
                            color:
                              pct != null
                                ? percentageColor(pct)
                                : "var(--text-muted)",
                          }}
                        >
                          {pct != null ? `${pct}%` : "—"}
                        </td>

                        {/* Grade badge */}
                        <td
                          style={{
                            padding: "12px 16px",
                            verticalAlign: "middle",
                          }}
                        >
                          {grade != null ? (
                            <Badge variant={gradeBadgeVariant(grade)} size="sm">
                              {grade}
                            </Badge>
                          ) : (
                            <span
                              style={{
                                fontFamily: "var(--font-body)",
                                fontSize: "0.875rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Sticky submit row ──────────────────────────────── */}
          <div
            style={{
              position: "sticky",
              bottom: 0,
              background: "var(--bg-surface)",
              padding: "12px 0 4px",
              borderTop: "1px solid var(--border)",
              marginTop: 8,
            }}
          >
            <Button
              variant="primary"
              fullWidth
              onClick={handleSave}
              loading={saving}
              disabled={filledCount === 0}
            >
              Save Marks
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
