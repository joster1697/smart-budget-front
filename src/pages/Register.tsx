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
import {
  IconArrowRight,
  IconBrain,
} from "@tabler/icons-react";
import { setCredentials } from "../store/slices/authSlice";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import LanguageSelector from "../components/ui/LanguageSelector";

export default function Register() {
  const { t } = useTranslation();
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
        dispatch(
          setCredentials({
            user: response.user,
            token: response.tokens.accessToken,
            refreshToken: response.tokens.refreshToken,
          }),
        );
        navigate("/dashboard");
      } else {
        setServerError(t("auth.register.userExists") || "El Usuario ya existe");
      }
    } catch {
      setServerError(t("auth.login.serverError"));
    }
  };

  // Función para contar cuántos requisitos se cumplen
  const countMetRequirements = (): number => {
    return Object.values(passwordValid).filter((v) => v === true).length;
  };

  return (
    <main className="w-full min-h-screen flex flex-row">
      {/* Panel izquierdo con beneficios */}
      <section className="relative hidden md:flex flex-col justify-between min-w-1/2 lg:min-w-[45%] bg-inverse-surface p-8 md:p-16">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #38e07b 1px, transparent 0)", backgroundSize: "32px 32px" }}
        ></div>
        <div className="relative z-10 w-full h-full">
          <h2 className="text-primary text-2xl tracking-tighter font-black uppercase mb-16">
            {import.meta.env.VITE_APP_NAME}
          </h2>
          <h1 className="text-inverse-on-surface text-5xl lg:text-7xl leading-[1.1] font-black mb-8 tracking-[-0.033em]">
            {i18n.language.startsWith("es") ? (
              <>
                Crea tu <br /> <span className="text-primary">Cuenta</span>
                <br /> Financiera.
              </>
            ) : (
              <>
                Create Your <br /> Financial <span className="text-primary">Account</span>.
              </>
            )}
          </h1>
          <h3 className="text-[#96c5a9] max-w-md text-xl leading-relaxed">
            {t("auth.register.subSlogan")}
          </h3>
        </div>
        <div className="relative z-10 mt-12 md:mt-0">
          <div className="flex items-center gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 max-w-sm">
            <div className="min-w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <IconBrain size={28} className="text-primary" />
            </div>
            <div>
              <p className="text-surface-bright font-bold text-base">
                {t("auth.login.intelligenceTitle")}
              </p>
              <p className="text-[#96c5a9] text-sm">
                {t("auth.login.intelligenceDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Panel derecho con formulario */}
      <div className="relative w-full flex gap-9 p-6 md:p-14 justify-center items-center md:bg-surface-container-lowest">
        {/* Botones de ayuda e idioma — anclados al panel derecho (visible solo en escritorio/tablet) */}
        <div className="hidden md:flex absolute top-6 right-6 gap-2 items-center">
          <LanguageSelector />
        </div>

        <div className="w-full flex flex-col max-w-[448px] gap-9">
          {/* Cabecera — logo y textos */}
          <div className="flex flex-col items-center md:items-start gap-6">
            <div
              className="h-[75px] w-[65px] bg-on-secondary-container flex items-center justify-center rounded-xl"
              aria-hidden="true"
            >
              <BankIcon size={36} className="text-primary" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="font-black tracking-tight text-4xl text-on-surface mb-3">
                <span className="md:hidden uppercase">{import.meta.env.VITE_APP_NAME}</span>
                <span className="hidden md:inline">{t("auth.register.title")}</span>
              </h1>
              <p className="text-lg text-on-surface-variant">
                <span className="md:hidden">{t("auth.register.welcomeMobile")}</span>
                <span className="hidden md:inline">{t("auth.register.welcomeDesktop")}</span>
              </p>
            </div>
          </div>

          <section
            aria-label="Formulario de registro"
            className="w-full bg-surface-container-lowest p-8 md:p-0 rounded-xl shadow-lg md:shadow-none"
          >
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="flex flex-col gap-6">
                <InputField
                  id="name"
                  type="text"
                  label={t("auth.register.nameLabel")}
                  placeholder={t("auth.register.namePlaceholder")}
                  error={errors.name?.message}
                  leftIcon={
                    <UserIcon size={20} className="text-outline-variant" />
                  }
                  {...register("name")}
                />

                <InputField
                  id="email"
                  type="email"
                  label={t("auth.register.emailLabel")}
                  error={errors.email?.message}
                  placeholder={t("auth.register.emailPlaceholder")}
                  leftIcon={
                    <MailIcon size={20} className="text-outline-variant" />
                  }
                  {...register("email")}
                />

                <InputField
                  id="password"
                  type="password"
                  label={t("auth.register.passwordLabel")}
                  error={errors.password?.message}
                  placeholder={t("auth.register.passwordPlaceholder")}
                  leftIcon={
                    <LockIcon size={20} className="text-outline-variant" />
                  }
                  {...register("password")}
                />

                {/* Progreso de requisitos de contraseña */}
                {passwordValue && (
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                    <div className="mb-3">
                      <span className="text-sm text-on-surface-variant">Fortaleza: </span>
                      <span className="text-sm font-semibold text-on-surface">
                        {countMetRequirements()} de {PASSWORD_REQUIREMENTS.length} requisitos
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {PASSWORD_REQUIREMENTS.map((req) => {
                        const isMet = passwordValid[req.id];
                        return (
                          <div
                            key={req.id}
                            className="flex items-center gap-2"
                          >
                            <span
                              className={
                                isMet ? "text-green-400" : "text-on-surface-variant"
                              }
                            >
                              {isMet ? (
                                <FilledCheck size={20} />
                              ) : (
                                <EmptyCheck size={20} />
                              )}
                            </span>
                            <span
                              className={
                                isMet ? "text-green-200 text-sm" : "text-on-surface-variant text-sm"
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

                <InputField
                  id="confirmPassword"
                  type="password"
                  label={i18n.language.startsWith("es") ? "Confirmar Contraseña" : "Confirm Password"}
                  error={errors.confirmPassword?.message}
                  placeholder={i18n.language.startsWith("es") ? "Confirma tu contraseña" : "Confirm your password"}
                  leftIcon={
                    <LockIcon size={20} className="text-outline-variant" />
                  }
                  {...register("confirmPassword")}
                />

                {serverError && (
                  <span className="text-xs text-error font-medium text-center">
                    {serverError}
                  </span>
                )}

                <div className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1"
                  />
                  <span className="text-on-surface-variant">
                    {i18n.language.startsWith("es") ? (
                      <>
                        Acepto los{" "}
                        <a
                          href="#"
                          className="text-primary font-semibold hover:underline"
                        >
                          Términos de Servicio
                        </a>{" "}
                        y la{" "}
                        <a
                          href="#"
                          className="text-primary font-semibold hover:underline"
                        >
                          Política de Privacidad
                        </a>{" "}
                        de SmartBudget
                      </>
                    ) : (
                      <>
                        I accept the{" "}
                        <a
                          href="#"
                          className="text-primary font-semibold hover:underline"
                        >
                          Terms of Service
                        </a>{" "}
                        and the{" "}
                        <a
                          href="#"
                          className="text-primary font-semibold hover:underline"
                        >
                          Privacy Policy
                        </a>{" "}
                        of SmartBudget
                      </>
                    )}
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                  rightIcon={
                    <IconArrowRight size={24} className="text-on-primary" />
                  }
                >
                  {t("auth.register.submitBtn")}
                </Button>
              </div>
            </form>
          </section>

          <div className="text-center">
            <p className="text-base text-on-surface-variant">
              {t("auth.register.alreadyHaveAccount")}{" "}
              <button
                type="button"
                className="ml-1 font-black text-primary cursor-pointer hover:underline"
                onClick={() => navigate("/login")}
              >
                {t("auth.register.loginBtn")}
              </button>
            </p>
          </div>

          {/* Selector de idioma — visible solo en móvil, centrado al final */}
          <div className="flex md:hidden flex-col items-center gap-4 mt-4 pt-6 border-t border-on-surface-variant/10 w-full">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </main>
  );
}
