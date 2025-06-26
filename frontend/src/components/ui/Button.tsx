import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600",
        outline:
          "border border-slate-300 bg-white hover:bg-slate-50 focus-visible:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white",
        ghost:
          "hover:bg-slate-100 focus-visible:ring-blue-500 dark:hover:bg-slate-800 dark:text-slate-300",
        success:
          "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-sm",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      | "onDrag"
      | "onDragEnd"
      | "onDragStart"
      | "onDragEnter"
      | "onDragLeave"
      | "onDragOver"
      | "onDrop"
    >,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading, children, disabled, onClick, type },
    ref
  ) => {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        disabled={disabled || loading}
        onClick={onClick}
        type={type}
      >
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
          />
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
