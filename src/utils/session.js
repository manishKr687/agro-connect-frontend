const SESSION_EVENT = 'agroconnect-session-changed';

function notifySessionChanged() {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export const ROLE_META = {
  FARMER: {
    label: 'Farmer',
    loginPath: '/farmer/login',
    registerPath: '/farmer/register',
    dashboardPath: '/farmer/dashboard',
  },
  RETAILER: {
    label: 'Retailer',
    loginPath: '/retailer/login',
    registerPath: '/retailer/register',
    dashboardPath: '/retailer/dashboard',
  },
  AGENT: {
    label: 'Agent',
    loginPath: '/agent/login',
    registerPath: '/agent/register',
    dashboardPath: '/agent/dashboard',
  },
  ADMIN: {
    label: 'Admin',
    loginPath: '/admin/login',
    registerPath: '/admin/register',
    dashboardPath: '/admin/dashboard',
  },
};

export function getSession() {
  return {
    userId: localStorage.getItem('userId') || '',
    username: localStorage.getItem('username') || '',
    role: localStorage.getItem('role') || '',
  };
}

export function saveSession(authResponse) {
  localStorage.setItem('userId', String(authResponse.userId || ''));
  localStorage.setItem('username', authResponse.username || '');
  localStorage.setItem('role', authResponse.role || '');
  notifySessionChanged();
}

export function clearSession() {
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  localStorage.removeItem('adminId');
  notifySessionChanged();
}

export function subscribeToSessionChanges(listener) {
  window.addEventListener(SESSION_EVENT, listener);
  return () => window.removeEventListener(SESSION_EVENT, listener);
}

export function roleHomePath(role, type) {
  const meta = ROLE_META[role];

  if (!meta) {
    return '/';
  }

  if (type === 'login') {
    return meta.loginPath;
  }

  if (type === 'register') {
    return meta.registerPath;
  }

  return meta.dashboardPath;
}
