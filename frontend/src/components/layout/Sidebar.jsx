import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  BarChart2, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  GraduationCap
} from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../common/Button';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Upload', icon: Upload, path: '/upload' },
    { name: 'Results', icon: FileText, path: '/results' },
    { name: 'Analytics', icon: BarChart2, path: '/analytics' },
  ];

  const bottomItems = [
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white border-r border-secondary-200 transition-all duration-300 ease-in-out flex flex-col",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-4 border-b border-secondary-100">
        <div className="flex items-center gap-3 text-primary-600">
          <div className="p-2 bg-primary-50 rounded-lg">
            <GraduationCap className="h-6 w-6" />
          </div>
          {isOpen && (
            <span className="font-display font-bold text-xl tracking-tight text-secondary-900">
              EduScore AI
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-primary-50 text-primary-700 font-medium" 
                  : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 shrink-0 transition-colors",
                isActive ? "text-primary-600" : "text-secondary-400 group-hover:text-secondary-600"
              )} />
              {isOpen && <span>{item.name}</span>}
              {!isOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-secondary-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-secondary-100 space-y-1">
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
              isActive 
                ? "bg-primary-50 text-primary-700 font-medium" 
                : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0 text-secondary-400 group-hover:text-secondary-600" />
            {isOpen && <span>{item.name}</span>}
          </NavLink>
        ))}
        
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
          onClick={() => console.log("Logout")}
        >
          <LogOut className="h-5 w-5 shrink-0 text-secondary-400 group-hover:text-red-500" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 bg-white border border-secondary-200 text-secondary-500 rounded-full p-1 shadow-sm hover:text-primary-600 hover:border-primary-200 transition-colors"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </aside>
  );
};

export default Sidebar;
