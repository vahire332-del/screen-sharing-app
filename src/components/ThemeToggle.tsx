"use client";

import { useTheme } from "./ThemeProvider";
import { IoSunny, IoMoon } from "react-icons/io5";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="icon-btn h-9 w-9"
    >
      {isDark ? (
        /* Sun — switch to light */
        <IoSunny className="h-4 w-4" />
      ) : (
        /* Moon — switch to dark */
        <IoMoon className="h-4 w-4" />
      )}
    </button>
  );
}
