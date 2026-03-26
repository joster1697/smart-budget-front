import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import authService from "../services/authService";
import { useAppDispatch } from "../store/hooks";
import { setCredentials } from "../store/slices/authSlice";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import { BankIcon, MailIcon } from "../components/ui/Icons";
import { loginSchema, LoginFormValues } from "../lib/validations/authSchemas";

export default function Login() {
  // Error de servidor separado de los errores de validación del form
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    // Valida al salir del campo; revalida en tiempo real una vez que el campo tuvo error
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const response = await authService.login(data);
      dispatch(setCredentials({ user: response.user, token: response.tokens.accessToken }));
      navigate("/dashboard");
    } catch {
      setServerError("Error al conectar con el servidor");
    }
  };
  return (
    <main className="w-full min-h-screen justify-center flex flex-col gap-9 p-6">
      <div className="w-full flex flex-col items-center gap-6">
        <div
            className="h-[75px] w-[65px] bg-on-secondary-container flex items-center justify-center rounded-xl"
            aria-hidden="true"
          >
          <BankIcon size={36} className="text-primary" />
        </div>
        <div className="text-center">
          <h1 className="font-extrabold tracking-tight text-[2rem] text-on-background">
            Smart Budget
          </h1>
          <p className="text-[1rem] text-on-background">
            Manage your finances with ease
          </p>
        </div>
      </div>

      <section aria-label="Formulario de inicio de sesión" className="bg-surface-container-lowest p-8 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col gap-5">
            <InputField
              id="email"
              type="email"
              label="Correo Electrónico"
              placeholder="nombre@ejemplo.com"
              error={errors.email?.message}
              leftIcon={<MailIcon size={16} className="text-outline-variant" />}
              {...register("email")}
            />

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Contraseña</span>
                <button
                  type="button"
                  className="text-[0.75rem] font-bold text-primary cursor-pointer hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <InputField
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                error={errors.password?.message}
                {...register("password")}
              />
            </div>

            {serverError && (
              <span className="text-xs text-error font-medium text-center">{serverError}</span>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
              Iniciar Sesión
            </Button>
            
          </div>
        </form>
      </section>

      <div className="text-center">
        <p className="text-[0.9rem]">
          ¿Aún no tienes una cuenta?{" "}
          <button
            type="button"
            className="font-bold text-primary cursor-pointer hover:underline"
            onClick={() => navigate("/register")}
          >
            Crear Registro
          </button>
        </p>
      </div>
    </main>
  );
}
