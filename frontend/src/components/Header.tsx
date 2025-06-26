import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex justify-between items-start"
    >
      <div>
        <h1 className="text-4xl font-bold text-slate-800 dark:text-white transition-colors">
          Strides
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 transition-colors">
          Your daily checkpoint for personal growth and well-being.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </motion.header>
  );
};
