import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search } from 'lucide-react';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
      {/* Search Bar */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
            placeholder="Search documents, students, or results..."
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors">
          <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          <Bell className="h-6 w-6" />
        </button>

        <div className="h-8 w-px bg-gray-200 mx-2" />

        <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role === 'educator' ? 'Associate Professor' : 'Admin'}</p>
            </div>
            <img
                className="h-9 w-9 rounded-full bg-gray-300 ring-2 ring-white shadow-sm"
                src={user?.avatar}
                alt={user?.name}
            />
        </div>
      </div>
    </header>
  );
};

export default Header;
