import { motion } from "framer-motion";

export const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex justify-between items-start"
    >
      <div>
        <h1 className="text-4xl font-bold text-black">Strides</h1>
        <p className="text-gray-600 mt-2">
          Your daily checkpoint for personal growth and well-being.
        </p>
      </div>
    </motion.header>
  );
};
