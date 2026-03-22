import { motion, AnimatePresence } from "framer-motion";

export default function SessionPasswordBanner({ active, onClear }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex items-center justify-between px-4 py-2 mt-4 rounded-lg"
          style={{
            background: "var(--accent-amber-bg)",
            border: "1px solid var(--accent-amber-border)",
            color: "var(--accent-amber)",
          }}
        >
          <div className="flex items-center gap-2 text-sm font-medium font-body">
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
            <span>Session active &middot; password cached</span>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-xs uppercase font-display tracking-wide font-bold hover:opacity-75 transition-opacity"
            style={{ color: "var(--text-primary)" }}
          >
            Clear Session
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
