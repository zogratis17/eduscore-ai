import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  Settings, 
  LogOut,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const Sidebar = () => {
  const { logout } = useAuth();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Upload, label: 'Upload', to: '/upload' },
    { icon: FileText, label: 'Results', to: '/results' },
  ];

  return (
    <div className="flex flex-col w-64 bg-slate-900 min-h-screen text-white">
      {/* Brand */}
      <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-800">
        <div className="bg-primary-500 p-1.5 rounded-md">
            <BookOpen className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-wide">EduScore AI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary-600 text-white shadow-sm" 
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}

        <div className="pt-6 mt-6 border-t border-slate-800">
             <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Settings
             </div>
             <NavLink
                to="/settings"
                className={({ isActive }) => clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary-600 text-white" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Settings className="h-5 w-5" />
                Settings
            </NavLink>
        </div>
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
