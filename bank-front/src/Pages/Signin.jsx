import React, { useState } from 'react';
import SloganSplash from '../components/SloganSplash';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ayBankCircle from '../../image/ay bank cirlcle.png';

const Signin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showEmail, setShowEmail] = useState(!localStorage.getItem('user'));
  // Get fingerprintEnabled from user in localStorage if available
  const [fingerprintEnabled, setFingerprintEnabled] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.fingerprintEnabled || false;
  });
  const navigate = useNavigate();
  const { setUser } = useAppContext();

  const validationSchema = Yup.object({
    password: Yup.string().required('Password is required'),
    ...(showEmail && {
      email: Yup.string().email('Invalid email format').required('Email is required')
    })
  });

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setMessage('');
    try {
      let email = values.email;
      if (!showEmail) {
        const user = JSON.parse(localStorage.getItem('user'));
        email = user?.email;
      }
      const response = await axios.post('https://backend-bank-3fqd.onrender.com/api/auth/signin', {
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
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="row w-100 justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="text-center mb-3">
            <img src={ayBankCircle} alt="AY Bank Logo" style={{ width: 80, borderRadius: '50%' }} />
          </div>
          <div className="card shadow-lg border-0 rounded-lg">
            <div className="card-header bg-primary text-white text-center py-4">
              <h3 className="mb-0">
                <i className="fas fa-university me-2"></i>
                SecureBank
              </h3>
              <p className="mb-0">Welcome Back</p>
            </div>
            <div className="card-body p-4">
              {message && (
                <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
                  {message}
                </div>
              )}
              {/* Fingerprint login button if enabled */}
              {fingerprintEnabled && (
                <button className="btn btn-outline-success w-100 mb-3" onClick={handleFingerprintLogin} disabled={isLoading}>
                  <i className="fas fa-fingerprint me-2"></i>Login with Fingerprint
                </button>
              )}
              <Formik
                initialValues={{
                  email: '',
                  password: ''
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isValid, dirty }) => (
                  <Form>
                    {/* Show email input only if needed */}
                    {showEmail && (
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <Field
                          type="email"
                          name="email"
                          className="form-control"
                          placeholder="Enter your email address"
                        />
                        <ErrorMessage name="email" component="div" className="text-danger small mt-1" />
                      </div>
                    )}
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <Field
                        type="password"
                        name="password"
                        className="form-control"
                        placeholder="Enter your password"
                      />
                      <ErrorMessage name="password" component="div" className="text-danger small mt-1" />
                    </div>
                    <div className="mb-3 form-check">
                      <input type="checkbox" className="form-check-input" id="rememberMe" />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2"
                      disabled={!isValid || !dirty || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                    {/* Option to switch account if email is stored */}
                    {!showEmail && (
                      <button type="button" className="btn btn-link w-100 mt-2" onClick={() => setShowEmail(true)}>
                        <i className="fas fa-user me-2"></i>Sign in with another account
                      </button>
                    )}
                  </Form>
                )}
              </Formik>
            </div>
            <div className="card-footer text-center py-3">
              <small className="text-muted">
                Don't have an account? 
                <a href="/signup" className="text-primary text-decoration-none ms-1">Sign Up</a>
              </small>
              <br />
              <small className="text-muted">
                <a href="#" className="text-primary text-decoration-none">Forgot Password?</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;