import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAssignments } from '@/services/mockApi';
import { formatDate, getScoreColor, getStatusBgColor } from '@/utils/helpers';
import { FiArrowLeft, FiDownload, FiEye, FiSearch, FiFilter } from 'react-icons/fi';

const History: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredAssignments = mockAssignments.filter((assignment) => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          assignment.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownload = (id: string) => {
    // Simulate PDF download
    const blob = new Blob(['Mock PDF Report Content'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EduScore_Report_${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <FiArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Submission History</h1>
          <p className="text-muted-foreground">View all your past submissions and reports</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignments..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground input-focus"
          />
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-border bg-card text-foreground input-focus"
          >
            <option value="all">All Status</option>
            <option value="evaluated">Evaluated</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Assignment
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Subject
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Score
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAssignments.map((assignment) => (
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
                        {assignment.score}/{assignment.maxMarks}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBgColor(assignment.status)} ${
                        assignment.status === 'evaluated' ? 'text-success' : 'text-warning'
                      }`}
                    >
                      {assignment.status === 'evaluated' ? 'Evaluated' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {assignment.status === 'evaluated' && (
                        <>
                          <button
                            onClick={() => navigate('/results')}
                            className="p-2 rounded-lg hover:bg-muted transition-colors group"
                            title="View Report"
                          >
                            <FiEye className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                          </button>
                          <button
                            onClick={() => handleDownload(assignment.id)}
                            className="p-2 rounded-lg hover:bg-muted transition-colors group"
                            title="Download PDF"
                          >
                            <FiDownload className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssignments.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No assignments found</p>
          </div>
        )}
      </div>

      {/* Pagination (static for now) */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAssignments.length} of {mockAssignments.length} submissions
        </p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default History;
