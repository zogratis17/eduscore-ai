import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FiArrowLeft, FiUser, FiMail, FiShield, FiLock, FiSave, FiBell, FiGlobe } from 'react-icons/fi';
import Alert from '@/components/common/Alert';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [language, setLanguage] = useState('en');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Simulate password change
    setShowSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <FiArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>
      </div>

      {showSuccess && (
        <Alert type="success" message="Password updated successfully!" onClose={() => setShowSuccess(false)} />
      )}

      {/* Profile Info Card */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <FiUser className="w-5 h-5 text-primary" />
          Personal Information
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Full Name</label>
              <div className="flex items-center gap-3 mt-1 p-3 rounded-lg bg-muted/50">
                <FiUser className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{user?.name}</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Email Address</label>
              <div className="flex items-center gap-3 mt-1 p-3 rounded-lg bg-muted/50">
                <FiMail className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{user?.email}</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Role</label>
              <div className="flex items-center gap-3 mt-1 p-3 rounded-lg bg-muted/50">
                <FiShield className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <FiLock className="w-5 h-5 text-primary" />
          Change Password
        </h2>

        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground input-focus"
              placeholder="••••••••"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground input-focus"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground input-focus"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2.5 btn-primary-gradient rounded-lg font-medium"
          >
            <FiSave className="w-4 h-4" />
            Update Password
          </button>
        </form>
      </div>

      {/* Preferences */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <FiBell className="w-5 h-5 text-primary" />
          Preferences
        </h2>

        <div className="space-y-4">
          {/* Email Notifications */}
          {/* <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive email updates about your evaluations</p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                emailNotifications ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-card shadow-md transition-transform ${
                  emailNotifications ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div> */}

          {/* Push Notifications */}
         {/*  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium text-foreground">Push Notifications</p>
              <p className="text-sm text-muted-foreground">Get real-time alerts on your device</p>
            </div>
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                pushNotifications ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-card shadow-md transition-transform ${
                  pushNotifications ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div> */}

          {/* Language */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <FiGlobe className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Language</p>
                <p className="text-sm text-muted-foreground">Choose your preferred language</p>
              </div>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-card text-foreground"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>

      {/* Role-specific Settings */}
      {user?.role === 'teacher' && (
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Teacher Settings</h2>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="font-medium text-foreground mb-2">Default Grading Rubric</p>
            <p className="text-sm text-muted-foreground">Configure your default rubric for evaluations</p>
            <button className="mt-3 text-sm text-primary hover:underline">
              Configure Rubric →
            </button>
          </div>
        </div>
      )}

      {user?.role === 'admin' && (
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Admin Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-medium text-foreground mb-1">User Management</p>
              <p className="text-sm text-muted-foreground">Manage platform users</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-medium text-foreground mb-1">System Configuration</p>
              <p className="text-sm text-muted-foreground">Configure platform settings</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
