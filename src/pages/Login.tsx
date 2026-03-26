import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { useAppDispatch } from "../store/hooks";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function Login() {
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log("formdata: ", formData);
      
      // const response = await fetch("api/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });
      // const data: LoginResponse = await response.json();

      const response = await authService.login(formData);

      if (response.tokens.accessToken) {
        dispatch({
          type: "auth/setCredentials",
          payload: {
            user: response.user,
            token: response.tokens.accessToken,
          },
        });
          navigate("/dashboard");
      } else {
        setErrors({ general: "Credenciales Incorrectas" });
      }
    } catch (error) {
      setErrors({ general: "Error al conectar con el servidor" });
    }
  };
  return (
    <section>
      <div className="bg-black text-white p-10 rounded-tl-lg rounded-tr-lg text-center">
        <h1>
          <em>Login to Smart</em>
          <span className="text-blue-600 font-bold">
            <em>Budget</em>
          </span>
          !
        </h1>
      </div>

      <main className="bg-blue-600 p-5 rounded-bl-lg rounded-br-lg">
        <form onSubmit={handleLogin}>
          <div className=" flex flex-col">
            <label className="m-2 text-lg text-left font-bold" htmlFor="email">
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
              className="m-2 border-2 p-2 border-white rounded-md bg-white text-black shadow-lg"
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

            <div className="mt-3">
              <button
                type="submit"
                className="mt-1 w-full text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-5 py-2.5"
              >
                Login
              </button>
              <button
                type="button"
                className="mt-4 w-full text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-5 py-2.5"
                onClick={() => navigate("/register")}
              >
                New here? <span className="font-bold"><em>Register</em></span>
              </button>
            </div>
          </div>
        </form>
      </main>
    </section>
  );
}
