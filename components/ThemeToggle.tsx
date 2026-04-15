"use client";

import { useEffect, useState } from "react";

import { getThemeStorageKey } from "@/lib/site";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(current);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(getThemeStorageKey(), nextTheme);
    setTheme(nextTheme);
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </button>
  );
}
