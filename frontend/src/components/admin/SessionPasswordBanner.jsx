import { motion, AnimatePresence } from "framer-motion";

export default function SessionPasswordBanner({ active, onClear }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-between px-4 py-2 mt-4 rounded-lg"
          style={{
            background: "var(--accent-amber-bg)",
            border: "1px solid var(--accent-amber-border)",
            color: "var(--accent-amber)",
          }}
        >
          <span className="text-sm">Session active · password cached</span>

          <button
            onClick={onClear}
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
