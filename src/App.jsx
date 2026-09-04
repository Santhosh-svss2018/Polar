import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TelemetryProvider } from './context/TelemetryContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Simulation from './pages/Simulation';
import Prediction from './pages/Prediction';
import Optimization from './pages/Optimization';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import DataManagement from './pages/DataManagement';
import Settings from './pages/Settings';
import OperatorManagement from './pages/admin/OperatorManagement';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <TelemetryProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Login Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Application Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="prediction" element={<Prediction />} />
                <Route path="optimization" element={<Optimization />} />
                <Route path="alerts" element={<Alerts />} />
                <Route path="simulation" element={<Simulation />} />
                <Route path="reports" element={<Reports />} />
                <Route path="data" element={<DataManagement />} />
                <Route path="settings" element={<Settings />} />

                {/* Admin-Only Route */}
                <Route
                  path="admin/operators"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <OperatorManagement />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </TelemetryProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
