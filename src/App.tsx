import "./App.css";
import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { initializeAuth } from "./store/slices/authSlice";
// import Sidebar from "./components/menus/Sidebar.jsx";
// import Footer from "./components/menus/Footer.jsx";

function App() {
  const dispatch = useAppDispatch();
  const isInitializing = useAppSelector((state) => state.auth.isInitializing);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Mientras se valida el token, no renderiza rutas para evitar redirecciones falsas
  if (isInitializing) return null;

  return (
    <section className="app-layout flex flex-col min-h-screen">
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
