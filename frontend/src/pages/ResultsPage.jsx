import React from 'react';
import { Search, Filter, MoreHorizontal, FileText } from 'lucide-react';
import { Card, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const ResultsPage = () => {
  const documents = [
    { id: 1, name: 'History_Essay_Final.pdf', student: 'Alice Johnson', date: 'Jan 7, 2026', score: 88, status: 'completed', grade: 'A' },
    { id: 2, name: 'Physics_Lab_Report_3.docx', student: 'Bob Smith', date: 'Jan 7, 2026', score: 72, status: 'completed', grade: 'B' },
    { id: 3, name: 'Literature_Review_Draft.pdf', student: 'Charlie Brown', date: 'Jan 6, 2026', score: 0, status: 'processing', grade: '-' },
    { id: 4, name: 'Economics_101_Midterm.pdf', student: 'Diana Prince', date: 'Jan 6, 2026', score: 94, status: 'completed', grade: 'A+' },
    { id: 5, name: 'Chemistry_Research.docx', student: 'Evan Wright', date: 'Jan 5, 2026', score: 45, status: 'flagged', grade: 'F' },
    { id: 6, name: 'Biology_Assignment.pdf', student: 'Fiona Gallagher', date: 'Jan 5, 2026', score: 81, status: 'completed', grade: 'A-' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'flagged': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-primary-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Evaluation Results</h1>
          <p className="text-secondary-500 mt-1">View and manage assessed documents.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Export All</Button>
          <Button>Batch Evaluation</Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
              <Input placeholder="Search by document or student..." className="pl-10" />
            </div>
            <div className="flex gap-4">
              <select className="h-10 rounded-lg border border-secondary-200 bg-white px-3 text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                <option>All Statuses</option>
                <option>Completed</option>
                <option>Processing</option>
                <option>Flagged</option>
              </select>
              <select className="h-10 rounded-lg border border-secondary-200 bg-white px-3 text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                <option>Newest First</option>
                <option>Oldest First</option>
                <option>Highest Score</option>
                <option>Lowest Score</option>
              </select>
              <Button variant="secondary" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-secondary-500 uppercase bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-6 py-4 font-medium">Document Name</th>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="bg-white hover:bg-secondary-50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-primary-50 flex items-center justify-center text-primary-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-secondary-900">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary-600">{doc.student}</td>
                  <td className="px-6 py-4 text-secondary-500">{doc.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {doc.status === 'completed' || doc.status === 'flagged' ? (
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-base ${getScoreColor(doc.score)}`}>{doc.score}</span>
                        <span className="text-xs text-secondary-400 bg-secondary-100 px-1.5 py-0.5 rounded">Grade {doc.grade}</span>
                      </div>
                    ) : (
                      <span className="text-secondary-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-secondary-400 hover:text-secondary-600 p-1 rounded hover:bg-secondary-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-secondary-200 flex items-center justify-between">
          <p className="text-sm text-secondary-500">Showing 1 to 6 of 124 results</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled>Previous</Button>
            <Button variant="secondary" size="sm">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResultsPage;
