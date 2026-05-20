import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import Sidebar from "../components/dashboard/Sidebar";
import DesktopChatInput from "../components/dashboard/DesktopChatInput";
import { useAppDispatch } from "../store/hooks";
import { fetchAccounts } from "../store/slices/accountsSlice";

export default function Dashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative w-full lg:max-w-[calc(100vw-280px)] bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="lg:hidden">
          <DashboardHeader />
        </div>
        <main
          className={`flex-1 overflow-x-hidden pt-20 lg:pt-10 px-4 lg:px-10 space-y-6 lg:space-y-8 transition-all duration-500 ${isCollapsed ? "pb-24 lg:pb-32" : "pb-60 lg:pb-32"}`}
        >
          <Outlet />
        </main>
        <div className="lg:hidden">
          <DashboardNavbar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        </div>
        <DesktopChatInput />
      </div>
    </div>
  );
}
