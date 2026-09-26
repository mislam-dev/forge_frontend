import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function DashboardLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
      {modal}
    </div>
  );
}
