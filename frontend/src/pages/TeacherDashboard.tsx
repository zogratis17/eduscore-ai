import React from 'react';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/common/StatCard';
import { mockStudents, mockAssignments } from '@/services/mockApi';
import { FiUsers, FiFileText, FiTrendingUp, FiClock, FiArrowRight } from 'react-icons/fi';
import { formatDate, getScoreColor } from '@/utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const subjectData = [
  { name: 'Math', submissions: 45 },
  { name: 'Physics', submissions: 38 },
  { name: 'Chemistry', submissions: 32 },
  { name: 'English', submissions: 28 },
  { name: 'History', submissions: 22 },
];

const scoreDistribution = [
  { name: '90-100', value: 25, color: 'hsl(var(--success))' },
  { name: '80-89', value: 35, color: 'hsl(var(--primary))' },
  { name: '70-79', value: 25, color: 'hsl(var(--warning))' },
  { name: 'Below 70', value: 15, color: 'hsl(var(--destructive))' },
];

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();

  const totalStudents = mockStudents.length;
  const totalAssignments = mockAssignments.filter(a => a.status === 'evaluated').length;
  const avgClassScore = Math.round(
    mockStudents.reduce((acc, s) => acc + s.avgScore, 0) / mockStudents.length
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Good morning, {user?.name?.split(' ')[0]}! 📚
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your students today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={FiUsers}
          subtitle="Active students"
          accentColor="primary"
        />
        <StatCard
          title="Assignments Evaluated"
          value={totalAssignments}
          icon={FiFileText}
          trend={{ value: 12, isPositive: true }}
          accentColor="success"
        />
        <StatCard
          title="Class Average"
          value={`${avgClassScore}%`}
          icon={FiTrendingUp}
          trend={{ value: 3, isPositive: true }}
          accentColor="accent"
        />
        <StatCard
          title="Pending Reviews"
          value={mockAssignments.filter(a => a.status === 'pending').length}
          icon={FiClock}
          subtitle="Awaiting evaluation"
          accentColor="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions by Subject */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Submissions by Subject</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="submissions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Score Distribution</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={scoreDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {scoreDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                  <span className="ml-auto text-sm font-medium text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Recent Student Submissions</h3>
          <button className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View All
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Student
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Assignment
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Subject
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Submitted
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Score
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Plagiarism
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockAssignments.slice(0, 5).map((assignment, idx) => (
                <tr key={assignment.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-medium text-primary-foreground">
                        {mockStudents[idx % mockStudents.length].name.charAt(0)}
                      </div>
                      <span className="font-medium text-foreground">
                        {mockStudents[idx % mockStudents.length].name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {assignment.title}
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
                      <span className="text-muted-foreground">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {assignment.plagiarism !== null ? (
                      <span className={`text-sm ${assignment.plagiarism > 10 ? 'text-destructive' : 'text-success'}`}>
                        {assignment.plagiarism}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
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

export default TeacherDashboard;
