import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, Activity } from 'lucide-react';
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
    const interval = setInterval(checkHealth, 60000); // Check every 60s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
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
      <div className="flex items-center gap-4">
        {/* System Health Indicator */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            title={statusLabel}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${dotColor} ${health?.overall === 'healthy' ? '' : 'animate-pulse'}`} />
            <Activity className="h-4 w-4 text-gray-500" />
          </button>

          {showDropdown && health && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-3 z-50">
              <div className="px-4 pb-2 mb-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">System Status</p>
                <p className={`text-sm font-medium mt-0.5 ${health.overall === 'healthy' ? 'text-emerald-600' : health.overall === 'degraded' ? 'text-amber-600' : 'text-red-600'}`}>
                  {statusLabel}
                </p>
              </div>
              {health.services.map((s, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-1.5">
                  <span className="text-sm text-gray-700">{s.name}</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.status === 'online' ? 'text-emerald-600'
                      : s.status === 'rate_limited' ? 'text-amber-600'
                        : 'text-red-500'
                    }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.status === 'online' ? 'bg-emerald-500'
                        : s.status === 'rate_limited' ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`} />
                    {s.status === 'online' ? 'Online' : s.status === 'rate_limited' ? 'Rate Limited' : 'Offline'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors">
          <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          <Bell className="h-6 w-6" />
        </button>

        <div className="h-8 w-px bg-gray-200" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">
              {user?.role === 'teacher' ? 'Educator' : user?.role === 'admin' ? 'Administrator' : 'Student'}
            </p>
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
