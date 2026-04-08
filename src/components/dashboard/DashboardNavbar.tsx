import { NavLink } from "react-router-dom";
import {
  IconHomeFilled,
  IconReceiptDollarFilled,
  IconReportAnalytics,
  IconWallet,
} from "@tabler/icons-react";

const navItems = [
  { to: "/dashboard/home", icon: IconHomeFilled, label: "Home" },
  { to: "/dashboard/activity", icon: IconReceiptDollarFilled, label: "Activity" },
  { to: "/dashboard/accounts", icon: IconWallet, label: "Accounts" },
  { to: "/dashboard/reports", icon: IconReportAnalytics, label: "Reports" },
];

export default function DashboardNavbar() {
  return (
    <nav className="fixed bg-surface-container-lowest backdrop-blur-xl z-50 bottom-0 left-0 w-full flex items-center justify-around px-4 py-3">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center active:scale-90 duration-200 transition-colors ${
              isActive ? "!text-on-primary" : "!text-nav-inactive"
            }`
          }
        >
          <Icon size={32} />
          <span className="font-manrope text-[12px] font-bold">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
