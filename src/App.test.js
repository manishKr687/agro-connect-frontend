import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('./pages/AdminDashboard', () => ({ default: () => null }));
vi.mock('./pages/AdminLogin', () => ({ default: () => null }));
vi.mock('./pages/AgentDashboard', () => ({ default: () => null }));
vi.mock('./pages/AgentLogin', () => ({ default: () => null }));
vi.mock('./pages/FarmerDashboard', () => ({ default: () => null }));
vi.mock('./pages/FarmerLogin', () => ({ default: () => null }));
vi.mock('./pages/FarmerRegister', () => ({ default: () => null }));
vi.mock('./pages/HomeModern', () => ({ default: () => null }));
vi.mock('./pages/PublicDemandDashboard', () => ({ default: () => null }));
vi.mock('./pages/Login', () => ({ default: () => null }));
vi.mock('./pages/Register', () => ({ default: () => null }));
vi.mock('./pages/RetailerDashboard', () => ({ default: () => null }));
vi.mock('./pages/RetailerLogin', () => ({ default: () => null }));
vi.mock('./pages/RetailerRegister', () => ({ default: () => null }));
vi.mock('./api/axiosConfig', () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
  },
}));

const mockClearSession = vi.fn();

vi.mock('./utils/session', async () => {
  const actual = await vi.importActual('./utils/session');
  return {
    ...actual,
    clearSession: (...args) => mockClearSession(...args),
  };
});

vi.mock('@mui/material', () => ({
  Box: ({ children }) => {
    return React.createElement('div', null, children);
  },
  CircularProgress: () => {
    return React.createElement('div', null, 'loading');
  },
}));

vi.mock('react-router-dom', () => {
  return {
    BrowserRouter: ({ children }) => React.createElement(React.Fragment, null, children),
    Routes: ({ children }) => React.createElement(React.Fragment, null, children),
    Route: ({ element }) => element,
    Navigate: ({ to }) => React.createElement('div', { 'data-to': to }),
  };
});

import { PrivateRoute, SessionRedirect } from './App';

describe('auth routing', () => {
  beforeEach(() => {
    mockClearSession.mockClear();
  });

  test('redirects unauthenticated users to the matching login page', () => {
    const html = renderToStaticMarkup(
      <PrivateRoute role="FARMER" session={{ userId: '', role: '' }}>
        <div>dashboard</div>
      </PrivateRoute>,
    );

    expect(html).toContain('data-to="/farmer/login"');
  });

  test('redirects users with the wrong role to their own dashboard', () => {
    const html = renderToStaticMarkup(
      <PrivateRoute role="ADMIN" session={{ userId: '5', role: 'AGENT' }}>
        <div>dashboard</div>
      </PrivateRoute>,
    );

    expect(html).toContain('data-to="/agent/dashboard"');
  });

  test('redirects invalid sessions home and clears local session state', () => {
    const html = renderToStaticMarkup(
      <SessionRedirect session={{ userId: '', role: '' }} />,
    );

    expect(html).toContain('data-to="/"');
    expect(mockClearSession).toHaveBeenCalledTimes(1);
  });

  test('redirects valid sessions to the correct dashboard', () => {
    const html = renderToStaticMarkup(
      <SessionRedirect session={{ userId: '1', role: 'ADMIN' }} />,
    );

    expect(html).toContain('data-to="/admin/dashboard"');
    expect(mockClearSession).not.toHaveBeenCalled();
  });
});
