import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  targetName,
  targetType,
  parentError,
}) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleConfirm = async () => {
    setLoading(true);
    setLocalError(null);
    try {
      await onConfirm(password);
    } catch (err) {
      setLocalError(err?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayError = parentError || localError;

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
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{
                    background: "var(--accent-red-bg)",
                    color: "var(--accent-red)",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </div>
                <div>
                  <h3
                    className="text-lg font-display font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Delete {targetType === "student" ? "Student" : "Faculty"}
                  </h3>
                  <p
                    className="text-sm font-body"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Permanently remove {targetName}
                  </p>
                </div>
              </div>

              <div
                className="p-3 mt-2 rounded-lg text-sm font-body"
                style={{
                  background: "color-mix(in srgb, var(--accent-red) 10%, transparent)",
                  color: "var(--accent-red)",
                  border: "1px solid var(--accent-red-border)",
                }}
              >
                <strong className="block mb-1 font-bold">Warning:</strong>
                This will permanently delete all marks, attendance, and enrollment data associated with this user.
              </div>

              <div className="mt-2 text-sm font-body text-center" style={{ color: "var(--text-muted)" }}>
                Type your admin password to confirm.
              </div>

              <Input
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {displayError && (
                <div className="text-sm font-body mt-1" style={{ color: "var(--accent-red)" }}>
                  {displayError}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setPassword("");
                    onClose();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  disabled={password.length < 8 || loading}
                  loading={loading}
                  onClick={handleConfirm}
                >
                  Delete Permanently
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
