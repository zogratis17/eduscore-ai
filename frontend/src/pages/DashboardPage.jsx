import React from 'react';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';

// Mock Data
const stats = [
  { 
    title: 'Total Evaluated', 
    value: '1,248', 
    change: '+12%', 
    trend: 'up',
    icon: FileText,
    color: 'bg-blue-500'
  },
  { 
    title: 'Average Score', 
    value: '76.4', 
    change: '+2.1%', 
    trend: 'up',
    icon: CheckCircle,
    color: 'bg-green-500'
  },
  { 
    title: 'Hours Saved', 
    value: '312', 
    change: '+45h', 
    trend: 'up',
    icon: Clock,
    color: 'bg-purple-500'
  },
  { 
    title: 'Pending Review', 
    value: '14', 
    change: '-5', 
    trend: 'down',
    icon: TrendingUp,
    color: 'bg-orange-500'
  },
];

const chartData = [
  { name: 'Mon', score: 65 },
  { name: 'Tue', score: 72 },
  { name: 'Wed', score: 68 },
  { name: 'Thu', score: 85 },
  { name: 'Fri', score: 78 },
  { name: 'Sat', score: 90 },
  { name: 'Sun', score: 82 },
];

const recentSubmissions = [
  { id: 1, student: 'Alice Johnson', subject: 'History Essay', score: 88, status: 'Completed', time: '2h ago' },
  { id: 2, student: 'Bob Smith', subject: 'Physics Report', score: 72, status: 'Completed', time: '4h ago' },
  { id: 3, student: 'Charlie Brown', subject: 'Literature Review', score: 0, status: 'Processing', time: '5m ago' },
  { id: 4, student: 'Diana Prince', subject: 'Economics 101', score: 94, status: 'Completed', time: '1d ago' },
  { id: 5, student: 'Evan Wright', subject: 'Chemistry Lab', score: 0, status: 'Pending', time: '1d ago' },
];

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Dashboard Overview</h1>
          <p className="text-secondary-500 mt-1">Welcome back, Prof. Rajesh. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">Download Report</Button>
          <Button size="sm">New Evaluation</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-opacity-10 ${stat.color} bg-current text-current`}>
                  <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                {stat.trend === 'up' ? (
                  <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-medium">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {stat.change}
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-medium">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    {stat.change}
                  </div>
                )}
              </div>
              <h3 className="text-secondary-500 text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold text-secondary-900 mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Evaluation Trends</CardTitle>
            <select className="bg-secondary-50 border border-secondary-200 text-sm rounded-md px-2 py-1 focus:outline-none">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    cursor={{stroke: '#3b82f6', strokeWidth: 1}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-secondary-100">
              {recentSubmissions.map((item) => (
                <div key={item.id} className="p-4 hover:bg-secondary-50 transition-colors flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600 font-medium text-sm">
                      {item.student.charAt(0)}{item.student.split(' ')[1].charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-900">{item.student}</p>
                      <p className="text-xs text-secondary-500">{item.subject}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {item.status === 'Completed' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {item.score}%
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    )}
                    <p className="text-xs text-secondary-400 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-secondary-100">
              <Button variant="ghost" size="sm" className="w-full text-primary-600">View All Submissions</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
