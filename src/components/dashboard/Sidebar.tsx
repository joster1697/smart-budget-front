import { NavLink, useNavigate } from "react-router-dom";
import { IconLogout } from "@tabler/icons-react";
import { NAV_ITEMS } from "../../constants/navigation";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside className="hidden lg:flex flex-col w-[280px] bg-[#0a1f12] h-screen sticky top-0 left-0 text-white shadow-xl z-50">
      {/* Logo Area */}
      <div className="p-8">
        <h1 className="text-3xl font-black tracking-tighter text-[#38e07b] font-manrope">
          Fynkro
        </h1>
        <p className="text-xs text-white/50 font-medium mt-1">
          Financial Sanctuary
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 flex flex-col gap-2 px-4">
        {NAV_ITEMS.map(({ to, icon: Icon, sidebarLabel }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                isActive
                  ? "bg-[#00210c] text-[#38e07b]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Icon size={20} />
            {sidebarLabel}
          </NavLink>
        ))}
      </nav>

      {/* User Area */}
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#00210c] border border-[#38e07b]/30 flex items-center justify-center shrink-0">
            {/* Fallback avatar if image is not there, or use img */}
            <img
              alt="User Profile"
              className="w-full h-full object-cover rounded-full"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBq04dS_0SAaG2Yicvf4lUJvRsMMnLpwFFDgAkuF4Ldo1HeoNU1kj-1-LzCAU9O5EDDCRyJRVyVZ5k9Jk4vmi5t2Dv2RExMBsMlHDQ7UmRESbd69MHhE_6ib8GIrAN9w8DFY577K3-axZKsoF7JKKfQrcU6Jn1IyIskmVChMuvUEUKmC_GH5RtF9hex4GRPi8q1kDjfkbj1lbos20RItuvhq1G6ZM0Z0luBu-p_2qlh7rkuHKPz5vZBQloyYtacunEZ_nS7qhoaO3-g"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">
              Jorge Ramirez
            </p>
            <p className="text-[10px] font-bold text-[#38e07b] uppercase mt-0.5">
              Plan Premium
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-white/50 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider w-full"
        >
          <IconLogout size={18} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
