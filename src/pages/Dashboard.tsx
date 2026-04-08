import { Outlet } from "react-router-dom";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";

export default function Dashboard() {
  return (
    <section className="w-full min-h-full">
      <DashboardHeader />
      <main className="pt-20 pb-24 px-4 space-y-6">
        <Outlet />
      </main>
      <DashboardNavbar />
    </section>
  );
}
