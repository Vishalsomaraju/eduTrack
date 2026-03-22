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
      setLocalError(err?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  const error = parentError || localError;

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
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
            <h2 style={{ fontWeight: 700, color: "var(--text-primary)" }}>
              Delete {targetType}
            </h2>

            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                marginBottom: 16,
              }}
            >
              Permanently remove {targetName}
            </p>

            {/* Warning */}
            <div
              style={{
                background: "rgba(255,80,80,0.08)",
                border: "1px solid var(--accent-red)",
                color: "var(--accent-red)",
                borderRadius: 10,
                padding: "10px",
                fontSize: "0.8rem",
                marginBottom: 16,
              }}
            >
              <strong>Warning:</strong> This action cannot be undone.
            </div>

            <div style={{ marginTop: 12 }}>
              <Input
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div style={{ color: "var(--accent-red)", marginTop: 10 }}>
                {error}
              </div>
            )}

            <div className="flex gap-3" style={{ marginTop: "24px" }}>
              <Button variant="secondary" fullWidth onClick={onClose}>
                Cancel
              </Button>

              <Button
                variant="danger"
                fullWidth
                disabled={password.length < 8 || loading}
                loading={loading}
                onClick={handleConfirm}
              >
                {loading ? "Deleting..." : "Delete Permanently"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
