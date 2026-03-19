import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function PageShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuToggle={() => setMobileOpen((o) => !o)} />

        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6"
          style={{ background: "var(--bg-base)" }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
