import { AnimatePresence, motion } from "framer-motion";

export default function TitleOverlay({ visible }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <AnimatePresence>
        {visible && (
          <>
            <motion.h1
              key="title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "3.5rem",
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                marginBottom: "320px",
              }}
            >
              EduTrack
            </motion.h1>

            <motion.p
              key="tagline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: "1.1rem",
                color: "var(--text-muted)",
                marginTop: "320px",
              }}
            >
              Academic management, reimagined
            </motion.p>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
