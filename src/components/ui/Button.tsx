import { ButtonHTMLAttributes, ReactNode } from "react";
import { SpinnerIcon } from "./Icons";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary border-transparent hover:brightness-95",
  secondary:
    "bg-white text-on-surface border-outline-variant shadow-sm hover:bg-surface-container-low",
  ghost:
    "bg-transparent text-primary border-transparent hover:bg-primary-container",
  danger:
    "bg-error text-on-error border-transparent hover:brightness-95",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-2 gap-1.5",
  md: "text-sm px-5 py-3 gap-2",
  lg: "text-sm px-6 py-4 gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  fullWidth = false,
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        // Base
        "inline-flex items-center justify-center font-bold rounded-lg border-2",
        "transition-all duration-150 cursor-pointer select-none",
        // Press effect
        "active:scale-[0.97] active:brightness-90",
        // Disabled
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        // Variant
        variantStyles[variant],
        // Size
        sizeStyles[size],
        // Full width
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? (
        <SpinnerIcon />
      ) : (
        leftIcon && <span className="flex items-center">{leftIcon}</span>
      )}

      {children}

      {!loading && rightIcon && (
        <span className="flex items-center">{rightIcon}</span>
      )}
    </button>
  );
}
