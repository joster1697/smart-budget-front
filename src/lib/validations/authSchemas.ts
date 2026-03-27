import { minLength, z } from "zod";

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es requerido")
    .email("Ingresa un correo electrónico válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ─── PASSWORD_RULES
// Se definen las reglasde validacion como constantes reutilizables
// ─────────────────────────────────────────────────────────────────
export const PASSWORD_RULES = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[@$!%*?&]/,
} as const;

// Funcion para validar en tiempo real (sin zod)
export const validatePasswordInrealTime = (password: string) => {
  return {
    minLength: password.length >= PASSWORD_RULES.minLength,
    hasUppercase: PASSWORD_RULES.hasUppercase.test(password),
    hasNumber: PASSWORD_RULES.hasNumber.test(password),
    hasSpecialChar: PASSWORD_RULES.hasSpecialChar.test(password),
  };
};

// Esquema de zod para validacion final (reutilizacion de mismas reglas)
export const passwordSchema = z
  .string()
  .min(
    PASSWORD_RULES.minLength,
    `Minimo ${PASSWORD_RULES.minLength} caracteres`,
  )
  .regex(PASSWORD_RULES.hasUppercase, "Debe contener mayusculas")
  .regex(PASSWORD_RULES.hasNumber, "Debe contener almenos un numero")
  .regex(
    PASSWORD_RULES.hasSpecialChar,
    "Debe contener almenos un caracter especial (@$!%*?&)",
  );

// ─── Register con validacion realtime con zod ─────────────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "El nombre es requerido")
      .min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z
      .string()
      .min(1, "El correo es requerido")
      .email("Ingresa un correo electrónico válido")
      .max(100, "El email no debe exceder los 100 caracteres"),
    password: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(
        PASSWORD_RULES.minLength,
        `Mínimo ${PASSWORD_RULES.minLength} caracteres`,
      )
      .regex(
        PASSWORD_RULES.hasUppercase,
        "Debe contener al menos una mayúscula",
      )
      .regex(PASSWORD_RULES.hasNumber, "Debe contener al menos un número")
      .regex(
        PASSWORD_RULES.hasSpecialChar,
        "Debe contener al menos un carácter especial",
      ),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

//Array de Requisitos para mostrar en UI

export const PASSWORD_REQUIREMENTS = [
  { id: "minLength", label: `Minimo ${PASSWORD_RULES.minLength} caracteres` },
  { id: "hasUppercase", label: "Una letra mayuscula" },
  { id: "hasNumber", label: "Un numero" },
  { id: "hasSpecialChar", label: "Un caracter especial (@$!%*?&)" },
] as const;
