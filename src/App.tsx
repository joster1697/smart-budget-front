import "./App.css";
import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Sidebar from "./components/menus/Sidebar.jsx";
import Footer from "./components/menus/Footer.jsx";
import Dashboard from "./pages/Dashboard.tsx";

function App() {
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
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/Dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </section>
  );
}
export default App;
