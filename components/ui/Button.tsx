import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "accent" | "ghost" | "danger" | "whatsapp";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-on hover:brightness-110",
  secondary: "bg-secondary text-secondary-on hover:brightness-110",
  accent: "bg-accent text-accent-on hover:brightness-110",
  ghost: "bg-transparent text-primary border border-border hover:bg-surface",
  danger: "bg-danger text-white hover:brightness-110",
  whatsapp: "bg-whatsapp text-whatsapp-on hover:brightness-95",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, fullWidth, className, children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition",
        "duration-fast ease-token disabled:cursor-not-allowed disabled:bg-surface disabled:text-text-muted",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
});

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-pill border-2 border-current border-t-transparent"
    />
  );
}
