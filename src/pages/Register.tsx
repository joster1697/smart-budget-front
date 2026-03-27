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
      <div className="max-w-md sm:maxw-lg md:max-w-xl lg:max-w2xl xl:max-w-3xl mx-auto">
        <div className="bg-black text-white p-10 rounded-tl-lg rounded-tr-lg text-center">
          <h1>
            <em>Register to Smart</em>
            <span className="text-blue-600 font-bold">
              <em>Budget</em>
            </span>
            !
          </h1>
        </div>

        <main className="bg-blue-600 p-5 rounded-bl-lg rounded-br-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className=" flex flex-col">
              <InputField
                className="m-2 border-2 p-2 border-white rounded-md bg-white text-black"
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
                className="m-2 border-2 p-2 border-white rounded-md bg-white text-black"
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
                className="m-2  border-2 p-2 border-white rounded-md bg-white text-black shadow-lg"
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
                  <div className="mx-2 mt-2 p-3 bg-white/10 rounded-lg border border-white/20">
                    {/* Contador de progreso */}
                    <div className="mb-2">
                      <span className="text-white text-sm">Progreso: </span>
                      <span className="text-white text-sm font-semibold">
                        {countMetRequirements()} de{" "}
                        {PASSWORD_REQUIREMENTS.length} requisitos
                      </span>
                    </div>

                    {/* Grid de requisitos con .map */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {PASSWORD_REQUIREMENTS.map((req) => {
                        const isMet = passwordValid[req.id];
                        return (
                          <div key={req.id} className="flex items-center gap-2">
                            <span
                              className={
                                isMet ? "text-green-400" : "text-gray-400"
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
                                isMet ? "text-green-200" : "text-gray-300"
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
                className="m-2  border-2 p-2 border-white rounded-md bg-white text-black shadow-lg"
                id="confirmPassword"
                type="password"
                label="Confirme su contraseña"
                error={errors.confirmPassword?.message}
                placeholder="Confirme su contraseña"
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
            <div className="mt-3 gap-4">
              <Button type="submit" variant="primary" size="lg" fullWidth>
                Create Account
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate("/login")}
              >
                Already have an account?{" "}
                <span className="font-bold">Login</span>
              </Button>
            </div>
          </form>
        </main>
      </div>
    </section>
  );
}
