import React, { useState } from 'react';
import { Save, Bell, Shield, Moon, Monitor, LayoutDashboard } from 'lucide-react';

const SettingsPage = () => {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [darkMode, setDarkMode] = useState('system');
  const [defaultGradeMode, setDefaultGradeMode] = useState('suggested');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="text-center sm:text-left mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">App Settings</h1>
        <p className="mt-2 text-base text-gray-500 font-medium">
          Customize your EduScore grading environment and preferences.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* General Preferences */}
        <div className="glass bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-50 rounded-xl">
              <LayoutDashboard className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Grading Preferences</h2>
          </div>
          
          <div className="space-y-5 ml-2 md:ml-12 border-t border-gray-100 pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Default Grading Mode</h3>
                <p className="text-xs text-gray-500 mt-1">Choose which mode is selected by default on the Upload page.</p>
              </div>
              <select 
                value={defaultGradeMode}
                onChange={(e) => setDefaultGradeMode(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 shadow-sm"
              >
                <option value="suggested">Suggested Scoring (Manual lock)</option>
                <option value="auto">AI Auto-Grading (Instant lock)</option>
              </select>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-100 pt-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Strict AI Penalty</h3>
                <p className="text-xs text-gray-500 mt-1">Automatically fail documents if AI probability exceeds 90%.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="glass bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Monitor className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Appearance</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ml-2 md:ml-12 border-t border-gray-100 pt-5">
            <button 
              onClick={() => setDarkMode('light')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-colors ${darkMode === 'light' ? 'border-primary-500 bg-primary-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">☀️</div>
              <span className="text-sm font-semibold text-gray-700">Light Mode</span>
            </button>
            
            <button 
              onClick={() => setDarkMode('dark')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-colors ${darkMode === 'dark' ? 'border-primary-500 bg-primary-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center"><Moon className="h-5 w-5 text-gray-300" /></div>
              <span className="text-sm font-semibold text-gray-700">Dark Mode</span>
            </button>
            
            <button 
              onClick={() => setDarkMode('system')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-colors ${darkMode === 'system' ? 'border-primary-500 bg-primary-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex flex-col items-center justify-center space-y-1">
                <div className="w-4 h-1 bg-gray-400 rounded"></div>
                <div className="w-6 h-1 bg-gray-400 rounded"></div>
              </div>
              <span className="text-sm font-semibold text-gray-700">System</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-50 rounded-xl">
              <Bell className="h-6 w-6 text-rose-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Notifications</h2>
          </div>
          
          <div className="space-y-5 ml-2 md:ml-12 border-t border-gray-100 pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Email Grading Reports</h3>
                <p className="text-xs text-gray-500 mt-1">Receive an email digest when a large batch of documents finishes evaluation.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500 shadow-inner"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Action Bar */}
        <div className="flex justify-end pt-4">
          <button className="flex items-center px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 shadow-sm transition-colors">
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
