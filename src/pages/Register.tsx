import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { useAppDispatch } from "../store/hooks";

interface FormData {
  name: string;
  email: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  general?: string; // added to form errors
}

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [formData, setformData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setformData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name) {
      newErrors.name = "El campo Nombre es necesario";
    }
    if (!formData.email) {
      newErrors.email = "El campo Email es necesario";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email no valido";
    }
    if (!formData.password) {
      newErrors.password = "El campo Password es necesario";
    } else if (formData.password.length < 5) {
      newErrors.password = "La contrasena debe tener 5 o mas caracteres";
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
      // console.log("Formulario Enviado:", formData);
      // navigate("/register");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setErrors({
        general: error.message || "Error al conectar con el servidor",
      });
    }
  };

  return (
    <section>
      <div className="">
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
              {errors.password && (
                <span className="error">{errors.password}</span>
              )}
            </div>
            <div>
              {errors.general && (
                <p style={{ color: "#fff", fontWeight: "bold" }}>
                  {errors.general}!
                </p>
              )}
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
