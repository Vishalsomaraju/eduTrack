import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AddUserModal({
  isOpen,
  onClose,
  onSuccess,
  role,
  cachedPassword,
  onPasswordCached,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    entry_semester: "1",
    designation: "Assistant Professor",
    department: "CSE",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isStudent = role === "student";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      role: role,
      password: cachedPassword ? cachedPassword : formData.password,
    };

    if (isStudent) {
      payload.entry_semester = parseInt(formData.entry_semester, 10);
    } else {
      // Faculty might use designation/department later if we extend backend
      // Right now backend just takes basic info, but UI requires it
    }

    try {
      await onSuccess(payload);
      if (!cachedPassword && formData.password) {
        onPasswordCached(formData.password);
      }
      setFormData({
        name: "",
        email: "",
        entry_semester: "1",
        designation: "Assistant Professor",
        department: "CSE",
        password: "",
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.name.length >= 2 &&
    formData.email.includes("@") &&
    (cachedPassword || formData.password.length >= 8);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-md p-6 overflow-hidden rounded-2xl shadow-xl"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <h3
              className="mb-4 text-xl font-display font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Add {isStudent ? "Student" : "Faculty"}
            </h3>

            {error && (
              <div className="p-3 mb-4 rounded-lg text-sm font-body bg-red-500/10 text-red-500 border border-red-500/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                required
              />

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@kprit.ac.in"
                required
              />

              {isStudent ? (
                <div className="flex flex-col gap-1">
                  <label
                    className="font-display font-semibold text-[0.7rem] uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Entry Semester
                  </label>
                  <select
                    name="entry_semester"
                    value={formData.entry_semester}
                    onChange={handleChange}
                    className="w-full h-[42px] px-3 rounded-lg text-sm font-body outline-none transition-colors"
                    style={{
                      background: "var(--input-bg)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--input-border)",
                    }}
                  >
                    <option value="1">1st Year &mdash; Sem 1</option>
                    <option value="3">Lateral Entry &mdash; Sem 3</option>
                  </select>
                </div>
              ) : (
                <>
                  <Input
                    label="Designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="Assistant Professor"
                  />
                  <Input
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="CSE"
                  />
                </>
              )}

              {cachedPassword ? (
                <div
                  className="p-3 rounded-lg text-sm font-body mt-2 flex items-center justify-between"
                  style={{
                    background: "var(--accent-amber-bg)",
                    border: "1px solid var(--accent-amber-border)",
                    color: "var(--accent-amber)",
                  }}
                >
                  <span className="flex items-center gap-2">
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
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    Using cached session password
                  </span>
                </div>
              ) : (
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  required
                />
              )}

              <div className="flex gap-3 mt-4">
                <Button variant="secondary" fullWidth onClick={onClose} type="button">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  disabled={!isFormValid || loading}
                  loading={loading}
                  type="submit"
                >
                  Create {isStudent ? "Student" : "Faculty"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
