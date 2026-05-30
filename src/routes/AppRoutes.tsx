import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Home from "../pages/dashboard/Home";
import Transactions from "../pages/dashboard/Transactions";
import Accounts from "../pages/dashboard/Accounts";
import Reports from "../pages/dashboard/Reports";
import Chat from "../pages/dashboard/Chat";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import Budget from "../pages/dashboard/Budget";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Redirige la raíz al login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rutas públicas: solo accesibles sin sesión */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Rutas privadas: requieren sesión activa */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="reports" element={<Reports />} />
          <Route path="chat" element={<Chat />} />
          <Route path="budget" element={<Budget />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
