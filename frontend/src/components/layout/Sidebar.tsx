import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  FiHome,
  FiUpload,
  FiFileText,
  FiBarChart2,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiUser,
  FiActivity,
  FiBook,
  FiAward,
  FiCpu,
} from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const studentLinks = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/upload', icon: FiUpload, label: 'Upload Assignment' },
    { to: '/results', icon: FiBarChart2, label: 'Results' },
    { to: '/history', icon: FiFileText, label: 'Submission History' },
    { to: '/profile', icon: FiUser, label: 'Profile' },
  ];

  const teacherLinks = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/students', icon: FiUsers, label: 'Students' },
    { to: '/assignments', icon: FiBook, label: 'Assignments' },
    { to: '/analytics', icon: FiBarChart2, label: 'Analytics' },
    { to: '/profile', icon: FiUser, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/users', icon: FiUsers, label: 'Users' },
    { to: '/analytics', icon: FiBarChart2, label: 'Analytics' },
    { to: '/activity', icon: FiActivity, label: 'Activity Logs' },
    { to: '/system', icon: FiCpu, label: 'System Health' },
    { to: '/profile', icon: FiUser, label: 'Profile' },
  ];

  const getLinks = () => {
    switch (user?.role) {
      case 'teacher':
        return teacherLinks;
      case 'admin':
        return adminLinks;
      default:
        return studentLinks;
    }
  };

  const links = getLinks();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === `/${user?.role}`;
    }
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 sidebar-gradient transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <FiAward className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-sidebar-foreground">EduScore</h1>
              <p className="text-xs text-sidebar-foreground/60">AI-Powered Grading</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-thin">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => onClose()}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? '' : 'opacity-70'}`} />
                  <span>{link.label}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary-foreground animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="px-4 py-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-sidebar-accent/50">
              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-sm font-medium text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">
                  {user?.role || 'Student'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 mt-2 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              <FiLogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
