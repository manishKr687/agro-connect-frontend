import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

jest.mock('./pages/AdminDashboard', () => () => null);
jest.mock('./pages/AdminLogin', () => () => null);
jest.mock('./pages/AgentDashboard', () => () => null);
jest.mock('./pages/AgentLogin', () => () => null);
jest.mock('./pages/FarmerDashboard', () => () => null);
jest.mock('./pages/FarmerLogin', () => () => null);
jest.mock('./pages/FarmerRegister', () => () => null);
jest.mock('./pages/HomeModern', () => () => null);
jest.mock('./pages/PublicDemandDashboard', () => () => null);
jest.mock('./pages/Login', () => () => null);
jest.mock('./pages/Register', () => () => null);
jest.mock('./pages/RetailerDashboard', () => () => null);
jest.mock('./pages/RetailerLogin', () => () => null);
jest.mock('./pages/RetailerRegister', () => () => null);
jest.mock('./api/axiosConfig', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockClearSession = jest.fn();

jest.mock('./utils/session', () => {
  const actual = jest.requireActual('./utils/session');
  return {
    ...actual,
    clearSession: (...args) => mockClearSession(...args),
  };
});

jest.mock('@mui/material', () => ({
  Box: ({ children }) => {
    const React = require('react');
    return React.createElement('div', null, children);
  },
  CircularProgress: () => {
    const React = require('react');
    return React.createElement('div', null, 'loading');
  },
}));

jest.mock('react-router-dom', () => {
  const React = require('react');
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
