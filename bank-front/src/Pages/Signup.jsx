import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ayBankCircle from '../../image/ay bank cirlcle.png';
import '../styles/AuthStyles.css';

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useAppContext();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .min(2, 'First name must be at least 2 characters')
      .required('First name is required'),
    lastName: Yup.string()
      .min(2, 'Last name must be at least 2 characters')
      .required('Last name is required'),
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required')
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
      console.log('Attempting to signup with:', { firstName: values.firstName, lastName: values.lastName, email: values.email });
      
  const response = await axios.post('https://full-bank-app.onrender.com/api/auth/signup', {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password
      });

      console.log('Signup successful:', response.data);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setMessage('Account created successfully! Please sign in with your credentials.');
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
      
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Error response:', error.response);
      
      if (error.response) {
        // Server responded with error
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        setMessage(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        setMessage('Cannot connect to server. Please check your internet connection.');
      } else {
        // Something else happened
        console.error('Error setting up request:', error.message);
        setMessage('An unexpected error occurred: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
                    <i className="fas fa-user-plus fa-2x"></i>
                  </div>
                  <h2 className="auth-card-title">Create Account</h2>
                  <p className="auth-card-subtitle">Join SecureBank Today</p>
                </div>
              </div>

              {/* Card body */}
              <div className="auth-card-body">
                {message && (
                  <div className={`alert-custom ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} animate-slide-in`} role="alert">
                    <i className={`fas ${message.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                    {message}
                  </div>
                )}

                {/* Form */}
                <Formik
                  initialValues={{
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isValid, dirty, values }) => (
                    <Form className="auth-form">
                      {/* Name inputs row */}
                      <div className="form-row">
                        <div className="form-group-custom animate-fade-in">
                          <label htmlFor="firstName" className="form-label-custom">
                            <i className="fas fa-user me-2"></i>First Name
                          </label>
                          <div className="input-wrapper">
                            <Field
                              type="text"
                              name="firstName"
                              className="form-input-custom"
                              placeholder="First name"
                            />
                            <div className="input-focus-border"></div>
                          </div>
                          <ErrorMessage name="firstName" component="div" className="error-message" />
                        </div>
                        <div className="form-group-custom animate-fade-in">
                          <label htmlFor="lastName" className="form-label-custom">
                            <i className="fas fa-user me-2"></i>Last Name
                          </label>
                          <div className="input-wrapper">
                            <Field
                              type="text"
                              name="lastName"
                              className="form-input-custom"
                              placeholder="Last name"
                            />
                            <div className="input-focus-border"></div>
                          </div>
                          <ErrorMessage name="lastName" component="div" className="error-message" />
                        </div>
                      </div>

                      {/* Email input */}
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
                            placeholder="At least 6 characters"
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

                      {/* Confirm Password input */}
                      <div className="form-group-custom animate-fade-in">
                        <label htmlFor="confirmPassword" className="form-label-custom">
                          <i className="fas fa-check-circle me-2"></i>Confirm Password
                        </label>
                        <div className="input-wrapper">
                          <Field
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            className="form-input-custom"
                            placeholder="Re-enter your password"
                          />
                          <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            title={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                          <div className="input-focus-border"></div>
                        </div>
                        <ErrorMessage name="confirmPassword" component="div" className="error-message" />
                      </div>

                      {/* Terms agreement */}
                      <div className="form-check-custom terms-agreement">
                        <input type="checkbox" className="form-check-input" id="agreeTerms" />
                        <label className="form-check-label" htmlFor="agreeTerms">
                          I agree to the <Link to="#" className="terms-link">Terms & Conditions</Link>
                        </label>
                      </div>

                      {/* Submit button */}
                      <button
                        type="submit"
                        className="btn-submit-custom animate-glow"
                        disabled={!isValid || !dirty || isLoading}
                      >
                        <span className="btn-text">{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                        {isLoading && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
                        <i className="fas fa-arrow-right ms-2"></i>
                      </button>
                    </Form>
                  )}
                </Formik>
              </div>

              {/* Card footer */}
              <div className="auth-card-footer">
                <p className="footer-text">
                  Already have an account?{' '}
                  <Link to="/signin" className="footer-link">Sign In</Link>
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
            <i className="fas fa-lock"></i>
            <span>Safe</span>
          </div>
          <div className="feature-item animate-slide-up">
            <i className="fas fa-zap"></i>
            <span>Simple</span>
          </div>
          <div className="feature-item animate-slide-up">
            <i className="fas fa-globe"></i>
            <span>Global</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;