import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ActiveCandidateProvider } from './hooks/useActiveCandidate';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import JobExplorer from './pages/JobExplorer';
import JobMatch from './pages/JobMatch';
import GraphExplorer from './pages/GraphExplorer';
import Skills from './pages/Skills';

// A simple mock Settings page to complete sidebar navigation paths
const SettingsPage: React.FC = () => (
  <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-6">
    <h1 className="text-2xl font-extrabold text-white tracking-tight">Settings</h1>
    <div className="glass-card p-6 rounded-2xl border border-border">
      <p className="text-sm text-zinc-400">Settings panel details. In-scope configurations include local DB credential storage.</p>
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <ActiveCandidateProvider>
      <Router>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<JobExplorer />} />
            <Route path="/jobs/:id" element={<JobMatch />} />
            <Route path="/graph" element={<GraphExplorer />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* Fallback to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DashboardLayout>
      </Router>
    </ActiveCandidateProvider>
  );
};
export default App;
