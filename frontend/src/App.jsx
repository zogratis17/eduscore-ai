import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import DocumentsPage from './pages/DocumentsPage';
import ResultsPage from './pages/ResultsPage';
import RubricManagerPage from './pages/RubricManagerPage';
import NotFoundPage from './pages/NotFoundPage';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

const ProtectedRoute = ({ layout: Layout }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // If a Layout is provided, wrap the Outlet. Otherwise just render Outlet.
  if (Layout) {
    return <Layout><Outlet /></Layout>;
  }
  return <Outlet />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Legacy Dashboard Routes (Use DashboardLayout) */}
          <Route element={<ProtectedRoute layout={DashboardLayout} />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/rubrics" element={<RubricManagerPage />} />
            <Route path="/results" element={<DocumentsPage />} />
            <Route path="/results/:id" element={<ResultsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
