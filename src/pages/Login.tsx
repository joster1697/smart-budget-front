import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconArrowRight,
  IconBrain,
  IconMailFilled,
} from "@tabler/icons-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { BankIcon, IconHelpFilled } from "../components/ui/Icons";
import InputField from "../components/ui/InputField";
import { LoginFormValues, loginSchema } from "../lib/validations/authSchemas";
import authService from "../services/authService";
import { useAppDispatch } from "../store/hooks";
import { setCredentials } from "../store/slices/authSlice";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../components/ui/LanguageSelector";
import i18n from "../i18n";

export default function Login() {
  const { t } = useTranslation();
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
      dispatch(
        setCredentials({
          user: response.user,
          token: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken,
        }),
      );
      navigate("/dashboard");
    } catch {
      setServerError(t("auth.login.serverError"));
    }
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
                Domina tu <br /> <span className="text-primary">Arquitectura</span>
                <br /> Financiera.
              </>
            ) : (
              <>
                Master Your <br /> Financial <span className="text-primary">Architecture</span>.
              </>
            )}
          </h1>
          <h3 className="text-[#96c5a9] max-w-md text-xl leading-relaxed">
            {t("auth.login.subSlogan")}
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
          <button className="text-on-surface-variant hover:bg-surface-container transition-colors p-2 rounded-lg active:scale-95">
            <IconHelpFilled size={24} className="text-on-surface-variant" />
          </button>
        </div>

        <div className="w-full flex flex-col max-w-[448px] gap-9">
          {/* Cabecera — logo definido una vez, textos co-localizados por breakpoint */}
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
                <span className="hidden md:inline">{t("auth.login.title")}</span>
              </h1>
              <p className="text-lg text-on-surface-variant">
                <span className="md:hidden">{t("auth.login.welcomeMobile")}</span>
                <span className="hidden md:inline">{t("auth.login.welcomeDesktop")}</span>
              </p>
            </div>
          </div>

          <section
            aria-label="Formulario de inicio de sesión"
            className="w-full bg-surface-container-lowest p-8 md:p-0 rounded-xl shadow-lg md:shadow-none"
          >
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="flex flex-col gap-6">
                <InputField
                  id="email"
                  type="email"
                  label={t("auth.login.emailLabel")}
                  placeholder={t("auth.login.emailPlaceholder")}
                  error={errors.email?.message}
                  leftIcon={
                    <IconMailFilled size={20} className="text-outline" />
                  }
                  {...register("email")}
                />

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-on-surface">
                      {t("auth.login.passwordLabel")}
                    </span>
                    <button
                      type="button"
                      className="text-sm transition-all font-bold text-primary cursor-pointer hover:underline"
                    >
                      {t("auth.login.forgotPassword")}
                    </button>
                  </div>
                  <InputField
                    id="password"
                    type="password"
                    placeholder={t("auth.login.passwordPlaceholder")}
                    error={errors.password?.message}
                    {...register("password")}
                  />
                </div>

                {serverError && (
                  <span className="text-xs text-error font-medium text-center">
                    {serverError}
                  </span>
                )}

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
                  {t("auth.login.submitBtn")}
                </Button>
              </div>
            </form>
          </section>

          <div className="text-center">
            <p className="text-base text-on-surface-variant">
              {t("auth.login.noAccount")}{" "}
              <button
                type="button"
                className="ml-1 font-black text-primary cursor-pointer hover:underline"
                onClick={() => navigate("/register")}
              >
                {t("auth.login.registerFree")}
              </button>
            </p>
          </div>

          {/* Selector de idioma y botón de ayuda — visible solo en móvil, centrado al final */}
          <div className="flex md:hidden flex-col items-center gap-4 mt-4 pt-6 border-t border-on-surface-variant/10 w-full">
            <div className="flex gap-4 items-center">
              <LanguageSelector />
              <button className="text-on-surface-variant hover:bg-surface-container transition-colors p-2 rounded-lg active:scale-95">
                <IconHelpFilled size={24} className="text-on-surface-variant" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
