import { motion } from "framer-motion";
import { Sun, Moon } from "phosphor-react";
import { useTheme } from "../context/ThemeContext";
import { Button } from "./ui/Button";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const CurrentIcon = theme === "light" ? Sun : Moon;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={`
          relative overflow-hidden transition-all duration-300
          ${
            theme === "dark"
              ? "hover:bg-slate-800 text-slate-300 hover:text-white"
              : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
          }
        `}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          <CurrentIcon size={20} />
        </motion.div>

        {/* Background gradient animation */}
        <motion.div
          className={`
            absolute inset-0 opacity-0 transition-opacity duration-300
            ${
              theme === "dark"
                ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20"
                : "bg-gradient-to-r from-blue-500/20 to-purple-500/20"
            }
          `}
          whileHover={{ opacity: 1 }}
        />
      </Button>

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        className={`
          absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
          px-2 py-1 text-xs rounded-md whitespace-nowrap pointer-events-none
          ${
            theme === "dark"
              ? "bg-slate-800 text-white border border-slate-700"
              : "bg-slate-900 text-white"
          }
        `}
      >
        {theme === "light" ? "Dark" : "Light"} mode
        <div
          className={`
          absolute top-full left-1/2 transform -translate-x-1/2 
          w-0 h-0 border-x-4 border-x-transparent border-t-4 
          ${theme === "dark" ? "border-t-slate-800" : "border-t-slate-900"}
        `}
        />
      </motion.div>
    </motion.div>
  );
};
