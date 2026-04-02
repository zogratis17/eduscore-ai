import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, Activity, Command } from 'lucide-react';
import api from '../../services/api';

const Header = () => {
  const { user } = useAuth();
  const [health, setHealth] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get('/health/status');
        setHealth(res.data);
      } catch {
        setHealth({ overall: 'unhealthy', services: [] });
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const dotColor = !health
    ? 'bg-gray-400'
    : health.overall === 'healthy'
      ? 'bg-emerald-500'
      : health.overall === 'degraded'
        ? 'bg-amber-500'
        : 'bg-red-500';

  const statusLabel = !health
    ? 'Checking...'
    : health.overall === 'healthy'
      ? 'All Systems Online'
      : health.overall === 'degraded'
        ? 'Partially Degraded'
        : 'Systems Offline';

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Search Bar */}
      <div className="flex-1 max-w-lg">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-16 py-2 border border-gray-200/80 rounded-xl leading-5 bg-surface-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 text-sm transition-all duration-200"
            placeholder="Search documents, students, or results..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 border border-gray-200/80 rounded-md">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* System Health Indicator */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm"
            title={statusLabel}
          >
            <span className="relative flex h-2.5 w-2.5">
              {health?.overall === 'healthy' ? null : (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-40`} />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColor}`} />
            </span>
            <Activity className="h-4 w-4 text-gray-400" />
          </button>

          {showDropdown && health && (
            <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-float border border-gray-200/60 py-3 z-50 animate-fade-in">
              <div className="px-4 pb-3 mb-2 border-b border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">System Status</p>
                <p className={`text-sm font-semibold ${health.overall === 'healthy' ? 'text-emerald-600' : health.overall === 'degraded' ? 'text-amber-600' : 'text-red-600'}`}>
                  {statusLabel}
                </p>
              </div>
              <div className="space-y-0.5 px-2">
                {health.services.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-sm text-gray-700">{s.name}</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                      s.status === 'online' ? 'bg-emerald-50 text-emerald-700'
                        : s.status === 'rate_limited' ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-600'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        s.status === 'online' ? 'bg-emerald-500'
                          : s.status === 'rate_limited' ? 'bg-amber-500'
                            : 'bg-red-500'
                      }`} />
                      {s.status === 'online' ? 'Online' : s.status === 'rate_limited' ? 'Rate Limited' : 'Offline'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button className="relative p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200">
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          <Bell className="h-5 w-5" />
        </button>

        <div className="h-6 w-px bg-gray-200 mx-1" />

        {/* User Avatar */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name || user?.email}</p>
            <p className="text-[11px] text-gray-400 font-medium">
              {user?.role === 'teacher' ? 'Educator' : user?.role === 'admin' ? 'Administrator' : 'Student'}
            </p>
          </div>
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white ring-2 ring-white shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
