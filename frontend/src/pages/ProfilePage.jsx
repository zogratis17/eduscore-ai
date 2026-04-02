import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Award, Clock, FileText } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  
  // Try to cleanly get user's display name or email prefix
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Teacher';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="text-center sm:text-left mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">Your Profile</h1>
        <p className="mt-2 text-base text-gray-500 font-medium">
          Manage your account settings and view your lifetime grading stats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Details Card */}
        <div className="md:col-span-1">
          <div className="glass bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center h-full relative overflow-hidden">
            <div className="absolute top-0 w-full h-32 bg-gradient-to-br from-primary-500 to-violet-600 opacity-90"></div>
            
            <div className="relative mt-12 bg-white p-2 rounded-full shadow-lg border border-gray-50">
              <div className="bg-primary-50 w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow-inner">
                <User className="h-10 w-10 text-primary-500" />
              </div>
            </div>
            
            <h2 className="mt-5 text-2xl font-bold text-gray-900 tracking-tight">{displayName}</h2>
            <div className="flex items-center gap-2 mt-2 text-gray-500 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100 shadow-sm">
              <Mail className="h-4 w-4" />
              <span className="text-sm font-medium">{user?.email || 'No email attached'}</span>
            </div>
            
            <div className="mt-8 w-full border-t border-gray-100 pt-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div> Active Educator
              </span>
              <p className="text-xs text-gray-400 mt-3 font-medium">UID: {user?.uid?.substring(0, 12)}...</p>
            </div>
          </div>
        </div>

        {/* Stats & Activity */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="glass bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Evaluated</p>
                  <p className="text-3xl font-extrabold text-gray-900">42</p>
                </div>
              </div>
            </div>
            
            <div className="glass bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-orange-50 text-orange-600 rounded-xl">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Avg Class Score</p>
                  <p className="text-3xl font-extrabold text-gray-900">B+</p>
                </div>
              </div>
            </div>

            <div className="glass bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Time Saved</p>
                  <p className="text-3xl font-extrabold text-gray-900">14<span className="text-lg font-medium text-gray-500 ml-1">hrs</span></p>
                </div>
              </div>
            </div>

            <div className="glass bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Plan</p>
                  <p className="text-3xl font-extrabold text-gray-900">Free</p>
                </div>
              </div>
            </div>

          </div>

          <div className="glass bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Recent Activity Map</h3>
            <div className="h-32 bg-gray-50 border border-gray-100 flex items-center justify-center rounded-xl text-gray-400 font-medium text-sm border-dashed">
              Activity graph implementation goes here.
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ProfilePage;
