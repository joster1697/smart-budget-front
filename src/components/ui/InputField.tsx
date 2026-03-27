import { forwardRef, InputHTMLAttributes, ReactNode, useState } from "react";
import { EyeIcon, EyeOffIcon, IconLockFilled } from "./Icons";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * Usa forwardRef para que React Hook Form pueda registrar el ref del input nativo.
 */
const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField({
  label,
  error,
  leftIcon,
  rightIcon,
  type = "text",
  className = "",
  id,
  onFocus,
  onBlur,
  ...props
}, ref) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === "password";
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

  // Password: lock icon always on the left
  const resolvedLeftIcon = isPassword ? <IconLockFilled size={20} className="text-outline"/> : leftIcon;
  // Password: eye toggle only visible when focused
  const showEyeToggle = isPassword && isFocused;

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-left text-on-surface">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Left icon */}
        {resolvedLeftIcon && (
          <span className="absolute left-3 flex items-center text-outline-variant pointer-events-none transition-colors duration-200">
            {resolvedLeftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={id}
          type={resolvedType}
          onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
          className={[
            "w-full bg-surface-container-low border border-transparent text-on-surface rounded-xl px-4 py-4",
            "placeholder:text-outline-variant outline-none transition-all duration-200",
            "focus:border-primary focus:ring-2 focus:ring-primary focus:bg-surface-bright",
            error ? "focus:ring-error/20" : "",
            resolvedLeftIcon ? "pl-10" : "",
            (showEyeToggle || rightIcon) ? "pr-10" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />

        {/* Right: eye toggle (password + focused) or custom rightIcon */}
        {showEyeToggle ? (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()} // evita que el input pierda focus al clickear
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 flex items-center text-outline-variant hover:text-primary transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOffIcon size={20} className="text-outline" /> : <EyeIcon size={20} className="text-outline" />}
          </button>
        ) : (
          !isPassword && rightIcon && (
            <span className="absolute right-3 flex items-center text-outline-variant pointer-events-none">
              {rightIcon}
            </span>
          )
        )}
      </div>

      {/* Error message */}
      {error && (
        <span className="text-xs text-error font-medium">{error}</span>
      )}
    </div>
  );
});

export default InputField;
