import { Outlet } from 'react-router-dom';

import { Sidebar } from './Sidebar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-brand-gray">
      <Sidebar />
      <main className="md:ml-[250px] p-4 sm:p-8 transition-all duration-300 min-h-screen">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
