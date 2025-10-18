import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-colors duration-300 flex items-center justify-center"
    >
      {theme === "dark" ? (
        <Moon className="w-5 h-5 text-text"  size={18}/>
      ) : (
        <Sun className="w-5 h-5 text-text" />
      )}
    </button>
  );
};

export default ThemeToggle;
