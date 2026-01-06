import React from 'react';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/common/StatCard';
import { mockStudents, mockTeachers, mockActivityLogs, mockSystemHealth } from '@/services/mockApi';
import { FiUsers, FiUserCheck, FiActivity, FiServer, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const userGrowthData = [
  { month: 'Jan', students: 120, teachers: 15 },
  { month: 'Feb', students: 180, teachers: 22 },
  { month: 'Mar', students: 250, teachers: 28 },
  { month: 'Apr', students: 320, teachers: 35 },
  { month: 'May', students: 410, teachers: 42 },
  { month: 'Jun', students: 520, teachers: 50 },
];

const activityData = [
  { time: '00:00', evaluations: 12 },
  { time: '04:00', evaluations: 8 },
  { time: '08:00', evaluations: 45 },
  { time: '12:00', evaluations: 78 },
  { time: '16:00', evaluations: 92 },
  { time: '20:00', evaluations: 56 },
];

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const totalUsers = mockStudents.length + mockTeachers.length;
  const { serverStatus, aiEngineStatus, databaseStatus, storageUsed, activeUsers, evaluationsToday } = mockSystemHealth;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <FiCheckCircle className="w-4 h-4 text-success" />;
      case 'degraded':
        return <FiAlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <FiAlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Admin Dashboard 🎛️
        </h1>
        <p className="text-muted-foreground mt-1">
          System overview and platform analytics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={FiUsers}
          trend={{ value: 15, isPositive: true }}
          accentColor="primary"
        />
        <StatCard
          title="Active Students"
          value={mockStudents.length}
          icon={FiUserCheck}
          subtitle="Currently enrolled"
          accentColor="success"
        />
        <StatCard
          title="Active Teachers"
          value={mockTeachers.length}
          icon={FiUserCheck}
          subtitle="Platform educators"
          accentColor="accent"
        />
        <StatCard
          title="Evaluations Today"
          value={evaluationsToday}
          icon={FiActivity}
          trend={{ value: 8, isPositive: true }}
          accentColor="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">User Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="students" name="Students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="teachers" name="Teachers" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evaluation Activity */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Evaluation Activity (24h)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="evaluations"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Health & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <FiServer className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">System Health</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">API Server</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(serverStatus)}
                <span className="text-sm font-medium text-success capitalize">{serverStatus}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">AI Engine</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(aiEngineStatus)}
                <span className="text-sm font-medium text-success capitalize">{aiEngineStatus}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Database</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(databaseStatus)}
                <span className="text-sm font-medium text-success capitalize">{databaseStatus}</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Storage Used</span>
                <span className="text-sm font-medium text-foreground">{storageUsed}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full gradient-primary rounded-full transition-all duration-500"
                  style={{ width: `${storageUsed}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="lg:col-span-2 bg-card rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <FiActivity className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {mockActivityLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  log.type === 'submission' ? 'bg-primary/10 text-primary' :
                  log.type === 'registration' ? 'bg-success/10 text-success' :
                  log.type === 'grade' ? 'bg-accent/10 text-accent' :
                  log.type === 'evaluation' ? 'bg-warning/10 text-warning' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {log.type === 'submission' ? <FiActivity className="w-4 h-4" /> :
                   log.type === 'registration' ? <FiUserCheck className="w-4 h-4" /> :
                   <FiClock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{log.action}</p>
                  <p className="text-xs text-muted-foreground">{log.user}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
