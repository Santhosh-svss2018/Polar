import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Prediction from './pages/Prediction';
import Optimization from './pages/Optimization';
import Alerts from './pages/Alerts';
import Simulation from './pages/Simulation';
import Reports from './pages/Reports';
import DataManagement from './pages/DataManagement';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Unauthenticated route */}
        <Route path="/login" element={<Login />} />

        {/* Protected layout routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="prediction" element={<Prediction />} />
          <Route path="optimization" element={<Optimization />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="simulation" element={<Simulation />} />
          <Route path="reports" element={<Reports />} />
          <Route path="data" element={<DataManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
