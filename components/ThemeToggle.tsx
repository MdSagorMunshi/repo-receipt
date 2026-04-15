"use client";

import { useState } from "react";

import { getThemeStorageKey } from "@/lib/site";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") {
      return "light";
    }

    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  });

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
