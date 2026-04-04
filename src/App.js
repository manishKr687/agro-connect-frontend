import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import './App.css';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AgentDashboard from './pages/AgentDashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import ForgotPassword from './pages/ForgotPassword';
import HomeModern from './pages/HomeModern';
import Login from './pages/Login';
import Logout from './pages/Logout';
import PublicDemandDashboard from './pages/PublicDemandDashboard';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import RetailerDashboard from './pages/RetailerDashboard';
import axiosInstance from './api/axiosConfig';
import ErrorBoundary from './components/ErrorBoundary';
import {
  clearSession,
  getSession,
  roleHomePath,
  saveSession,
} from './utils/session';

export function PrivateRoute({ children, role }) {
  const session = getSession();

  if (!session.userId) {
    return <Navigate to="/login" replace />;
  }

  if (role && session.role !== role) {
    return <Navigate to={roleHomePath(session.role, 'dashboard')} replace />;
  }

  return children;
}

export function SessionRedirect() {
  const session = getSession();

  if (!session.userId || !session.role) {
    clearSession();
    return <Navigate to="/" replace />;
  }

  return <Navigate to={roleHomePath(session.role, 'dashboard')} replace />;
}

function App() {
  const [authReady, setAuthReady] = React.useState(false);

  const bootstrapSession = React.useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/users/me');
      saveSession(response.data);
    } catch (error) {
      clearSession();
    } finally {
      setAuthReady(true);
    }
  }, []);

  React.useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  if (!authReady) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeModern />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Legacy role-specific routes — redirect to unified pages */}
        <Route path="/farmer/login" element={<Navigate to="/login" replace />} />
        <Route path="/farmer/register" element={<Navigate to="/register" replace />} />
        <Route path="/retailer/login" element={<Navigate to="/login" replace />} />
        <Route path="/retailer/register" element={<Navigate to="/register" replace />} />
        <Route path="/agent/login" element={<Navigate to="/login" replace />} />

        <Route
          path="/farmer/dashboard"
          element={(
            <PrivateRoute role="FARMER">
              <FarmerDashboard />
            </PrivateRoute>
          )}
        />

        <Route
          path="/retailer/dashboard"
          element={(
            <PrivateRoute role="RETAILER">
              <RetailerDashboard />
            </PrivateRoute>
          )}
        />

        <Route
          path="/agent/dashboard"
          element={(
            <PrivateRoute role="AGENT">
              <AgentDashboard />
            </PrivateRoute>
          )}
        />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={(
            <PrivateRoute role="ADMIN">
              <AdminDashboard />
            </PrivateRoute>
          )}
        />

        <Route path="/market" element={<PublicDemandDashboard />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/dashboard" element={<SessionRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
