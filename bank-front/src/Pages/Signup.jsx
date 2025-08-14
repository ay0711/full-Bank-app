import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ayBankCircle from '../../image/ay bank cirlcle.png';

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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
              <p className="mb-0">Create Your Account</p>
            </div>
            <div className="card-body p-4">
              {message && (
                <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
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
                        <label htmlFor="firstName" className="form-label">First Name</label>
                        <Field
                          type="text"
                          name="firstName"
                          className="form-control"
                          placeholder="Enter first name"
                        />
                        <ErrorMessage name="firstName" component="div" className="text-danger small mt-1" />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="lastName" className="form-label">Last Name</label>
                        <Field
                          type="text"
                          name="lastName"
                          className="form-control"
                          placeholder="Enter last name"
                        />
                        <ErrorMessage name="lastName" component="div" className="text-danger small mt-1" />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email Address</label>
                      <Field
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="Enter email address"
                      />
                      <ErrorMessage name="email" component="div" className="text-danger small mt-1" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <Field
                        type="password"
                        name="password"
                        className="form-control"
                        placeholder="Enter password"
                      />
                      <ErrorMessage name="password" component="div" className="text-danger small mt-1" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                      <Field
                        type="password"
                        name="confirmPassword"
                        className="form-control"
                        placeholder="Confirm password"
                      />
                      <ErrorMessage name="confirmPassword" component="div" className="text-danger small mt-1" />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2"
                      disabled={!isValid || !dirty || isLoading}
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
            <div className="card-footer text-center py-3">
              <small className="text-muted">
                Already have an account? 
                <a href="/signin" className="text-primary text-decoration-none ms-1">Sign In</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;