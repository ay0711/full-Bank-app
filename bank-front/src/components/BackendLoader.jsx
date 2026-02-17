import React, { useEffect, useState } from 'react';
import { wakeUpBackend, retryBackendWakeup } from '../utils/backendWakeup';
import '../styles/BackendLoader.css';

/**
 * Backend Loader Component
 * Shows progress while waking up the backend on free tier hosting
 * Only shows once per session - doesn't re-check if already confirmed awake
 */
const BackendLoader = ({ onReady, autoStart = true }) => {
  const [status, setStatus] = useState('connecting');
  const [message, setMessage] = useState('Connecting to backend...');
  const [attempt, setAttempt] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(0);
  const [showRetry, setShowRetry] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    if (!autoStart) return;

    // Check if backend is already marked as awake in this session
    const backendAwake = sessionStorage.getItem('backendAwake') === 'true';
    
    if (backendAwake) {
      // Backend already confirmed awake - skip loader
      setShouldShow(false);
      onReady?.();
      return;
    }

    const startWakeup = async () => {
      const success = await wakeUpBackend((progress) => {
        setAttempt(progress.attempt);
        setMaxAttempts(progress.maxAttempts);
        setMessage(progress.message);

        if (progress.success) {
          setStatus('ready');
          setTimeout(() => {
            setShouldShow(false);
            onReady?.();
          }, 500);
        } else if (progress.success === false) {
          setStatus('failed');
          setShowRetry(true);
        }
      });

      if (!success) {
        setStatus('failed');
        setShowRetry(true);
      }
    };

    startWakeup();
  }, [autoStart, onReady]);

  // If backend is already awake in session, skip rendering completely
  if (!shouldShow) {
    return null;
  }

  const handleRetry = async () => {
    setShowRetry(false);
    setStatus('connecting');
    setMessage('Retrying connection...');
    setAttempt(0);

    const success = await retryBackendWakeup((progress) => {
      setAttempt(progress.attempt);
      setMaxAttempts(progress.maxAttempts);
      setMessage(progress.message);

      if (progress.success) {
        setStatus('ready');
        setTimeout(() => {
          setShouldShow(false);
          onReady?.();
        }, 500);
      } else if (progress.success === false) {
        setStatus('failed');
        setShowRetry(true);
      }
    });

    if (!success) {
      setStatus('failed');
      setShowRetry(true);
    }
  };

  const handleContinueAnyway = () => {
    // Allow user to continue even if backend isn't responding
    // Requests might work once backend wakes up
    onReady?.();
  };

  return (
    <div className="backend-loader-container">
      <div className="loader-background">
        <div className="loader-blob blob-1"></div>
        <div className="loader-blob blob-2"></div>
        <div className="loader-blob blob-3"></div>
      </div>

      <div className="loader-content">
        {/* Logo */}
        <div className="loader-logo-wrapper">
          <div className={`loader-logo ${status === 'ready' ? 'ready' : ''}`}>
            <i className="fas fa-university"></i>
          </div>
          <div className="loader-logo-glow"></div>
        </div>

        {/* Main message */}
        <h2 className="loader-title">SecureBank</h2>
        <p className="loader-subtitle">{message}</p>

        {/* Progress bar */}
        {status === 'connecting' && maxAttempts > 0 && (
          <div className="loader-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(attempt / maxAttempts) * 100}%` }}
              ></div>
            </div>
            <p className="progress-text">
              Attempt {attempt} of {maxAttempts}
            </p>
          </div>
        )}

        {/* Status icon */}
        {status === 'ready' && (
          <div className="loader-status success">
            <i className="fas fa-check-circle"></i>
            <p>Backend is ready!</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="loader-status failed">
            <i className="fas fa-exclamation-circle"></i>
            <p>Backend is taking longer than expected</p>
          </div>
        )}

        {/* Spinner */}
        {status === 'connecting' && (
          <div className="loader-spinner">
            <div className="spinner-circle"></div>
          </div>
        )}

        {/* Action buttons */}
        {showRetry && (
          <div className="loader-actions">
            <button
              className="btn-retry"
              onClick={handleRetry}
              title="Try connecting again"
            >
              <i className="fas fa-redo me-2"></i>Try Again
            </button>
            <button
              className="btn-continue"
              onClick={handleContinueAnyway}
              title="Continue anyway - backend may wake up while you sign in"
            >
              <i className="fas fa-arrow-right me-2"></i>Continue Anyway
            </button>
          </div>
        )}

        {/* Info text */}
        <p className="loader-info">
          {status === 'connecting'
            ? '⏳ We\'re waking up the server on a free tier...'
            : status === 'failed'
            ? '💡 The backend is taking longer than expected. This is normal on first access.'
            : '✨ Ready to go!'}
        </p>
      </div>
    </div>
  );
};

export default BackendLoader;
