import Sidebar from '@/components/Sidebar';

export const DashboardLayout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-50">
      {/* Top Navigation Bar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
