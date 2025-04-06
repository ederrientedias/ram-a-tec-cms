
import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-brand-gray">
      <Sidebar />
      <main className="md:ml-[250px] p-4 sm:p-8 transition-all duration-300 min-h-screen">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
