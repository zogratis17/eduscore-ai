import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  FileText,
  Settings,
  LogOut,
  Sparkles,
  ClipboardList,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Upload, label: 'Upload', to: '/upload' },
    { icon: ClipboardList, label: 'Rubrics', to: '/rubrics' },
    { icon: FileText, label: 'Documents', to: '/results' },
  ];

  return (
    <div className="flex flex-col w-[260px] min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Subtle decorative gradient orbs */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-primary-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-32 h-32 bg-violet-500/8 rounded-full blur-3xl translate-x-1/2 pointer-events-none" />

      {/* Brand */}
      <div className="flex items-center gap-3 h-16 px-5 border-b border-white/[0.06] relative z-10">
        <div className="bg-gradient-to-br from-primary-500 to-violet-600 p-1.5 rounded-lg shadow-glow-sm">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-[15px] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
            EduScore AI
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 px-3 space-y-0.5 sidebar-scroll overflow-y-auto relative z-10">
        <div className="px-3 mb-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.12em]">
            Main Menu
          </span>
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative ${
                isActive
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-primary-400 to-violet-500 rounded-r-full" />
              )}
              <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-slate-500 group-hover:text-slate-300 group-hover:bg-white/[0.04]'
              }`}>
                <item.icon className="h-4 w-4" />
              </div>
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              )}
            </NavLink>
          );
        })}

        <div className="pt-5 mt-5 border-t border-white/[0.06]">
          <div className="px-3 mb-3">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.12em]">
              System
            </span>
          </div>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white/[0.08] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`
            }
          >
            <div className="p-1.5 rounded-lg text-slate-500 group-hover:text-slate-300">
              <Settings className="h-4 w-4" />
            </div>
            Settings
          </NavLink>
        </div>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-white/[0.06] relative z-10">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] mb-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-white/10 shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.name || user?.email || 'User'}</p>
            <p className="text-[10px] text-slate-500 capitalize">{user?.role || 'Student'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-[13px] font-medium text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
