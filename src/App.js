import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AgentDashboard from './pages/AgentDashboard';
import AgentLogin from './pages/AgentLogin';
import AgentRegister from './pages/AgentRegister';
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
import { clearSession, getSession, roleHomePath } from './utils/session';

function PrivateRoute({ children, role }) {
  const session = getSession();

  if (!session.token || !session.userId) {
    return <Navigate to={role ? roleHomePath(role, 'login') : '/'} replace />;
  }

  if (role && session.role !== role) {
    return <Navigate to={roleHomePath(session.role, 'dashboard')} replace />;
  }

  return children;
}

function SessionRedirect() {
  const session = getSession();

  if (!session.token || !session.role) {
    clearSession();
    return <Navigate to="/" replace />;
  }

  return <Navigate to={roleHomePath(session.role, 'dashboard')} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeModern />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/farmer/login" element={<FarmerLogin />} />
        <Route path="/farmer/register" element={<FarmerRegister />} />
        <Route
          path="/farmer/dashboard"
          element={(
            <PrivateRoute role="FARMER">
              <FarmerDashboard />
            </PrivateRoute>
          )}
        />

        <Route path="/retailer/login" element={<RetailerLogin />} />
        <Route path="/retailer/register" element={<RetailerRegister />} />
        <Route
          path="/retailer/dashboard"
          element={(
            <PrivateRoute role="RETAILER">
              <RetailerDashboard />
            </PrivateRoute>
          )}
        />

        <Route path="/agent/login" element={<AgentLogin />} />
        <Route path="/agent/register" element={<AgentRegister />} />
        <Route
          path="/agent/dashboard"
          element={(
            <PrivateRoute role="AGENT">
              <AgentDashboard />
            </PrivateRoute>
          )}
        />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route
          path="/admin/dashboard"
          element={(
            <PrivateRoute role="ADMIN">
              <AdminDashboard />
            </PrivateRoute>
          )}
        />

        <Route path="/market" element={<PublicDemandDashboard />} />
        <Route path="/dashboard" element={<SessionRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
