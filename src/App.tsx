import "./App.css";
import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Sidebar from "./components/menus/Sidebar.jsx";
import Footer from "./components/menus/Footer.jsx";
import Searchbar from "./components/menus/Searchbar.jsx";
import AddTransactionBtn from "./components/ui/buttons/AddTransactionBtn.jsx"

function App() {
  return (
    <section className="app-layout">
      <Sidebar />
      {/* <Searchbar/> */}
      {/* <AddTransactionBtn/> */}
      {/* <Footer/> */}
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path='/Dashboard' element={<Dashboard/>}></Route> */}
        </Routes>
      </main>
    </section>
  );
}
export default App;
