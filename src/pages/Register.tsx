import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { useAppDispatch } from "../store/hooks";
import Button from "../components/ui/Button";
import { useForm } from "react-hook-form";
import {
  RegisterFormValues,
  registerSchema,
  validatePasswordInrealTime,
  PASSWORD_REQUIREMENTS,
} from "../lib/validations/authSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../components/ui/InputField";
import {
  MailIcon,
  UserIcon,
  LockIcon,
  FilledCheck,
  EmptyCheck,
  BankIcon,
} from "../components/ui/Icons";
import { object } from "zod";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });
  //observa valor de la contrasena en tiempo real
  const passwordValue = watch("password") || "";
  //valida en tiempo real la contrasena con la funcion que se tiene en authSchema
  const passwordValid = validatePasswordInrealTime(passwordValue);

  //
  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    try {
      const response = await authService.register(data);

      if (response.user.email) {
        dispatch({
          type: "auth/setCredentials",
          payload: {
            user: response.user,
            token: response.tokens.accessToken,
          },
        });
        navigate("/dashboard");
      } else {
        setServerError("El Usuario ya existe");
      }
    } catch (error: any) {
      setServerError("Error al conectar con el servidor");
    }
  };

  // Función para contar cuántos requisitos se cumplen
  const countMetRequirements = (): number => {
    return Object.values(passwordValid).filter((v) => v === true).length;
  };

  return (
    <section className="w-full min-h-screen justify-center flex flex-col gap-9 p-6 ">
      <div className="w-full flex flex-row items-center gap-6">
        <div className="w-1/3">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut, saepe
          iure excepturi commodi, sit eos itaque numquam et perferendis possimus
          amet temporibus aspernatur? Quam, tempore minima soluta provident
          dolores quibusdam?
        </div>

        <main>
          <section className="bg-surface-container-lowest p-8 rounded-xl shadow-lg">
            <div className="h-[75px] w-[65px] bg-on-secondary-container flex items-center justify-center rounded-xl">
              <BankIcon size={36} className="text-primary" />
            </div>
            <div className=" text-black p-10 rounded-tl-lg rounded-tr-lg text-center font font-extrabold text-[2rem]">
              <h1>Smart Budget</h1>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="flex flex-col gap-5">
                <InputField
                  id="name"
                  type="text"
                  label="Nombre"
                  placeholder="Ej: Juan Alvarez"
                  error={errors.name?.message}
                  leftIcon={
                    <UserIcon size={16} className="text-outline-variant" />
                  }
                  {...register("name")}
                />
                {serverError && <span className="error">{serverError}</span>}
                <InputField
                  id="email"
                  type="email"
                  label="Correo Electronico"
                  error={errors.email?.message}
                  placeholder="nombre@ejemplo.com"
                  leftIcon={
                    <MailIcon size={16} className="text-outline-variant" />
                  }
                  {...register("email")}
                />
                {errors.email && <span className="error">{serverError}</span>}
                <InputField
                  id="password"
                  type="password"
                  label="Contraseña"
                  error={errors.password?.message}
                  placeholder="Cree una contraseña"
                  leftIcon={
                    <LockIcon size={16} className="text-outline-variant" />
                  }
                  {...register("password")}
                />
                {/* Progreso de requisitos */}
                <section>
                  {/* --------------------------------------------------- */}
                  {passwordValue && (
                    <div className="mx-2 p-3 bg-white/10 rounded-lg border border-white/20 ">
                      {/* Contador de progreso */}
                      <div className="bg-surface-container rounded-1">
                        <span className="text-white text-sm">Progreso: </span>
                        <span className="text-white text-sm font-semibold">
                          {countMetRequirements()} de{" "}
                          {PASSWORD_REQUIREMENTS.length} requisitos
                        </span>
                      </div>

                      {/* Grid de requisitos con .map */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4  p-4 bg-surface-container rounded">
                        {PASSWORD_REQUIREMENTS.map((req) => {
                          const isMet = passwordValid[req.id];
                          return (
                            <div
                              key={req.id}
                              className="flex items-center gap-2"
                            >
                              <span
                                className={
                                  isMet ? "text-green-400" : "text-gray-500"
                                }
                              >
                                {isMet ? (
                                  <FilledCheck size={24} />
                                ) : (
                                  <EmptyCheck size={24} />
                                )}
                              </span>
                              <span
                                className={
                                  isMet ? "text-green-200" : "text-gray-500"
                                }
                              >
                                {req.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </section>
                {/* --------------------------------------------------- */}

                <InputField
                  id="confirmPassword"
                  type="password"
                  label="Confirmar contraseña"
                  error={errors.confirmPassword?.message}
                  placeholder="Confirmar contraseña"
                  leftIcon={
                    <LockIcon size={16} className="text-outline-variant" />
                  }
                  {...register("confirmPassword")}
                />
                {serverError && <span className="error">{serverError}</span>}
                {serverError && <span className="error">{serverError}</span>}
              </div>
              <div>
                {serverError && (
                  <p style={{ color: "#fff", fontWeight: "bold" }}>
                    {serverError}!
                  </p>
                )}
              </div>
              <div>
                <input type="checkbox" id="#terms&conditions" required />
                <span>
                  {" "}
                  Acepto los{" "}
                  <strong>
                    <a
                      href="#"
                      style={{ color: "#000", textDecoration: "underline" }}
                    >
                      Terminos de Servicio
                    </a>
                  </strong>{" "}
                  y la{" "}
                  <strong>
                    <a
                      href="#"
                      style={{ color: "#000", textDecoration: "underline" }}
                    >
                      Politica de Privacidad
                    </a>
                  </strong>{" "}
                  de SmartBudget
                </span>
              </div>
              <div className="flex gap-4 mt-4 mb-4">
                <Button type="submit" variant="primary" size="md" fullWidth>
                  Create Account
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => navigate("/login")}
                >
                  Already have an account?{" "}
                  <span className="font-bold">Login</span>
                </Button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </section>
  );
}
