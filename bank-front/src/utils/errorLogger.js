/**
 * Error Logging Utility
 * Provides structured logging for API errors
 */

const log = {
  // Log API request
  request: (method, url, status = null) => {
    const icon = status ? (status < 400 ? '✅' : '❌') : '📤';
    console.log(`${icon} [${method}] ${url}${status ? ` (${status})` : ''}`);
  },

  // Log API response
  response: (url, status, data) => {
    const icon = status < 400 ? '✅' : '❌';
    console.log(`${icon} [${status}] ${url}`);
    if (process.env.NODE_ENV === 'development') {
      console.log('Response:', data);
    }
  },

  // Log MIME type error
  mimeTypeError: (url, contentType, status) => {
    console.error('🚨 MIME TYPE ERROR');
    console.error(`URL: ${url}`);
    console.error(`Status: ${status}`);
    console.error(`Content-Type: ${contentType} (Expected: application/json)`);
    console.error('Solution: Backend is likely returning HTML error page');
    console.error('Action: Check backend server logs and ensure it\'s running');
  },

  // Log network error
  networkError: (error, url) => {
    console.error('🌐 NETWORK ERROR');
    console.error(`URL: ${url}`);
    console.error(`Error: ${error.message}`);
    console.error('Solution: Check internet connection and backend availability');
  },

  // Log authentication error
  authError: (status) => {
    console.error('🔐 AUTHENTICATION ERROR');
    console.error(`Status: ${status}`);
    if (status === 401) {
      console.error('Token expired or invalid');
      console.error('Action: Please log in again');
    }
  },

  // Log validation error
  validationError: (message) => {
    console.warn('⚠️ VALIDATION ERROR');
    console.warn(`Message: ${message}`);
  },

  // Request timeout
  timeout: (url) => {
    console.error('⏱️ REQUEST TIMEOUT');
    console.error(`URL: ${url}`);
    console.error('The server took too long to respond');
  },

  // 404 Not Found
  notFound: (url) => {
    console.error('🔍 NOT FOUND');
    console.error(`URL: ${url}`);
    console.error('The requested endpoint does not exist');
  },

  // Unknown error
  unknown: (error) => {
    console.error('❓ UNKNOWN ERROR');
    console.error(error);
  }
};

export default log;
