import { Outlet } from 'react-router-dom';

import { ScrollArea } from '../ui/scroll-area';
import { Sidebar } from './Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex h-full bg-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        <ScrollArea className="h-full">
          <main className="p-4 sm:p-8 transition-all duration-300">
            <div className="mx-auto max-w-6xl">
              <Outlet />
            </div>
          </main>
        </ScrollArea>
      </div>
    </div>
  );
};

export default DashboardLayout;
