/**
 * Backend Wake-up Service
 * Handles waking up backends on free tier hosting (e.g., Render)
 * Implements retry logic with exponential backoff
 * Once backend is confirmed awake, it doesn't check again until session ends or app reloads
 */

const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://full-bank-app.onrender.com';
const WAKE_UP_TIMEOUT = 3000; // 3 seconds per attempt
const MAX_RETRIES = 4; // Try up to 4 times
const BACKOFF_MULTIPLIER = 1.5; // Exponential backoff factor

// Status tracking (in-memory for current session)
let isBackendAwake = false;
let wakeUpPromise = null;
let wakeUpAttempts = 0;

/**
 * Check if backend was marked as awake in this browser session
 * @returns {boolean} True if backend was already confirmed awake
 */
const getBackendStatus = () => {
  try {
    const stored = sessionStorage.getItem('backendAwake');
    return stored === 'true';
  } catch {
    return false;
  }
};

/**
 * Mark backend as awake in session storage
 * This persists only for the current browser session
 */
const setBackendAwake = () => {
  try {
    sessionStorage.setItem('backendAwake', 'true');
    isBackendAwake = true;
  } catch {
    isBackendAwake = true;
  }
};

/**
 * Ping the backend to check if it's alive
 * @returns {Promise<boolean>} True if backend is responsive
 */
export const pingBackend = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WAKE_UP_TIMEOUT);

    const response = await fetch(`${BACKEND_URL}/api/auth/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    // If no health endpoint, try a simpler ping
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), WAKE_UP_TIMEOUT);

      await fetch(BACKEND_URL, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Wake up the backend with exponential backoff retry logic
 * Once successful, won't check again in the same session
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<boolean>} True if backend is awake, false if timeout
 */
export const wakeUpBackend = async (onProgress = null) => {
  // Check if backend status is already cached in this session
  if (getBackendStatus() || isBackendAwake) {
    if (onProgress) {
      onProgress({
        attempt: 1,
        maxAttempts: 1,
        success: true,
        message: 'Backend is ready!',
      });
    }
    return true;
  }

  // If wake-up is already in progress, return the existing promise
  if (wakeUpPromise) {
    return wakeUpPromise;
  }

  // Create the wake-up attempt
  wakeUpPromise = (async () => {
    wakeUpAttempts = 0;

    while (wakeUpAttempts < MAX_RETRIES) {
      wakeUpAttempts++;
      const delay = Math.pow(BACKOFF_MULTIPLIER, wakeUpAttempts - 1) * 1000;

      // Call progress callback
      if (onProgress) {
        onProgress({
          attempt: wakeUpAttempts,
          maxAttempts: MAX_RETRIES,
          delay,
          message: `Waking up backend... Attempt ${wakeUpAttempts}/${MAX_RETRIES}`,
        });
      }

      // Wait before attempting (exponential backoff)
      if (wakeUpAttempts > 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Try to ping the backend
      const isAwake = await pingBackend();

      if (isAwake) {
        // Mark backend as awake for this session
        setBackendAwake();
        
        if (onProgress) {
          onProgress({
            attempt: wakeUpAttempts,
            maxAttempts: MAX_RETRIES,
            success: true,
            message: 'Backend is ready!',
          });
        }
        wakeUpPromise = null;
        return true;
      }

      // Log attempt
      console.log(`[Backend Wake-up] Attempt ${wakeUpAttempts}/${MAX_RETRIES} failed`);
    }

    // All attempts failed
    if (onProgress) {
      onProgress({
        attempt: wakeUpAttempts,
        maxAttempts: MAX_RETRIES,
        success: false,
        message: 'Backend is taking longer to wake up. Please try again.',
      });
    }

    wakeUpPromise = null;
    return false;
  })();

  return wakeUpPromise;
};

/**
 * Manual retry function for UI to trigger another wake-up attempt
 * Clears session status to allow another attempt
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<boolean>}
 */
export const retryBackendWakeup = async (onProgress = null) => {
  // Clear the session cache so it will check again
  try {
    sessionStorage.removeItem('backendAwake');
  } catch {
    // Ignore if sessionStorage not available
  }
  
  isBackendAwake = false;
  wakeUpPromise = null;
  wakeUpAttempts = 0;
  return wakeUpBackend(onProgress);
};

/**
 * Reset the backend wake-up state (clears session cache)
 * Useful when switching sessions or logging out
 */
export const resetBackendState = () => {
  try {
    sessionStorage.removeItem('backendAwake');
  } catch {
    // Ignore if sessionStorage not available
  }
  
  isBackendAwake = false;
  wakeUpPromise = null;
  wakeUpAttempts = 0;
};

/**
 * Get current backend status
 * @returns {boolean}
 */
export const isBackendReady = () => {
  return isBackendAwake;
};

/**
 * Wrapper for fetch requests to handle backend errors
 * @param {string} url - The API endpoint
 * @param {object} options - Fetch options
 * @param {Function} onRetry - Callback when retrying
 * @returns {Promise<Response>}
 */
export const fetchWithBackendCheck = async (url, options = {}, onRetry = null) => {
  try {
    const response = await fetch(url, options);
    isBackendAwake = true;
    return response;
  } catch (error) {
    // Backend might be down, try to wake it up
    if (!isBackendAwake) {
      console.log('[Backend Wake-up] Detected backend is down, attempting wake-up...');
      const wakeUpSuccess = await wakeUpBackend();

      if (wakeUpSuccess) {
        // Retry the original request
        if (onRetry) onRetry();
        return fetch(url, options);
      }
    }
    throw error;
  }
};

/**
 * Initialize backend wake-up on app load
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<boolean>}
 */
export const initializeBackend = async (onProgress = null) => {
  console.log('[Backend Wake-up] Initializing backend connection...');
  return wakeUpBackend(onProgress);
};
