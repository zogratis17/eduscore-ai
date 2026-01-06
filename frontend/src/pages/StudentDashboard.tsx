import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/common/StatCard';
import { mockAssignments } from '@/services/mockApi';
import { FiFileText, FiTrendingUp, FiClock, FiUpload, FiArrowRight } from 'react-icons/fi';
import { formatDate, getScoreColor } from '@/utils/helpers';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const scoreData = [
  { name: 'Week 1', score: 75 },
  { name: 'Week 2', score: 82 },
  { name: 'Week 3', score: 78 },
  { name: 'Week 4', score: 85 },
  { name: 'Week 5', score: 88 },
  { name: 'Week 6', score: 92 },
];

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const evaluatedAssignments = mockAssignments.filter(a => a.status === 'evaluated');
  const avgScore = Math.round(
    evaluatedAssignments.reduce((acc, a) => acc + (a.score || 0), 0) / evaluatedAssignments.length
  );
  const recentAssignments = mockAssignments.slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your academic progress
          </p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 px-5 py-2.5 btn-primary-gradient rounded-lg font-medium"
        >
          <FiUpload className="w-4 h-4" />
          Upload Assignment
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Submissions"
          value={mockAssignments.length}
          icon={FiFileText}
          subtitle="All time"
          accentColor="primary"
        />
        <StatCard
          title="Average Score"
          value={`${avgScore}%`}
          icon={FiTrendingUp}
          trend={{ value: 5, isPositive: true }}
          accentColor="success"
        />
        <StatCard
          title="Pending Evaluations"
          value={mockAssignments.filter(a => a.status === 'pending').length}
          icon={FiClock}
          subtitle="In queue"
          accentColor="warning"
        />
        <StatCard
          title="This Month"
          value={3}
          icon={FiUpload}
          subtitle="Submissions"
          accentColor="accent"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Trend Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Score Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="url(#scoreGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Performance Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Highest Score</span>
              <span className="text-lg font-bold text-success">92%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Lowest Score</span>
              <span className="text-lg font-bold text-warning">75%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Improvement</span>
              <span className="text-lg font-bold text-success">+17%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Avg. Plagiarism</span>
              <span className="text-lg font-bold text-foreground">3%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Assignments */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Recent Evaluations</h3>
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View All
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Assignment
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Subject
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Score
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground">{assignment.title}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {assignment.subject}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(assignment.date)}
                  </td>
                  <td className="px-6 py-4">
                    {assignment.score !== null ? (
                      <span className={`font-semibold ${getScoreColor(assignment.score)}`}>
                        {assignment.score}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        assignment.status === 'evaluated'
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {assignment.status === 'evaluated' ? 'Evaluated' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
