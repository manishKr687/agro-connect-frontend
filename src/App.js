import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import './App.css';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AgentDashboard from './pages/AgentDashboard';
import AgentLogin from './pages/AgentLogin';
import FarmerDashboard from './pages/FarmerDashboard';
import FarmerLogin from './pages/FarmerLogin';
import FarmerRegister from './pages/FarmerRegister';
import HomeModern from './pages/HomeModern';
import PublicDemandDashboard from './pages/PublicDemandDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import RetailerDashboard from './pages/RetailerDashboard';
import RetailerLogin from './pages/RetailerLogin';
import RetailerRegister from './pages/RetailerRegister';
import axiosInstance from './api/axiosConfig';
import {
  clearSession,
  getSession,
  roleHomePath,
  saveSession,
  subscribeToSessionChanges,
} from './utils/session';

function PrivateRoute({ children, role, session }) {
  if (!session.userId) {
    return <Navigate to={role ? roleHomePath(role, 'login') : '/'} replace />;
  }

  if (role && session.role !== role) {
    return <Navigate to={roleHomePath(session.role, 'dashboard')} replace />;
  }

  return children;
}

function SessionRedirect({ session }) {
  if (!session.userId || !session.role) {
    clearSession();
    return <Navigate to="/" replace />;
  }

  return <Navigate to={roleHomePath(session.role, 'dashboard')} replace />;
}

function App() {
  const [session, setSession] = React.useState(getSession());
  const [authReady, setAuthReady] = React.useState(false);

  const syncSession = React.useCallback(() => {
    setSession(getSession());
  }, []);

  const bootstrapSession = React.useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/users/me');
      saveSession(response.data);
      setSession(getSession());
    } catch (error) {
      clearSession();
      setSession(getSession());
    } finally {
      setAuthReady(true);
    }
  }, []);

  React.useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  React.useEffect(() => subscribeToSessionChanges(syncSession), [syncSession]);

  if (!authReady) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeModern session={session} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/farmer/login" element={<FarmerLogin />} />
        <Route path="/farmer/register" element={<FarmerRegister />} />
        <Route
          path="/farmer/dashboard"
          element={(
            <PrivateRoute role="FARMER" session={session}>
              <FarmerDashboard />
            </PrivateRoute>
          )}
        />

        <Route path="/retailer/login" element={<RetailerLogin />} />
        <Route path="/retailer/register" element={<RetailerRegister />} />
        <Route
          path="/retailer/dashboard"
          element={(
            <PrivateRoute role="RETAILER" session={session}>
              <RetailerDashboard />
            </PrivateRoute>
          )}
        />

        <Route path="/agent/login" element={<AgentLogin />} />
        <Route path="/agent/register" element={<Navigate to="/" replace />} />
        <Route
          path="/agent/dashboard"
          element={(
            <PrivateRoute role="AGENT" session={session}>
              <AgentDashboard />
            </PrivateRoute>
          )}
        />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<Navigate to="/" replace />} />
        <Route
          path="/admin/dashboard"
          element={(
            <PrivateRoute role="ADMIN" session={session}>
              <AdminDashboard />
            </PrivateRoute>
          )}
        />

        <Route path="/market" element={<PublicDemandDashboard />} />
        <Route path="/dashboard" element={<SessionRedirect session={session} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
