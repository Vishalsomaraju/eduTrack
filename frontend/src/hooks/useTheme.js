import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("edutrack-theme") ?? "dark",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("edutrack-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  return { theme, toggleTheme };
}
