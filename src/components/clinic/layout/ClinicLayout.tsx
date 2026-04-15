// src/components/clinic/layout/ClinicLayout.tsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ToolWrapper from './ToolWrapper';

const ClinicLayout = () => {

  return (
    <div className="clinic-theme-container min-h-screen flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 flex-col flex">
        <main className="flex-1 p-4 lg:p-8 overflow-auto bg-[rgb(var(--bg))] h-full">
          <ToolWrapper>
            <Outlet />
          </ToolWrapper>
        </main>
      </div>
      <div className="h-20 lg:hidden" />
    </div>
  );
};

export default ClinicLayout;