jest.mock('../utils/session', () => ({
  clearSession: jest.fn(),
}));

import { clearSession } from '../utils/session';
import { handleAuthFailure } from './axiosConfig';

describe('axios auth failure handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
