import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("dalpay-theme");
    if (stored === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    } else if (stored === "light") {
      setDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      // Default to light
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dalpay-theme", "light");
    }
  }, []);

  const toggle = () => {
    if (dark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dalpay-theme", "light");
      setDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("dalpay-theme", "dark");
      setDark(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}