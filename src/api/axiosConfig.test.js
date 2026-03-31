import { beforeEach, describe, expect, test, vi } from 'vitest';
vi.mock('axios', () => {
  const instances = [];
  const create = vi.fn((config = {}) => {
    const instance = vi.fn((requestConfig) => Promise.resolve({ data: null, config: requestConfig }));
    instance.defaults = config;
    instance.interceptors = {
      response: {
        use: vi.fn(),
      },
    };
    instance.post = vi.fn();
    instance.get = vi.fn();
    instances.push(instance);
    return instance;
  });

  return {
    default: {
      create,
    },
    __instances: instances,
  };
});
vi.mock('../utils/session', () => ({
  clearSession: vi.fn(),
}));

import axios, { __instances } from 'axios';
import { clearSession } from '../utils/session';
import { handleAuthFailure } from './axiosConfig';

describe('axios auth failure handling', () => {
  const apiClient = __instances[0];
  const refreshClient = __instances[1];

  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.mockResolvedValue({ ok: true });
    refreshClient.post.mockResolvedValue({ status: 204 });
  });

  test('refreshes and retries the original request on 401 responses', async () => {
    const error = { response: { status: 401 }, config: { url: '/api/users/me' } };

    await expect(handleAuthFailure(error)).resolves.toEqual({ ok: true });
    expect(refreshClient.post).toHaveBeenCalledWith('/api/auth/refresh');
    expect(apiClient).toHaveBeenCalledWith(expect.objectContaining({
      url: '/api/users/me',
      _retry: true,
    }));
    expect(clearSession).not.toHaveBeenCalled();
  });

  test('clears session if refresh fails', async () => {
    const error = { response: { status: 401 }, config: { url: '/api/users/me' } };
    const refreshError = { response: { status: 401 } };
    refreshClient.post.mockRejectedValue(refreshError);

    await expect(handleAuthFailure(error)).rejects.toBe(refreshError);
    expect(clearSession).toHaveBeenCalledTimes(1);
  });

  test('does not try to refresh auth endpoints', async () => {
    const error = { response: { status: 401 }, config: { url: '/api/auth/login' } };

    await expect(handleAuthFailure(error)).rejects.toBe(error);
    expect(refreshClient.post).not.toHaveBeenCalled();
    expect(clearSession).toHaveBeenCalledTimes(1);
  });

  test('does not clear session for non-auth failures', async () => {
    const error = { response: { status: 403 }, config: { url: '/api/admins/1/users' } };

    await expect(handleAuthFailure(error)).rejects.toBe(error);
    expect(refreshClient.post).not.toHaveBeenCalled();
    expect(clearSession).not.toHaveBeenCalled();
  });
});
