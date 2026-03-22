import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";

const SEMESTERS = [
  { value: 1, label: "1-1" },
  { value: 2, label: "1-2" },
  { value: 3, label: "2-1" },
  { value: 4, label: "2-2" },
  { value: 5, label: "3-1" },
  { value: 6, label: "3-2" },
  { value: 7, label: "4-1" },
  { value: 8, label: "4-2" },
];

export default function SubjectsPage() {
  const [activeTab, setActiveTab] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inline edit state
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [assigningFacultyId, setAssigningFacultyId] = useState("");
  const [assignmentSuccess, setAssignmentSuccess] = useState(null);

  const [editingDeadlineSlot, setEditingDeadlineSlot] = useState(null);
  const [deadlineValue, setDeadlineValue] = useState("");

  const savingRef = useRef(false);
  const savingDeadlineRef = useRef(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch subjects
      const { data: subData } = await supabase
        .from("subjects")
        .select("*")
        .order("code", { ascending: true });
      
      // Fetch faculty list
      const facData = await api.get("/admin/users?role=faculty");
      
      // Fetch deadlines
      const { data: dedData } = await supabase
        .from("elective_deadlines")
        .select("*")
        .order("slot", { ascending: true });

      if (subData) setSubjects(subData);
      if (facData) setFaculty(facData);
      if (dedData) setDeadlines(dedData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentSubjects = subjects.filter((s) => s.semester === activeTab);

  // --- Handlers for Subject Assignment ---
  const handleStartAssign = (subject) => {
    setEditingSubjectId(subject.id);
    setAssigningFacultyId(subject.faculty_id || "");
    setAssignmentSuccess(null);
  };

  const handleSaveAssign = async (subjectId, newFacultyId) => {
    if (savingRef.current) return;
    savingRef.current = true;
    const payload = newFacultyId ? newFacultyId : null;
    try {
      await api.patch(`/admin/subjects/${subjectId}/assign-faculty`, {
        faculty_id: payload,
      });
      // Update local state
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === subjectId ? { ...s, faculty_id: payload } : s
        )
      );
      setAssignmentSuccess(subjectId);
      setTimeout(() => setAssignmentSuccess(null), 1500);
    } catch (err) {
      console.error("Assign failed", err);
      alert(`Assignment failed: ${err?.message || "Internal error"}`);
    } finally {
      setEditingSubjectId(null);
      savingRef.current = false;
    }
  };

  const getFacultyName = (facId) => {
    const f = faculty.find((fac) => fac.id === facId);
    return f ? f.name : "Unassigned";
  };

  const subjectColumns = [
    { key: "code", label: "Code" },
    { key: "name", label: "Subject Name" },
    {
      key: "subject_type",
      label: "Type",
      render: (type) => (
        <Badge
          variant={
            type === "core" ? "blue" : type === "lab" ? "green" : "amber"
          }
        >
          {type ? type.toUpperCase() : "UNKNOWN"}
        </Badge>
      ),
    },
    { key: "credits", label: "Credits" },
    {
      key: "faculty_id",
      label: "Assigned Faculty",
      render: (val, row) => {
        if (editingSubjectId === row.id) {
          return (
            <select
              autoFocus
              value={assigningFacultyId}
              onChange={(e) => setAssigningFacultyId(e.target.value)}
              onBlur={() => handleSaveAssign(row.id, assigningFacultyId)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.target.blur();
                } else if (e.key === "Escape") {
                  setEditingSubjectId(null);
                }
              }}
              className="px-2 py-1 text-sm outline-none rounded-md"
              style={{
                background: "var(--input-bg)",
                color: "var(--text-primary)",
                border: "1px solid var(--accent)",
              }}
            >
              <option value="">-- Unassigned --</option>
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          );
        }

        const name = getFacultyName(val);
        const isSuccess = assignmentSuccess === row.id;

        return (
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleStartAssign(row)}
          >
            <span
              style={{
                color: val ? "var(--text-primary)" : "var(--text-muted)",
                fontStyle: val ? "normal" : "italic",
              }}
            >
              {name}
            </span>
            {isSuccess && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ color: "var(--accent-green)" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.span>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Action",
      render: (_, row) => (
        <button
          onClick={() => handleStartAssign(row)}
          className="text-xs uppercase font-display tracking-wide font-bold transition-colors"
          style={{ color: "var(--accent-blue)" }}
        >
          Assign Faculty
        </button>
      ),
    },
  ];

  // --- Handlers for Elective Deadlines ---
  const handleStartDeadlineEdit = (dRow) => {
    setEditingDeadlineSlot(dRow.slot);
    // Remove the Z and slice to match datetime-local format expected by native input
    setDeadlineValue(dRow.deadline ? dRow.deadline.slice(0, 16) : "");
  };

  const handleSaveDeadline = async (slot) => {
    if (savingDeadlineRef.current) return;
    if (!deadlineValue) {
      setEditingDeadlineSlot(null);
      return;
    }
    
    savingDeadlineRef.current = true;
    
    // Add :00Z back for ISO compatibility if needed, or backend can parse ISO format.
    const isoDate = new Date(deadlineValue).toISOString();
    try {
      await api.patch(`/admin/elective-deadlines/${slot}`, {
        deadline: isoDate,
      });
      setDeadlines((prev) => {
        const exists = prev.find((p) => p.slot === slot);
        if (exists) {
          return prev.map((p) =>
            p.slot === slot ? { ...p, deadline: isoDate } : p
          );
        }
        return [...prev, { slot, deadline: isoDate }];
      });
    } catch (err) {
      console.error("Deadline save failed", err);
      alert(`Deadline save failed: ${err?.message || "Internal error"}`);
    } finally {
      setEditingDeadlineSlot(null);
      savingDeadlineRef.current = false;
    }
  };

  const defaultSlots = ["professional_elective_1", "professional_elective_2", "open_elective_1"];
  const mergedDeadlines = defaultSlots.map((slot) => {
    const existing = deadlines.find((d) => d.slot === slot);
    return existing || { slot, deadline: null };
  });

  const deadlineColumns = [
    {
      key: "slot",
      label: "Slot",
      render: (val) => (
        <span className="font-display font-semibold uppercase tracking-wider text-xs">
          {val.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "deadline",
      label: "Current Deadline",
      render: (val, row) => {
        if (editingDeadlineSlot === row.slot) {
          return (
            <input
              autoFocus
              type="datetime-local"
              value={deadlineValue}
              onChange={(e) => setDeadlineValue(e.target.value)}
              onBlur={() => handleSaveDeadline(row.slot)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.target.blur();
                } else if (e.key === "Escape") {
                  setEditingDeadlineSlot(null);
                }
              }}
              className="px-2 py-1 text-sm outline-none rounded-md"
              style={{
                background: "var(--input-bg)",
                color: "var(--text-primary)",
                border: "1px solid var(--accent)",
              }}
            />
          );
        }
        return (
          <span style={{ color: val ? "var(--text-primary)" : "var(--text-muted)" }}>
            {val ? new Date(val).toLocaleString() : "Not set"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Edit",
      render: (_, row) => (
        <button
          onClick={() => handleStartDeadlineEdit(row)}
          className="text-xs uppercase font-display tracking-wide font-bold transition-colors"
          style={{ color: "var(--accent)" }}
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold" style={{ color: "var(--text-primary)" }}>
            Subject Management
          </h1>
          <p className="text-sm font-body mt-1" style={{ color: "var(--text-muted)" }}>
            Assign faculty and manage elective deadlines.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Semester Tabs */}
        <div className="flex flex-wrap gap-2">
          {SEMESTERS.map((sem) => (
            <button
              key={sem.value}
              onClick={() => setActiveTab(sem.value)}
              className="px-4 py-2 text-sm font-body font-medium rounded-lg transition-all"
              style={{
                background:
                  activeTab === sem.value
                    ? "var(--accent)"
                    : "var(--bg-elevated)",
                color:
                  activeTab === sem.value
                    ? "#fff"
                    : "var(--text-primary)",
              }}
            >
              {sem.label}
            </button>
          ))}
        </div>

        {/* Subjects Table */}
        <div
          className="rounded-xl overflow-hidden shadow-sm"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <Table
            data={currentSubjects}
            columns={subjectColumns}
            loading={loading}
            emptyMessage="No subjects found for this semester."
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-6 max-w-3xl">
        <h2 className="text-lg font-display font-bold" style={{ color: "var(--text-primary)" }}>
          Elective Registration Deadlines
        </h2>
        
        <div
          className="rounded-xl overflow-hidden shadow-sm"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <Table
            data={mergedDeadlines}
            columns={deadlineColumns}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
