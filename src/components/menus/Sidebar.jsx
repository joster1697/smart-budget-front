import { NavLink } from "react-router-dom";

const Sidebar = () => {

  const currentYear = new Date().getFullYear();

  const links = [
    { name: "Home", path: "/Home" },
    { name: "Dashboard", path: "/Dashboard" },
    { name: "Transactions", path: "/Transactions" },
    { name: "Budgets", path: "/Budgets" },
    { name: "Reports", path: "/Reports" },
    { name: "Settings", path: "/Settings" },
    { name: "Help & Support", path: "/Help" },
  ];

  return (
    <section>
      <div>
        <h2 className="text-3xl font-extrabold text-white mb-4">
          Smart<span className="text-indigo-400 mb-4">Budget</span>
        </h2>
      </div>
      <nav className="sidebar flex-col">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `flex items-left gap-3 px-4 py-2 transition-colors ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`
                }
              >
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700 text-sm text-gray-500">
        @ {currentYear} Smart Budget. All rights reserved.
      </div>
    </section>
  );
};

export default Sidebar;
