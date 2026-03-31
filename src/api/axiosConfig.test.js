import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../utils/session', () => ({
  clearSession: vi.fn(),
}));

import { clearSession } from '../utils/session';
import { handleAuthFailure } from './axiosConfig';

describe('axios auth failure handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('clears session on 401 responses', async () => {
    const error = { response: { status: 401 } };

    await expect(handleAuthFailure(error)).rejects.toBe(error);
    expect(clearSession).toHaveBeenCalledTimes(1);
  });

  test('clears session on 403 responses', async () => {
    const error = { response: { status: 403 } };

    await expect(handleAuthFailure(error)).rejects.toBe(error);
    expect(clearSession).toHaveBeenCalledTimes(1);
  });

  test('does not clear session for other failures', async () => {
    const error = { response: { status: 500 } };

    await expect(handleAuthFailure(error)).rejects.toBe(error);
    expect(clearSession).not.toHaveBeenCalled();
  });
});
