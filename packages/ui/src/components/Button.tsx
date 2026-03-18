import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand-900 text-white hover:bg-brand-800",
        secondary: "bg-surface-100 text-brand-900 hover:bg-surface-200",
        outline: "border border-brand-200 bg-transparent text-brand-900 hover:bg-surface-50",
        ghost: "text-brand-700 hover:bg-surface-100",
        accent: "bg-accent-500 text-white hover:bg-accent-600",
        danger: "bg-semantic-error text-white hover:bg-red-800",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
}

export function Button({ className, variant, size, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  );
}

export { buttonVariants };
