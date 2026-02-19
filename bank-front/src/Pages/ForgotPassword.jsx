import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import ayBankCircle from '../../image/ay bank cirlcle.png';
import '../styles/AuthStyles.css';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: reset password
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useAppContext();

  const validationSchemaEmail = Yup.object({
    email: Yup.string().email('Invalid email format').required('Email is required')
  });

  const validationSchemaOTP = Yup.object({
    otp: Yup.string().required('OTP is required').length(6, 'OTP must be 6 digits')
  });

  const validationSchemaPassword = Yup.object({
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required')
  });

  const handleEmailSubmit = async (values) => {
    setIsLoading(true);
    setMessage('');
    try {
      await axios.post('https://full-bank-app.onrender.com/api/auth/forgot-password', {
        email: values.email
      });
      setEmail(values.email);
      setMessage('OTP sent to your email!');
      setTimeout(() => {
        setStep(2);
        setMessage('');
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error sending reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (values) => {
    setIsLoading(true);
    setMessage('');
    try {
      await axios.post('https://full-bank-app.onrender.com/api/auth/verify-otp', {
        email,
        otp: values.otp
      });
      setMessage('OTP verified!');
      setTimeout(() => {
        setStep(3);
        setMessage('');
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (values) => {
    setIsLoading(true);
    setMessage('');
    try {
      await axios.post('https://full-bank-app.onrender.com/api/auth/reset-password', {
        email,
        password: values.password
      });
      setMessage('Password reset successful!');
      setTimeout(() => {
        navigate('/signin');
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`auth-container ${isDarkMode ? 'auth-dark' : 'auth-light'}`}>
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

        <div className="auth-card-wrapper">
          <div className="auth-card-3d">
            <div className={`auth-card ${isDarkMode ? 'bg-dark' : 'bg-white'}`}>
              <div className="auth-card-header">
                <div className="header-gradient"></div>
                <div className="header-content">
                  <div className="header-icon-wrapper animate-float">
                    <i className="fas fa-lock fa-2x"></i>
                  </div>
                  <h2 className="auth-card-title">Reset Password</h2>
                  <p className="auth-card-subtitle">Recover your account</p>
                </div>
              </div>

              <div className="auth-card-body">
                {message && (
                  <div className={`alert-custom ${message.includes('successful') || message.includes('verified') || message.includes('sent') ? 'alert-success' : 'alert-danger'} animate-slide-in`} role="alert">
                    <i className={`fas ${message.includes('successful') || message.includes('verified') || message.includes('sent') ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                    {message}
                  </div>
                )}

                {/* Step 1: Email */}
                {step === 1 && (
                  <Formik
                    initialValues={{ email: '' }}
                    validationSchema={validationSchemaEmail}
                    onSubmit={handleEmailSubmit}
                  >
                    {({ isValid, dirty }) => (
                      <Form className="auth-form">
                        <div className="form-group-custom animate-fade-in">
                          <label htmlFor="email" className="form-label-custom">
                            <i className="fas fa-envelope me-2"></i>Email Address
                          </label>
                          <div className="input-wrapper">
                            <Field
                              type="email"
                              name="email"
                              className="form-input-custom"
                              placeholder="Enter your registered email"
                            />
                            <div className="input-focus-border"></div>
                          </div>
                          <ErrorMessage name="email" component="div" className="error-message" />
                        </div>

                        <button
                          type="submit"
                          className="btn-submit-custom animate-glow"
                          disabled={!isValid || !dirty || isLoading}
                        >
                          <span className="btn-text">{isLoading ? 'Sending...' : 'Send Reset Code'}</span>
                          {isLoading && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
                          <i className="fas fa-arrow-right ms-2"></i>
                        </button>

                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                          <Link to="/signin" className="footer-link">
                            <i className="fas fa-arrow-left me-2"></i>Back to Sign In
                          </Link>
                        </div>
                      </Form>
                    )}
                  </Formik>
                )}

                {/* Step 2: OTP */}
                {step === 2 && (
                  <Formik
                    initialValues={{ otp: '' }}
                    validationSchema={validationSchemaOTP}
                    onSubmit={handleOTPSubmit}
                  >
                    {({ isValid, dirty }) => (
                      <Form className="auth-form">
                        <p className="mb-4" style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                          Enter the 6-digit code sent to <strong>{email}</strong>
                        </p>

                        <div className="form-group-custom animate-fade-in">
                          <label htmlFor="otp" className="form-label-custom">
                            <i className="fas fa-key me-2"></i>Verification Code
                          </label>
                          <div className="input-wrapper">
                            <Field
                              type="text"
                              name="otp"
                              className="form-input-custom"
                              placeholder="000000"
                              maxLength="6"
                            />
                            <div className="input-focus-border"></div>
                          </div>
                          <ErrorMessage name="otp" component="div" className="error-message" />
                        </div>

                        <button
                          type="submit"
                          className="btn-submit-custom animate-glow"
                          disabled={!isValid || !dirty || isLoading}
                        >
                          <span className="btn-text">{isLoading ? 'Verifying...' : 'Verify Code'}</span>
                          {isLoading && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
                          <i className="fas fa-arrow-right ms-2"></i>
                        </button>

                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                          <button
                            type="button"
                            className="footer-link"
                            onClick={() => setStep(1)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <i className="fas fa-arrow-left me-2"></i>Change Email
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                  <Formik
                    initialValues={{ password: '', confirmPassword: '' }}
                    validationSchema={validationSchemaPassword}
                    onSubmit={handleResetPassword}
                  >
                    {({ isValid, dirty }) => (
                      <Form className="auth-form">
                        <div className="form-group-custom animate-fade-in">
                          <label htmlFor="password" className="form-label-custom">
                            <i className="fas fa-lock me-2"></i>New Password
                          </label>
                          <div className="input-wrapper">
                            <Field
                              type="password"
                              name="password"
                              className="form-input-custom"
                              placeholder="Enter new password"
                            />
                            <div className="input-focus-border"></div>
                          </div>
                          <ErrorMessage name="password" component="div" className="error-message" />
                        </div>

                        <div className="form-group-custom animate-fade-in">
                          <label htmlFor="confirmPassword" className="form-label-custom">
                            <i className="fas fa-lock me-2"></i>Confirm Password
                          </label>
                          <div className="input-wrapper">
                            <Field
                              type="password"
                              name="confirmPassword"
                              className="form-input-custom"
                              placeholder="Confirm your password"
                            />
                            <div className="input-focus-border"></div>
                          </div>
                          <ErrorMessage name="confirmPassword" component="div" className="error-message" />
                        </div>

                        <button
                          type="submit"
                          className="btn-submit-custom animate-glow"
                          disabled={!isValid || !dirty || isLoading}
                        >
                          <span className="btn-text">{isLoading ? 'Resetting...' : 'Reset Password'}</span>
                          {isLoading && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
                          <i className="fas fa-arrow-right ms-2"></i>
                        </button>
                      </Form>
                    )}
                  </Formik>
                )}
              </div>

              <div className="auth-card-footer">
                <p className="footer-text">
                  Remember your password?{' '}
                  <Link to="/signin" className="footer-link">Sign In</Link>
                </p>
              </div>
            </div>

            <div className="card-decor decor-1"></div>
            <div className="card-decor decor-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
