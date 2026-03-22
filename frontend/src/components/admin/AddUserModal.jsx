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
      role,
      password: cachedPassword || formData.password,
    };

    if (isStudent) {
      payload.entry_semester = parseInt(formData.entry_semester, 10);
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
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-[95%] sm:w-full max-w-md mx-auto"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
          >
            {/* Header */}
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.2rem",
                color: "var(--text-primary)",
              }}
            >
              Add {isStudent ? "Student" : "Faculty"}
            </h2>

            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                marginBottom: 16,
              }}
            >
              Create a new {isStudent ? "student" : "faculty"} account
            </p>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "rgba(255,80,80,0.08)",
                  border: "1px solid var(--accent-red)",
                  color: "var(--accent-red)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: "0.8rem",
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                <div>
                  <label
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                      marginBottom: 6,
                      display: "block",
                    }}
                  >
                    ENTRY SEMESTER
                  </label>
                  <select
                    name="entry_semester"
                    value={formData.entry_semester}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 14px",
                      borderRadius: 10,
                      background: "var(--input-bg)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <option value="1">1st Year — Sem 1</option>
                    <option value="3">Lateral Entry — Sem 3</option>
                  </select>
                </div>
              ) : (
                <>
                  <Input
                    label="Designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                  />
                  <Input
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </>
              )}

              {cachedPassword ? (
                <div
                  style={{
                    background: "var(--accent-amber-bg)",
                    border: "1px solid var(--accent-amber-border)",
                    color: "var(--accent-amber)",
                    borderRadius: 10,
                    padding: "10px",
                    fontSize: "0.8rem",
                  }}
                >
                  Using cached session password
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

              {/* Buttons */}
              <div className="flex gap-3 mt-4">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  fullWidth
                  disabled={!isFormValid || loading}
                  loading={loading}
                  type="submit"
                >
                  {loading
                    ? "Creating..."
                    : `Create ${isStudent ? "Student" : "Faculty"}`}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
