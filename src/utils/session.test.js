import { describe, expect, test, beforeEach } from 'vitest';
import { clearSession, getSession, saveSession } from './session';

describe('session utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saveSession persists non-sensitive session metadata', () => {
    saveSession({
      userId: 7,
      username: 'farmer_user',
      role: 'FARMER',
    });

    expect(getSession()).toEqual({
      userId: '7',
      username: 'farmer_user',
      role: 'FARMER',
    });
  });

  test('clearSession removes stored session metadata', () => {
    localStorage.setItem('userId', '1');
    localStorage.setItem('username', 'admin_user');
    localStorage.setItem('role', 'ADMIN');
    localStorage.setItem('adminId', '1');

    clearSession();

    expect(getSession()).toEqual({
      userId: '',
      username: '',
      role: '',
    });
    expect(localStorage.getItem('adminId')).toBeNull();
  });
});
