import { useState, useEffect, lazy, Suspense } from "react";
import LoginPage from "@/pages/LoginPage";

const LandingScene = lazy(() => import("@/components/landing/LandingScene"));

export default function LandingPage() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  if (!isDesktop) return <LoginPage />;

  return (
    <Suspense
      fallback={
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#24272D",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: "2px solid rgba(197,125,94,0.2)",
              borderTop: "2px solid #C57D5E",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      }
    >
      <LandingScene />
    </Suspense>
  );
}
