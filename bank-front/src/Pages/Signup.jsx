import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ayBankCircle from '../../image/ay bank cirlcle.png';

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useAppContext();

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
    <div className={`container-fluid min-vh-100 d-flex align-items-center justify-content-center ${isDarkMode ? 'bg-dark' : ''}`} style={{background: isDarkMode ? '#121212' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="row w-100 justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="text-center flex-grow-1">
              <img src={ayBankCircle} alt="AY Bank Logo" style={{ width: 80, borderRadius: '50%' }} />
            </div>
            <button 
              className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-light'} rounded-circle`} 
              onClick={toggleTheme} 
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{ width: 45, height: 45 }}
            >
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
          </div>
          <div className={`card shadow-lg border-0 rounded-4 ${isDarkMode ? 'bg-dark text-light' : ''}`}>
            <div className={`card-header text-white text-center py-4 rounded-top-4 ${isDarkMode ? 'bg-gradient-dark' : ''}`} style={{background: isDarkMode ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)'}}>
              <h3 className="mb-0 fw-bold">
                <i className="fas fa-university me-2"></i>
                AY Bank
              </h3>
              <p className="mb-0 mt-2">Create Your Account</p>
            </div>
            <div className={`card-body p-4 ${isDarkMode ? 'bg-dark' : ''}`}>
              {message && (
                <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show rounded-3`} role="alert">
                  <i className={`fas ${message.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                  {message}
                </div>
              )}
              
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
                {({ isValid, dirty }) => (
                  <Form>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="firstName" className={`form-label fw-semibold ${isDarkMode ? 'text-light' : ''}`}>
                          <i className="fas fa-user me-2"></i>First Name
                        </label>
                        <Field
                          type="text"
                          name="firstName"
                          className={`form-control rounded-3 py-2 ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                          placeholder="Enter first name"
                        />
                        <ErrorMessage name="firstName" component="div" className="text-danger small mt-1" />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="lastName" className={`form-label fw-semibold ${isDarkMode ? 'text-light' : ''}`}>
                          <i className="fas fa-user me-2"></i>Last Name
                        </label>
                        <Field
                          type="text"
                          name="lastName"
                          className={`form-control rounded-3 py-2 ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                          placeholder="Enter last name"
                        />
                        <ErrorMessage name="lastName" component="div" className="text-danger small mt-1" />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="email" className={`form-label fw-semibold ${isDarkMode ? 'text-light' : ''}`}>
                        <i className="fas fa-envelope me-2"></i>Email Address
                      </label>
                      <Field
                        type="email"
                        name="email"
                        className={`form-control rounded-3 py-2 ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                        placeholder="Enter email address"
                      />
                      <ErrorMessage name="email" component="div" className="text-danger small mt-1" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className={`form-label fw-semibold ${isDarkMode ? 'text-light' : ''}`}>
                        <i className="fas fa-lock me-2"></i>Password
                      </label>
                      <Field
                        type="password"
                        name="password"
                        className={`form-control rounded-3 py-2 ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                        placeholder="Enter password"
                      />
                      <ErrorMessage name="password" component="div" className="text-danger small mt-1" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className={`form-label fw-semibold ${isDarkMode ? 'text-light' : ''}`}>
                        <i className="fas fa-lock me-2"></i>Confirm Password
                      </label>
                      <Field
                        type="password"
                        name="confirmPassword"
                        className={`form-control rounded-3 py-2 ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                        placeholder="Confirm password"
                      />
                      <ErrorMessage name="confirmPassword" component="div" className="text-danger small mt-1" />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2 rounded-3 fw-semibold shadow-sm"
                      disabled={!isValid || !dirty || isLoading}
                      style={{background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)', border: 'none'}}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
            <div className={`card-footer text-center py-3 border-0 rounded-bottom-4 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
              <small className={isDarkMode ? 'text-light' : 'text-muted'}>
                Already have an account? 
                <Link to="/signin" className={`text-decoration-none ms-1 fw-semibold ${isDarkMode ? 'text-primary' : 'text-primary'}`}>Sign In</Link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;