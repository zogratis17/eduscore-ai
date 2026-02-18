import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const isResultsPage = location.pathname.startsWith('/results/');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {!isResultsPage && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className={`flex-1 overflow-y-auto scroll-smooth ${isResultsPage ? 'p-0' : 'p-8'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
