import "./App.css";
import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { initializeAuth, logout, updateToken } from "./store/slices/authSlice";
// import Sidebar from "./components/menus/Sidebar.jsx";
// import Footer from "./components/menus/Footer.jsx";

function App() {
  const dispatch = useAppDispatch();
  const isInitializing = useAppSelector((state) => state.auth.isInitializing);

  useEffect(() => {
    dispatch(initializeAuth());

    const handleLogoutEvent = () => {
      dispatch(logout());
    };

    const handleRefreshEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ token: string; refreshToken?: string }>;
      const { token: newToken, refreshToken: newRefreshToken } = customEvent.detail;
      // Actualizamos el Redux store
      dispatch(
        updateToken({
          token: newToken,
          refreshToken: newRefreshToken,
        })
      );
    };
    
    window.addEventListener("auth:logout", handleLogoutEvent);
    window.addEventListener("auth:refresh", handleRefreshEvent);
    return () => {
      window.removeEventListener("auth:logout", handleLogoutEvent);
      window.removeEventListener("auth:refresh", handleRefreshEvent);
    };
  }, [dispatch]);

  // Mientras se valida el token, no renderiza rutas para evitar redirecciones falsas
  if (isInitializing) return null;

  return (
    <section className="flex flex-col min-h-screen">
      {/* <section className="flex flex-grow">
        <Sidebar />
        <section className="flex-grow p-4">
          <Dashboard />
        </section>
      </section>
      <Footer className="flex-col" /> */}
      <main>
        <AppRoutes />
      </main>
    </section>
  );
}
export default App;
