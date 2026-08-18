import { describe, it, expect, vi, beforeEach } from 'vitest';
import client from './client';

// Spy on localStorage methods
const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

describe('API Client Interceptors', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    // Safely stub window.location
    delete window.location;
    window.location = {
      ...originalLocation,
      pathname: '/',
      href: '',
    };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  describe('Request Interceptor', () => {
    it('should attach Authorization header when token exists in localStorage', async () => {
      getItemSpy.mockReturnValue('test-token');

      const config = { headers: {} };

      // Axios interceptors are stored in an array
      const requestInterceptor = client.interceptors.request.handlers[0].fulfilled;

      const result = await requestInterceptor(config);

      expect(getItemSpy).toHaveBeenCalledWith('token');
      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should not attach Authorization header when token does not exist', async () => {
      getItemSpy.mockReturnValue(null);

      const config = { headers: {} };

      const requestInterceptor = client.interceptors.request.handlers[0].fulfilled;

      const result = await requestInterceptor(config);

      expect(getItemSpy).toHaveBeenCalledWith('token');
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should reject request error', async () => {
      const error = new Error('request error');

      const requestErrorInterceptor = client.interceptors.request.handlers[0].rejected;

      await expect(requestErrorInterceptor(error)).rejects.toThrow('request error');
    });
  });

  describe('Response Interceptor', () => {
    it('should return response directly on success', async () => {
      const response = { data: 'test data' };

      const responseInterceptor = client.interceptors.response.handlers[0].fulfilled;

      const result = await responseInterceptor(response);

      expect(result).toBe(response);
    });

    it('should clear localStorage and redirect to login on 401 error', async () => {
      const error = {
        response: {
          status: 401
        }
      };

      const responseErrorInterceptor = client.interceptors.response.handlers[0].rejected;

      await expect(responseErrorInterceptor(error)).rejects.toEqual(error);

      expect(removeItemSpy).toHaveBeenCalledWith('token');
      expect(removeItemSpy).toHaveBeenCalledWith('user');
      expect(window.location.href).toBe('/login');
    });

    it('should clear localStorage but not redirect if already on login page', async () => {
      window.location.pathname = '/login';

      const error = {
        response: {
          status: 401
        }
      };

      const responseErrorInterceptor = client.interceptors.response.handlers[0].rejected;

      await expect(responseErrorInterceptor(error)).rejects.toEqual(error);

      expect(removeItemSpy).toHaveBeenCalledWith('token');
      expect(removeItemSpy).toHaveBeenCalledWith('user');
      expect(window.location.href).toBe(''); // Shouldn't change
    });

    it('should clear localStorage but not redirect if already on register page', async () => {
      window.location.pathname = '/register';

      const error = {
        response: {
          status: 401
        }
      };

      const responseErrorInterceptor = client.interceptors.response.handlers[0].rejected;

      await expect(responseErrorInterceptor(error)).rejects.toEqual(error);

      expect(removeItemSpy).toHaveBeenCalledWith('token');
      expect(removeItemSpy).toHaveBeenCalledWith('user');
      expect(window.location.href).toBe(''); // Shouldn't change
    });

    it('should reject non-401 errors without clearing localStorage or redirecting', async () => {
      const error = {
        response: {
          status: 500
        }
      };

      const responseErrorInterceptor = client.interceptors.response.handlers[0].rejected;

      await expect(responseErrorInterceptor(error)).rejects.toEqual(error);

      expect(removeItemSpy).not.toHaveBeenCalled();
      expect(window.location.href).toBe(''); // Shouldn't change
    });

    it('should reject errors without response without clearing localStorage or redirecting', async () => {
      const error = new Error('Network Error');

      const responseErrorInterceptor = client.interceptors.response.handlers[0].rejected;

      await expect(responseErrorInterceptor(error)).rejects.toThrow('Network Error');

      expect(removeItemSpy).not.toHaveBeenCalled();
      expect(window.location.href).toBe(''); // Shouldn't change
    });
  });
});
