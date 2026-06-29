'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Navbar } from '@/components/dashboard/Navbar';
import { BusinessProvider } from '@/providers/BusinessProvider';
import { ToastProvider } from '@/components/ui/Toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <BusinessProvider>
        <div className="flex h-screen overflow-hidden" style={{ background: '#080e10' }}>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Navbar onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 overflow-y-auto">
              <div className="p-5 max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </BusinessProvider>
    </ToastProvider>
  );
}
