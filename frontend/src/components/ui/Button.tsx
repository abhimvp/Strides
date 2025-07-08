import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-black text-white hover:bg-gray-800 focus-visible:ring-gray-500",
        destructive:
          "bg-black text-white hover:bg-gray-800 focus-visible:ring-gray-500",
        outline:
          "border border-gray-300 bg-white hover:bg-gray-50 focus-visible:ring-gray-500 text-black",
        ghost: "hover:bg-gray-100 focus-visible:ring-gray-500 text-black",
        success:
          "bg-black text-white hover:bg-gray-800 focus-visible:ring-gray-500",
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
