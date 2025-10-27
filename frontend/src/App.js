import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Login } from '@/pages/Auth/Login';
import { Register } from '@/pages/Auth/Register';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { Projects } from '@/pages/Projects/Projects';
import '@/App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return !user ? children : <Navigate to="/dashboard" />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Private Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <PrivateRoute>
            <MainLayout>
              <Projects />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <PrivateRoute>
            <MainLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold">Project Workspace</h2>
                <p className="text-slate-600 mt-2">Full project workspace with tabs coming soon...</p>
              </div>
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/milestones"
        element={
          <PrivateRoute>
            <MainLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold">Milestones</h2>
                <p className="text-slate-600 mt-2">Gantt chart view coming soon...</p>
              </div>
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/scope"
        element={
          <PrivateRoute>
            <MainLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold">Scope of Work</h2>
                <p className="text-slate-600 mt-2">Excel-like grid coming soon...</p>
              </div>
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/design"
        element={
          <PrivateRoute>
            <MainLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold">Design Deliverables</h2>
                <p className="text-slate-600 mt-2">Kanban board coming soon...</p>
              </div>
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/materials"
        element={
          <PrivateRoute>
            <MainLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold">Material Requests / POs</h2>
                <p className="text-slate-600 mt-2">Materials management coming soon...</p>
              </div>
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/issues"
        element={
          <PrivateRoute>
            <MainLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold">Issues & SLA</h2>
                <p className="text-slate-600 mt-2">Issues tracking coming soon...</p>
              </div>
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/timesheets"
        element={
          <PrivateRoute>
            <MainLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold">Timesheets</h2>
                <p className="text-slate-600 mt-2">Timesheet management coming soon...</p>
              </div>
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <PrivateRoute>
            <MainLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold">Documents</h2>
                <p className="text-slate-600 mt-2">Document management coming soon...</p>
              </div>
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <MainLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold">Reports</h2>
                <p className="text-slate-600 mt-2">Advanced reports coming soon...</p>
              </div>
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <MainLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold">Admin / Templates</h2>
                <p className="text-slate-600 mt-2">Admin settings coming soon...</p>
              </div>
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
