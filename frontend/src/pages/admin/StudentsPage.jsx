import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AddUserModal from "@/components/admin/AddUserModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import SessionPasswordBanner from "@/components/admin/SessionPasswordBanner";

const YEARS = [
  { label: "All Years", value: "all" },
  { label: "1st Year", value: 1 },
  { label: "2nd Year", value: 2 },
  { label: "3rd Year", value: 3 },
  { label: "4th Year", value: 4 },
];

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [activeYear, setActiveYear] = useState("all");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [deleteError, setDeleteError] = useState(null);

  // Session Password Cache
  const [cachedPassword, setCachedPassword] = useState("");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await api.get("/admin/users?role=student");
      setStudents(data || []);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Use Memo for derived data
  const processedStudents = useMemo(() => {
    return students.map((s) => {
      // Handle array or object from PostgREST join
      const sp = Array.isArray(s.student_profiles)
        ? s.student_profiles[0]
        : s.student_profiles;
      return {
        ...s,
        roll_number: sp?.roll_number || "—",
        semester: sp?.semester || "—",
        year: sp?.semester ? Math.ceil(sp.semester / 2) : "—",
      };
    });
  }, [students]);

  const filteredStudents = useMemo(() => {
    return processedStudents.filter((s) => {
      // Year filter
      if (activeYear !== "all" && s.year !== activeYear) return false;

      // Search filter
      if (search) {
        const q = search.toLowerCase();
        return (
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.roll_number?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [processedStudents, activeYear, search]);

  const handleAddSuccess = async (payload) => {
    try {
      const newUser = await api.post("/admin/users", payload);
      setIsAddOpen(false);

      try {
        setStudents((prev) => [newUser, ...prev]);
        await fetchStudents();
      } catch (err) {
        alert("User created but list may be stale — refresh to see latest");
      }
    } catch (err) {
      // Re-throw so the AddUserModal catches it and displays the error message without closing
      throw err;
    }
  };

  const handleDeleteConfirm = async (adminPassword) => {
    setDeleteError(null);
    try {
      await api.delete(`/admin/users/${deleteTarget.id}`, {
        admin_password: adminPassword,
      });
      setStudents((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
      // Optional re-fetch
      fetchStudents().catch(() => {});
    } catch (err) {
      const msg = err?.data?.detail || err?.message || "Delete failed";
      if (msg.toLowerCase().includes("invalid admin password")) {
        setDeleteError("Incorrect password. Please try again.");
      } else {
        setDeleteError(`Delete failed: ${msg}`);
      }
      throw err; // So modal can stop loading
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "roll_number", label: "Roll No" },
    {
      key: "year",
      label: "Year",
      render: (val) =>
        val !== "—"
          ? `${val}${val === 1 ? "st" : val === 2 ? "nd" : val === 3 ? "rd" : "th"} Year`
          : "—",
    },
    {
      key: "semester",
      label: "Semester",
      render: (val) => (val !== "—" ? `Sem ${val}` : "—"),
    },
    {
      key: "created_at",
      label: "Joined",
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDeleteTarget({ id: row.id, name: row.name })}
            className="text-xs uppercase font-display tracking-wide font-bold transition-colors"
            style={{ color: "var(--accent-red)" }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 h-full p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-display font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Students
          </h1>
          <p
            className="text-sm font-body mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            Manage student records and directory
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Student
        </Button>
      </div>

      <SessionPasswordBanner
        active={!!cachedPassword}
        onClear={() => setCachedPassword("")}
      />

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 8,
          }}
        >
          {YEARS.map((y) => (
            <button
              key={y.value}
              onClick={() => setActiveYear(y.value)}
              style={{
                padding: "6px 16px",
                borderRadius: 9999,
                border:
                  activeYear === y.value ? "none" : "1px solid var(--border)",
                background:
                  activeYear === y.value ? "var(--accent)" : "transparent",
                color:
                  activeYear === y.value ? "#fff" : "var(--text-secondary)",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {y.label}
            </button>
          ))}
        </div>

        <div className="w-full md:w-64">
          <Input
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden shadow-sm flex-1 mb-6"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
        }}
      >
        <Table
          data={filteredStudents}
          columns={columns}
          loading={loading}
          emptyMessage="No students found."
        />
      </div>

      <AddUserModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        role="student"
        onSuccess={handleAddSuccess}
        cachedPassword={cachedPassword}
        onPasswordCached={setCachedPassword}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        targetName={deleteTarget?.name}
        targetType="student"
        onConfirm={handleDeleteConfirm}
        parentError={deleteError}
      />
    </div>
  );
}
