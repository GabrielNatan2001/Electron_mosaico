import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

const defaultClass = "text-white/80 hover:text-white transition-colors p-2";

export default function DarkModeToggle({ className = "", fixed = true }) {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = sessionStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches || true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    sessionStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleDark = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <button
      onClick={toggleDark}
      className={`cursor-pointer ${fixed ? "fixed top-4 right-4 z-50" : ""
        } ${defaultClass} ${className}`}
      aria-label={
        isDark ? "Alternar para modo claro" : "Alternar para modo escuro"
      }
    >
      {isDark ? (
        <Sun className="w-5 h-5 stroke-[2.5]" />
      ) : (
        <Moon className="w-5 h-5 stroke-[2.5] text-black" />
      )}
    </button>
  );
}
