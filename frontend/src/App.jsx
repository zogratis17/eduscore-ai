import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';

// Placeholder pages for routes not yet implemented
const PlaceholderPage = ({ title }) => (
  <div className="p-10 text-center">
    <h1 className="text-3xl font-bold text-secondary-300 mb-4">{title}</h1>
    <p className="text-secondary-400">This page is under construction.</p>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="analytics" element={<PlaceholderPage title="Analytics & Reports" />} />
        <Route path="settings" element={<PlaceholderPage title="Settings" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;