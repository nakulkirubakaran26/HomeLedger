import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex h-screen bg-background text-text-primary overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full p-8 transition-all relative">
        <div className="max-w-7xl mx-auto w-full space-y-8">
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
