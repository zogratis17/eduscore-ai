import axios from 'axios';

// Create axios instance with mock configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

// Mock data
export const mockAssignments = [
  { id: '1', title: 'Physics Lab Report', subject: 'Physics', score: 85, maxMarks: 100, status: 'evaluated', date: '2024-01-15', plagiarism: 5 },
  { id: '2', title: 'Literature Essay', subject: 'English', score: 92, maxMarks: 100, status: 'evaluated', date: '2024-01-14', plagiarism: 2 },
  { id: '3', title: 'Calculus Homework', subject: 'Mathematics', score: 78, maxMarks: 100, status: 'evaluated', date: '2024-01-12', plagiarism: 0 },
  { id: '4', title: 'History Analysis', subject: 'History', score: null, maxMarks: 100, status: 'pending', date: '2024-01-16', plagiarism: null },
  { id: '5', title: 'Chemistry Equations', subject: 'Chemistry', score: 88, maxMarks: 100, status: 'evaluated', date: '2024-01-10', plagiarism: 3 },
];

export const mockStudents = [
  { id: '1', name: 'Alex Johnson', email: 'alex@edu.com', avgScore: 85, submissions: 12 },
  { id: '2', name: 'Emma Wilson', email: 'emma@edu.com', avgScore: 92, submissions: 15 },
  { id: '3', name: 'Michael Brown', email: 'michael@edu.com', avgScore: 78, submissions: 10 },
  { id: '4', name: 'Sarah Davis', email: 'sarah@edu.com', avgScore: 88, submissions: 14 },
  { id: '5', name: 'James Miller', email: 'james@edu.com', avgScore: 75, submissions: 8 },
];

export const mockTeachers = [
  { id: '1', name: 'Dr. Sarah Williams', email: 'sarah.w@edu.com', subject: 'Physics', students: 45 },
  { id: '2', name: 'Prof. John Smith', email: 'john.s@edu.com', subject: 'Mathematics', students: 52 },
  { id: '3', name: 'Dr. Emily Chen', email: 'emily.c@edu.com', subject: 'Chemistry', students: 38 },
];

export const mockActivityLogs = [
  { id: '1', action: 'Assignment Submitted', user: 'Alex Johnson', time: '2 minutes ago', type: 'submission' },
  { id: '2', action: 'New User Registered', user: 'Emma Wilson', time: '15 minutes ago', type: 'registration' },
  { id: '3', action: 'Grade Updated', user: 'Dr. Sarah Williams', time: '1 hour ago', type: 'grade' },
  { id: '4', action: 'Report Downloaded', user: 'Michael Brown', time: '2 hours ago', type: 'download' },
  { id: '5', action: 'Assignment Evaluated', user: 'AI System', time: '3 hours ago', type: 'evaluation' },
];

export const mockAIResults = {
  totalScore: 85,
  maxMarks: 100,
  grammarScore: 90,
  relevanceScore: 82,
  clarityScore: 88,
  plagiarismPercentage: 5,
  strengths: ['Clear argument structure', 'Good use of citations', 'Comprehensive analysis'],
  weaknesses: ['Minor grammatical errors', 'Could expand on conclusion'],
  feedback: 'Your assignment demonstrates a strong understanding of the topic. The analysis is thorough and well-researched. Consider expanding your conclusion to reinforce key points.',
  suggestions: [
    'Review subject-verb agreement in paragraphs 3 and 5',
    'Add more supporting evidence for the main thesis',
    'Consider including counterarguments for a more balanced perspective',
  ],
  highlightedMistakes: [
    { text: 'their was', correction: 'there was', type: 'grammar' },
    { text: 'affect vs effect', correction: 'effect', type: 'vocabulary' },
  ],
};

export const mockSubjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Computer Science',
];

export const mockSystemHealth = {
  serverStatus: 'operational',
  aiEngineStatus: 'operational',
  databaseStatus: 'operational',
  storageUsed: 68,
  activeUsers: 1234,
  evaluationsToday: 567,
};

// Mock API functions
export const uploadAssignment = async (file: File, subject: string, maxMarks: number): Promise<{ success: boolean; id: string }> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    id: Math.random().toString(36).substr(2, 9),
  };
};

export const getAssignments = async (): Promise<typeof mockAssignments> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockAssignments;
};

export const getStudents = async (): Promise<typeof mockStudents> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockStudents;
};

export const getAIResults = async (assignmentId: string): Promise<typeof mockAIResults> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockAIResults;
};

export const downloadReport = async (assignmentId: string): Promise<Blob> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Return a mock PDF blob
  return new Blob(['Mock PDF Content'], { type: 'application/pdf' });
};

export default api;
