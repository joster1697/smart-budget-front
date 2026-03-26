import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { useAppDispatch } from "../store/hooks";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string; // added to form errors
}

interface PasswordValidationState {
  // notEmpty: boolean;
  minLength: boolean;
  maxLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  noSpaces: boolean;
  noOnlyNumbers: boolean;
  noOnlyLetters: boolean;
  noRepeatingChars: boolean;
  noSequentialNumbers: boolean;
  noSequentialLetters: boolean;
  hasMixedCase: boolean;
  // noContainsName: boolean;
  // noContainsEmail: boolean;
}

// Definir la lista de requisitos (después de las interfaces)
const PASSWORD_REQUIREMENTS = [
  {
    id: "minLength",
    label: "Mínimo 8 caracteres",
    getValue: (valid: PasswordValidationState) => valid.minLength,
  },
  {
    id: "maxLength",
    label: "Máximo 50 caracteres",
    getValue: (valid: PasswordValidationState) => valid.maxLength,
  },
  {
    id: "hasLowercase",
    label: "Contiene minúsculas",
    getValue: (valid: PasswordValidationState) => valid.hasLowercase,
  },
  {
    id: "hasUppercase",
    label: "Contiene mayúsculas",
    getValue: (valid: PasswordValidationState) => valid.hasUppercase,
  },
  {
    id: "hasNumber",
    label: "Contiene números",
    getValue: (valid: PasswordValidationState) => valid.hasNumber,
  },
  {
    id: "hasSpecialChar",
    label: "Caracteres especiales (@$!%*?&)",
    getValue: (valid: PasswordValidationState) => valid.hasSpecialChar,
  },
  {
    id: "noSpaces",
    label: "Sin espacios",
    getValue: (valid: PasswordValidationState) => valid.noSpaces,
  },
  {
    id: "noOnlyNumbers",
    label: "No solo números",
    getValue: (valid: PasswordValidationState) => valid.noOnlyNumbers,
  },
  {
    id: "noOnlyLetters",
    label: "No solo letras",
    getValue: (valid: PasswordValidationState) => valid.noOnlyLetters,
  },
  {
    id: "noRepeatingChars",
    label: "Sin caracteres repetidos",
    getValue: (valid: PasswordValidationState) => valid.noRepeatingChars,
  },
  {
    id: "noSequentialNumbers",
    label: "Sin números consecutivos (123)",
    getValue: (valid: PasswordValidationState) => valid.noSequentialNumbers,
  },
  {
    id: "noSequentialLetters",
    label: "Sin letras consecutivas (abc)",
    getValue: (valid: PasswordValidationState) => valid.noSequentialLetters,
  },
  {
    id: "hasMixedCase",
    label: "Combina mayúsculas y minúsculas",
    getValue: (valid: PasswordValidationState) => valid.hasMixedCase,
  },
];

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [formData, setformData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setformData({
      ...formData,
      [name]: value,
    });
  };

  const [passwordValid, setPasswordValid] = useState<PasswordValidationState>({
    // notEmpty: false,
    minLength: false,
    maxLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    noSpaces: false,
    noOnlyNumbers: false,
    noOnlyLetters: false,
    noRepeatingChars: false,
    noSequentialNumbers: false,
    noSequentialLetters: false,
    hasMixedCase: false,
    // noContainsName: false,
    // noContainsEmail: false,
  });

  useEffect(() => {
    // const name = formData.name;
    // const email = formData.email;
    const password = formData.password;
    const isEmpty = !password;

    setPasswordValid({
      //password not Empty
      // notEmpty: !isEmpty,
      minLength: !isEmpty && password.length >= 8,
      maxLength: !isEmpty && password.length <= 50,
      hasLowercase: !isEmpty && /(?=.*[a-z])/.test(password),
      hasUppercase: !isEmpty && /(?=.*[A-Z])/.test(password),
      hasNumber: !isEmpty && /(?=.*\d)/.test(password),
      hasSpecialChar: !isEmpty && /(?=.*[@$!%*?&])/.test(password),
      noSpaces: !isEmpty && !/\s/.test(password),
      noOnlyNumbers: !isEmpty && !/^[0-9]+$/.test(password),
      noOnlyLetters: !isEmpty && !/^[a-zA-Z]+$/.test(password),
      noRepeatingChars: !isEmpty && !/(\w)\1{2,}/.test(password),
      noSequentialNumbers:
        !isEmpty && !/(012|123|234|345|456|567|678|789|890)/.test(password),
      noSequentialLetters:
        !isEmpty &&
        !/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(
          password,
        ),
      hasMixedCase:
        !isEmpty &&
        password !== password.toLocaleLowerCase() &&
        password !== password.toUpperCase(),
      // noContainsName:
      //   !isEmpty &&
      //   (!name || !password.toLowerCase().includes(name.toLowerCase())),
      // noContainsEmail:
      //   !isEmpty &&
      //   (!email ||
      //     !password.toLowerCase().includes(email.split("@")[0].toLowerCase())),
    });
  }, [formData.name, formData.email, formData.password]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    //Campo Name
    if (!formData.name) {
      newErrors.name = "El campo Nombre es necesario";
    }
    if (!formData.name.trim()) {
      newErrors.name = "El nombre no puede contener solo espacios";
    }
    if (formData.name.trim().length > 50) {
      newErrors.name = "El nombre no debe exceder los 50 caracteres";
    }
    if (formData.name.trim().length <= 2) {
      newErrors.name = "El nombre debe tener 2 o más caracteres";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.name.trim())) {
      newErrors.name = "El nombre solo puede contener letras y espacios";
    }
    //Campo Email
    if (!formData.email) {
      newErrors.email = "El campo Email es necesario";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email no valido";
    } else if (formData.email.length > 100) {
      newErrors.email = "El email no debe exceder los 100 caracteres";
    }
    //Campo Password
    if (!formData.password) {
      newErrors.password = "El campo Password es necesario";
    } else {
      if (formData.password.length < 8) {
        newErrors.password = "La contraseña debe tener 8 o más caracteres";
      } else if (formData.password.length > 64) {
        newErrors.password = "La contrasena no debe exceder los 64 caracteres";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contrasenas no coinciden";
      } else if (!/(?=.*[a-z])/.test(formData.password)) {
        newErrors.password =
          "La contraseña debe contener al menos una letra minúscula";
      } else if (!/(?=.*[A-Z])/.test(formData.password)) {
        newErrors.password =
          "La contraseña debe contener al menos una letra mayúscula";
      } else if (!/(?=.*\d)/.test(formData.password)) {
        newErrors.password = "La contraseña debe contener al menos un número";
      } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
        newErrors.password =
          "La contraseña debe contener al menos un carácter especial";
      } else if (/(\w)\1{2,}/.test(formData.password)) {
        newErrors.password =
          "La contraseña no puede tener caracteres repetidos consecutivamente";
      } else if (/\s/.test(formData.password)) {
        newErrors.password = "La contraseña no puede contener espacios";
      } else if (/^[0-9]+$/.test(formData.password)) {
        newErrors.password = "La contraseña no puede ser solo números";
      } else if (/^[a-zA-Z]+$/.test(formData.password)) {
        newErrors.password = "La contraseña no puede ser solo letras";
      } else if (
        formData.password.toLowerCase().includes(formData.name?.toLowerCase())
      ) {
        newErrors.password = "La contraseña no puede contener tu nombre";
      } else if (
        formData.password
          .toLowerCase()
          .includes(formData.email?.split("@")[0].toLowerCase())
      ) {
        newErrors.password =
          "La contraseña no puede contener tu nombre de usuario";
      } else if (
        /(012|123|234|345|456|567|678|789|890)/.test(formData.password)
      ) {
        newErrors.password =
          "La contraseña no puede contener secuencias numéricas consecutivas";
      } else if (
        /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(
          formData.password,
        )
      ) {
        newErrors.password =
          "La contraseña no puede contener secuencias de letras consecutivas";
      } else if (
        formData.password === formData.password.toLowerCase() ||
        formData.password === formData.password.toUpperCase()
      ) {
        newErrors.password =
          "La contraseña debe combinar mayúsculas y minúsculas";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log("FormData:", formData);
      if (validateForm()) {
        const response = await authService.register(formData);

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
          setErrors({ general: "El Usuario ya existe" });
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setErrors({
        general: error.message || "Error al conectar con el servidor",
      });
    }
  };

  // Función para contar cuántos requisitos se cumplen
  const countMetRequirements = (): number => {
    return PASSWORD_REQUIREMENTS.filter((req) => req.getValue(passwordValid))
      .length;
  };

  return (
    <section className="min-h-screen py-4 sm:py-6 md:py-8 lg:py-12 px-4 sm:px-6 md:px-8 ">
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
          <form onSubmit={handleRegister}>
            <div className=" flex flex-col">
              <label className="m-2 text-lg text-left font-bold" htmlFor="name">
                - Name:
              </label>
              <input
                className="m-2 border-2 p-2 border-white rounded-md bg-white text-black"
                type="text"
                id="name"
                name="name"
                placeholder=" Enter your name"
                onChange={handleChange}
                value={formData.name}
              />
              {errors.name && <span className="error">{errors.name}</span>}
              <label
                className="m-2 text-lg text-left font-bold"
                htmlFor="email"
              >
                - Email:
              </label>
              <input
                className="m-2 border-2 p-2 border-white rounded-md bg-white text-black"
                type="email"
                id="email"
                name="email"
                placeholder=" Enter your email"
                onChange={handleChange}
                value={formData.email}
              />
              {errors.email && <span className="error">{errors.email}</span>}
              <label
                className="m-2 text-lg text-left font-bold"
                htmlFor="password"
              >
                - Password:
              </label>
              <input
                className="m-2  border-2 p-2 border-white rounded-md bg-white text-black shadow-lg"
                type="password"
                id="password"
                name="password"
                placeholder=" Create a password"
                onChange={handleChange}
                value={formData.password}
              />
              {/* Progreso de requisitos */}
              <section>
                {/* --------------------------------------------------- */}
                {formData.password && (
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
                        const isMet = req.getValue(passwordValid);
                        return (
                          <div key={req.id} className="flex items-center gap-2">
                            <span
                              className={
                                isMet ? "text-green-400" : "text-gray-400"
                              }
                            >
                              {isMet ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="icon icon-tabler icons-tabler-filled icon-tabler-circle-check"
                                >
                                  <path
                                    stroke="none"
                                    d="M0 0h24v24H0z"
                                    fill="none"
                                  />
                                  <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  className="icon icon-tabler icons-tabler-outline icon-tabler-circle-dashed-check"
                                >
                                  <path
                                    stroke="none"
                                    d="M0 0h24v24H0z"
                                    fill="none"
                                  />
                                  <path d="M8.56 3.69a9 9 0 0 0 -2.92 1.95" />
                                  <path d="M3.69 8.56a9 9 0 0 0 -.69 3.44" />
                                  <path d="M3.69 15.44a9 9 0 0 0 1.95 2.92" />
                                  <path d="M8.56 20.31a9 9 0 0 0 3.44 .69" />
                                  <path d="M15.44 20.31a9 9 0 0 0 2.92 -1.95" />
                                  <path d="M20.31 15.44a9 9 0 0 0 .69 -3.44" />
                                  <path d="M20.31 8.56a9 9 0 0 0 -1.95 -2.92" />
                                  <path d="M15.44 3.69a9 9 0 0 0 -3.44 -.69" />
                                  <path d="M9 12l2 2l4 -4" />
                                </svg>
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
              <label
                className="m-2 text-lg text-left font-bold"
                htmlFor="password"
              >
                - Confirm Password:
              </label>
              <input
                className="m-2  border-2 p-2 border-white rounded-md bg-white text-black shadow-lg"
                type="password"
                id="password"
                name="confirmPassword"
                placeholder=" Confirm your password"
                onChange={handleChange}
                value={formData.confirmPassword}
              />
              {errors.password && (
                <span className="error">{errors.password}</span>
              )}
              {errors.confirmPassword && (
                <span className="error">{errors.confirmPassword}</span>
              )}
            </div>
            <div>
              {errors.general && (
                <p style={{ color: "#fff", fontWeight: "bold" }}>
                  {errors.general}!
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
            <div className="mt-3">
              <button
                type="submit"
                className="mt-1 w-full text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-5 py-2.5"
              >
                Create Account
              </button>
              <button
                type="button"
                className="mt-4 w-full text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-5 py-2.5"
                onClick={() => navigate("/login")}
              >
                Already have an account?{" "}
                <span className="font-bold">
                  <em>Login</em>
                </span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </section>
  );
}
