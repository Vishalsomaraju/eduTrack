import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AddUserModal from "@/components/admin/AddUserModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import SessionPasswordBanner from "@/components/admin/SessionPasswordBanner";

export default function FacultyPage() {
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [deleteError, setDeleteError] = useState(null);

  // Session Password Cache
  const [cachedPassword, setCachedPassword] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [facData, { data: subData }] = await Promise.all([
        api.get("/admin/users?role=faculty"),
        supabase.from("subjects").select("*").not("faculty_id", "is", null),
      ]);
      setFaculty(facData || []);
      setSubjects(subData || []);
    } catch (err) {
      console.error("Failed to fetch faculty data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const processedFaculty = useMemo(() => {
    return faculty.map((f) => {
      const fp = Array.isArray(f.faculty_profiles)
        ? f.faculty_profiles[0]
        : f.faculty_profiles;

      const assignedSubjects = subjects.filter((s) => s.faculty_id === f.id);

      return {
        ...f,
        employee_id:
          fp?.employee_id || `EMP-${f.id.substring(0, 5).toUpperCase()}`,
        designation: fp?.designation || "Assistant Professor",
        experience: fp?.experience_years ? `${fp.experience_years} years` : "—",
        subjectsAssigned: assignedSubjects,
      };
    });
  }, [faculty, subjects]);

  const filteredFaculty = useMemo(() => {
    if (!search) return processedFaculty;
    const q = search.toLowerCase();
    return processedFaculty.filter(
      (f) =>
        f.name?.toLowerCase().includes(q) ||
        f.email?.toLowerCase().includes(q) ||
        f.employee_id?.toLowerCase().includes(q) ||
        f.designation?.toLowerCase().includes(q),
    );
  }, [processedFaculty, search]);

  const handleAddSuccess = async (payload) => {
    try {
      const newUser = await api.post("/admin/users", payload);
      setIsAddOpen(false);
      try {
        setFaculty((prev) => [newUser, ...prev]);
        await fetchData();
      } catch (err) {
        alert("Faculty created but list may be stale — refresh to see latest");
      }
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteConfirm = async (adminPassword) => {
    setDeleteError(null);
    try {
      await api.delete(`/admin/users/${deleteTarget.id}`, {
        admin_password: adminPassword,
      });
      setFaculty((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
      fetchData().catch(() => {});
    } catch (err) {
      const msg = err?.data?.detail || err?.message || "Delete failed";
      if (msg.toLowerCase().includes("invalid admin password")) {
        setDeleteError("Incorrect password. Please try again.");
      } else {
        setDeleteError(`Delete failed: ${msg}`);
      }
      throw err;
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "employee_id", label: "Employee ID" },
    { key: "designation", label: "Designation" },
    { key: "experience", label: "Experience" },
    {
      key: "subjectsAssigned",
      label: "Subjects Assigned",
      render: (subs) => {
        if (!subs || subs.length === 0) {
          return (
            <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
              None
            </span>
          );
        }

        const displaySubs = subs.slice(0, 3);
        const extra = subs.length - 3;

        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="blue" className="mr-1">
              {subs.length}
            </Badge>
            {displaySubs.map((s) => (
              <span
                key={s.id}
                className="px-2 py-0.5 text-xs rounded font-body"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                }}
              >
                {s.name}
              </span>
            ))}
            {extra > 0 && (
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                +{extra} more
              </span>
            )}
          </div>
        );
      },
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
            Faculty
          </h1>
          <p
            className="text-sm font-body mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            Manage teaching staff and access
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
          Add Faculty
        </Button>
      </div>

      <SessionPasswordBanner
        active={!!cachedPassword}
        onClear={() => setCachedPassword("")}
      />

      {/* Search */}
      <div className="flex justify-end">
        <div className="w-full md:w-72">
          <Input
            placeholder="Search faculty..."
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
          data={filteredFaculty}
          columns={columns}
          loading={loading}
          emptyMessage="No faculty members found."
        />
      </div>

      <AddUserModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        role="faculty"
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
        targetType="faculty"
        onConfirm={handleDeleteConfirm}
        parentError={deleteError}
      />
    </div>
  );
}
