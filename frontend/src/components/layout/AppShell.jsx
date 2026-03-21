import TopNav from "./TopNav";

export default function AppShell({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopNav />
      <main
        style={{
          flex: 1,
          padding: "clamp(1rem, 2vw, 1.5rem)",
          maxWidth: 1400,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {children}
      </main>
    </div>
  );
}
