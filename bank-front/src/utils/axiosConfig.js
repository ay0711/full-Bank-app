import axios from 'axios';
import { API_URL } from './api';
import log from './errorLogger';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    log.request(config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    log.unknown(error);
    return Promise.reject(error);
  }
);

// Response interceptor - validate content type and handle HTML responses
apiClient.interceptors.response.use(
  (response) => {
    // Check if response is actually JSON
    const contentType = response.headers['content-type'];
    if (contentType && !contentType.includes('application/json')) {
      log.mimeTypeError(response.config.url, contentType, response.status);
      return Promise.reject(
        new Error(`Invalid response type: ${contentType}. Expected application/json`)
      );
    }
    log.response(response.config.url, response.status, response.data);
    return response;
  },
  (error) => {
    const url = error.config?.url || 'unknown';
    
    // Handle network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        log.timeout(url);
        return Promise.reject({
          message: 'Request timeout - server is not responding',
          originalError: error,
          status: 0
        });
      }
      log.networkError(error, url);
      return Promise.reject({
        message: 'Network error - unable to connect to server',
        originalError: error,
        status: 0
      });
    }

    const status = error.response.status;
    const contentType = error.response.headers['content-type'];

    // Check if error response is HTML (backend error page)
    if (contentType && contentType.includes('text/html')) {
      log.mimeTypeError(url, contentType, status);
      return Promise.reject({
        message: 'Backend error - server returned HTML instead of JSON. Backend may be down or misconfigured.',
        status: status,
        url: url,
        originalError: error
      });
    }

    // Handle authentication errors
    if (status === 401) {
      log.authError(status);
      // Clear token and redirect to login if needed
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }

    // Handle not found errors
    if (status === 404) {
      log.notFound(url);
    }

    // Log the error
    log.response(url, status, error.response.data);

    // Handle error responses with original error structure
    if (error.response?.data?.message) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject({
      message: error.response?.statusText || 'Unknown error',
      status: status,
      originalError: error
    });
  }
);

export default apiClient;
