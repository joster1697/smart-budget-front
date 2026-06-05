import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import Sidebar from "../components/dashboard/Sidebar";
import DesktopChatInput from "../components/dashboard/DesktopChatInput";
import { useAgentChat } from "../hooks/useAgentChat";
import { useAppDispatch } from "../store/hooks";
import { fetchAccounts } from "../store/slices/accountsSlice";

export default function Dashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  useAgentChat(true); // Initialize global WebSocket connection
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  useEffect(() => {
    const measure = () => {
      const mobileNav = document.getElementById("mobile-navbar");
      const desktopInput = document.getElementById("desktop-chat-input");

      let visibleHeight = 0;
      if (window.innerWidth < 1024) {
        if (mobileNav) {
          const rect = mobileNav.getBoundingClientRect();
          visibleHeight = window.innerHeight - rect.top;
        } else {
          visibleHeight = 70;
        }
      } else {
        if (desktopInput) {
          const rect = desktopInput.getBoundingClientRect();
          visibleHeight = window.innerHeight - rect.top;
        } else {
          visibleHeight = 96;
        }
      }
      document.documentElement.style.setProperty("--bottom-spacing", `${visibleHeight}px`);
    };

    measure();

    let frameId: number;
    const startTime = Date.now();
    const tick = () => {
      measure();
      if (Date.now() - startTime < 600) {
        frameId = requestAnimationFrame(tick);
      }
    };
    frameId = requestAnimationFrame(tick);

    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", measure);
    };
  }, [isCollapsed]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative w-full lg:max-w-[calc(100vw-280px)] bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="lg:hidden">
          <DashboardHeader />
        </div>
        <main
          className="flex-1 overflow-x-hidden pt-20 lg:pt-10 px-4 lg:px-10 space-y-6 lg:space-y-8 transition-all duration-500"
          style={{ paddingBottom: "calc(var(--bottom-spacing, 70px) + var(--banner-height, 0px) + 26px)" }}
        >
          <Outlet context={{ isCollapsed, setIsCollapsed }} />
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
