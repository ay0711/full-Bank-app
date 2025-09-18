import React, { useState, useEffect } from 'react';
import SloganSplash from '../components/SloganSplash';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ayBankCircle from '../../image/ay bank cirlcle.png';
import '../styles/AuthStyles.css';

const Signin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showEmail, setShowEmail] = useState(!localStorage.getItem('user'));
  const [showPassword, setShowPassword] = useState(false);
  // Get fingerprintEnabled from user in localStorage if available
  const [fingerprintEnabled, setFingerprintEnabled] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.fingerprintEnabled || false;
  });
  const navigate = useNavigate();
  const { setUser, isDarkMode, toggleTheme } = useAppContext();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const validationSchema = Yup.object({
    password: Yup.string().required('Password is required'),
    ...(showEmail && {
      email: Yup.string().email('Invalid email format').required('Email is required')
    })
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setMessage('');
    try {
      let email = values.email;
      if (!showEmail) {
        const user = JSON.parse(localStorage.getItem('user'));
        email = user?.email;
      }
  const response = await axios.post('https://full-bank-app.onrender.com/api/auth/signin', {
        email,
        password: values.password
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user); // Update context immediately
      setMessage('Login successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  // Fingerprint login logic (WebAuthn placeholder)
  const handleFingerprintLogin = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      // Use WebAuthn if available
      if (window.PublicKeyCredential) {
        // This is a placeholder for real WebAuthn logic
        // In production, you would call navigator.credentials.get with proper options
        setTimeout(() => {
          setIsLoading(false);
          setMessage('Fingerprint login successful! Redirecting to dashboard...');
          navigate('/dashboard');
        }, 1200);
      } else {
        setIsLoading(false);
        setMessage('Fingerprint not supported on this device/browser');
      }
    } catch {
      setIsLoading(false);
      setMessage('Fingerprint login failed');
    }
  };

  if (isLoading) {
    return <SloganSplash />;
  }
  
  return (
    <div className={`auth-container ${isDarkMode ? 'auth-dark' : 'auth-light'}`}>
      {/* Animated background */}
      <div className="auth-background">
        <div className="auth-gradient-blob blob-1"></div>
        <div className="auth-gradient-blob blob-2"></div>
        <div className="auth-gradient-blob blob-3"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      <div className="auth-content">
        {/* Header with logo and theme toggle */}
        <div className="auth-header">
          <div className="logo-container animate-bounce-slow">
            <img src={ayBankCircle} alt="AY Bank Logo" className="auth-logo" />
            <div className="logo-glow"></div>
          </div>
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>

        {/* Main card with 3D effect */}
        <div className="auth-card-wrapper">
          <div className="auth-card-3d">
            <div className={`auth-card ${isDarkMode ? 'bg-dark' : 'bg-white'}`}>
              {/* Card header with gradient */}
              <div className="auth-card-header">
                <div className="header-gradient"></div>
                <div className="header-content">
                  <div className="header-icon-wrapper animate-float">
                    <i className="fas fa-lock-open fa-2x"></i>
                  </div>
                  <h2 className="auth-card-title">Welcome Back</h2>
                  <p className="auth-card-subtitle">SecureBank Sign In</p>
                </div>
              </div>

              {/* Card body */}
              <div className="auth-card-body">
                {message && (
                  <div className={`alert-custom ${message.includes('successful') ? 'alert-success' : 'alert-danger'} animate-slide-in`} role="alert">
                    <i className={`fas ${message.includes('successful') ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                    {message}
                  </div>
                )}

                {/* Fingerprint login button if enabled */}
                {fingerprintEnabled && (
                  <button 
                    className="btn-fingerprint animate-slide-in" 
                    onClick={handleFingerprintLogin} 
                    disabled={isLoading}
                  >
                    <i className="fas fa-fingerprint me-2"></i>Login with Fingerprint
                  </button>
                )}

                {/* Divider with text */}
                {fingerprintEnabled && (
                  <div className="divider-container">
                    <span>OR</span>
                  </div>
                )}

                {/* Form */}
                <Formik
                  initialValues={{
                    email: '',
                    password: ''
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isValid, dirty, values }) => (
                    <Form className="auth-form">
                      {/* Email input - conditional */}
                      {showEmail && (
                        <div className="form-group-custom animate-fade-in">
                          <label htmlFor="email" className="form-label-custom">
                            <i className="fas fa-envelope me-2"></i>Email Address
                          </label>
                          <div className="input-wrapper">
                            <Field
                              type="email"
                              name="email"
                              className="form-input-custom"
                              placeholder="Enter your email"
                            />
                            <div className="input-focus-border"></div>
                          </div>
                          <ErrorMessage name="email" component="div" className="error-message" />
                        </div>
                      )}

                      {/* Password input */}
                      <div className="form-group-custom animate-fade-in">
                        <label htmlFor="password" className="form-label-custom">
                          <i className="fas fa-key me-2"></i>Password
                        </label>
                        <div className="input-wrapper">
                          <Field
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            className="form-input-custom"
                            placeholder="Enter your password"
                          />
                          <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? 'Hide password' : 'Show password'}
                          >
                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                          <div className="input-focus-border"></div>
                        </div>
                        <ErrorMessage name="password" component="div" className="error-message" />
                      </div>

                      {/* Remember me & forgot password */}
                      <div className="form-options">
                        <div className="form-check-custom">
                          <input type="checkbox" className="form-check-input" id="rememberMe" />
                          <label className="form-check-label" htmlFor="rememberMe">
                            Remember me
                          </label>
                        </div>
                        <Link to="#" className="forgot-password-link">Forgot Password?</Link>
                      </div>

                      {/* Submit button */}
                      <button
                        type="submit"
                        className="btn-submit-custom animate-glow"
                        disabled={!isValid || !dirty || isLoading}
                      >
                        <span className="btn-text">{isLoading ? 'Signing In...' : 'Sign In'}</span>
                        {isLoading && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
                        <i className="fas fa-arrow-right ms-2"></i>
                      </button>

                      {/* Switch account button */}
                      {!showEmail && (
                        <button 
                          type="button" 
                          className="btn-switch-account"
                          onClick={() => setShowEmail(true)}
                        >
                          <i className="fas fa-plus me-2"></i>Sign in with another account
                        </button>
                      )}
                    </Form>
                  )}
                </Formik>
              </div>

              {/* Card footer */}
              <div className="auth-card-footer">
                <p className="footer-text">
                  Don't have an account?{' '}
                  <Link to="/" className="footer-link">Create one now</Link>
                </p>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="card-decor decor-1"></div>
            <div className="card-decor decor-2"></div>
          </div>
        </div>

        {/* Bottom features */}
        <div className="auth-features">
          <div className="feature-item animate-slide-up">
            <i className="fas fa-shield-alt"></i>
            <span>Secure</span>
          </div>
          <div className="feature-item animate-slide-up">
            <i className="fas fa-bolt"></i>
            <span>Fast</span>
          </div>
          <div className="feature-item animate-slide-up">
            <i className="fas fa-mobile-alt"></i>
            <span>Mobile</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;