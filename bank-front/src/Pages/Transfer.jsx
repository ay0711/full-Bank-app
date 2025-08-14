import React, { useState } from 'react';
import SloganSplash from '../components/SloganSplash';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Transfer = () => {
  const [recentRecipients, setRecentRecipients] = useState([]);
  const { user, setUser, isDarkMode } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const navigate = useNavigate();

  const transferValidationSchema = Yup.object({
    recipientAccountNumber: Yup.string()
      .required('Recipient account number is required')
      .matches(/^\d{10}$/, 'Account number must be 10 digits'),
    amount: Yup.number()
      .positive('Amount must be positive')
      .required('Amount is required')
      .min(1, 'Minimum transfer amount is ₦1')
      .max(user?.accountBalance || 0, 'Amount exceeds available balance'),
    description: Yup.string()
      .required('Description is required')
      .max(100, 'Description must be less than 100 characters')
  });

  const handleTransfer = async (values, { resetForm }) => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
  const response = await axios.post('https://full-bank-app.onrender.com/api/banking/transfer', {
        recipientAccountNumber: values.recipientAccountNumber,
        amount: parseFloat(values.amount),
        description: values.description
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Transfer completed successfully!');
      
      // Update user balance
      const updatedUser = { ...user, accountBalance: response.data.newBalance };
      setUser(updatedUser);
      
      resetForm();
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      setMessage(error.response?.data?.message || 'Transfer failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  // Fetch profile image on mount
  React.useEffect(() => {
    setProfileImage(user?.profileImage || '');
  }, [user]);

  if (isLoading) {
    return <SloganSplash />;
  }

  return (
    <div className={`min-vh-100 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-dark border-secondary' : 'bg-white border-light'} border-bottom sticky-top`}>
        <div className="container py-3">
          <div className="d-flex align-items-center">
            <button 
              className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'} me-3`}
              onClick={() => navigate('/dashboard')}
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <h4 className={`mb-0 ${isDarkMode ? 'text-light' : 'text-dark'}`}>Transfer Money</h4>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {message && (
          <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
            {message}
            <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
          </div>
        )}

        {/* Profile Avatar Card */}
        <div className="row mb-4 justify-content-center">
          <div className="col-md-6">
            <div className={`card shadow-sm ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white'}`}
              style={{ borderRadius: '1.5rem', position: 'relative' }}>
              <div className="card-body text-center">
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={profileImage || '/public/vite.svg'}
                    alt="avatar"
                    className="rounded-circle border"
                    style={{ width: 80, height: 80, objectFit: 'cover', border: '3px solid #00C853' }}
                  />
                  <span
                    style={{ position: 'absolute', right: 0, bottom: 0, background: '#00C853', borderRadius: '50%', padding: 6, cursor: 'pointer' }}
                    onClick={() => setShowModal(true)}
                  >
                    <i className="fas fa-camera text-white"></i>
                  </span>
                </div>
                <h6 className="mt-3 mb-0">{user?.firstName} {user?.lastName}</h6>
                <small className="text-muted">{user?.accountNumber}</small>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for image upload */}
        {showModal && (
          <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Profile Image</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <input type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      const base64 = reader.result;
                      setProfileImage(base64);
                      // Send to backend
                      const token = localStorage.getItem('token');
                      try {
                        const res = await axios.put('https://full-bank-app.onrender.com/api/auth/profile-image', { image: base64 }, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        setUser({ ...user, profileImage: res.data.profileImage });
                        setMessage('Profile image updated!');
                        setShowModal(false);
                      } catch {
                        setMessage('Failed to update image');
                      }
                    };
                    reader.readAsDataURL(file);
                  }} />
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Balance Card */}
        <div className="row mb-4">
          <div className="col-12">
            <div className={`card ${isDarkMode ? 'bg-secondary text-light' : 'bg-primary text-white'}`} style={{ borderRadius: '1.5rem' }}>
              <div className="card-body text-center">
                <h6 className="card-subtitle mb-2 opacity-75">Available Balance</h6>
                <h3 className="card-title mb-0">{formatCurrency(user?.accountBalance || 0)}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row mb-4 justify-content-center">
          <div className="col-md-6">
            <div className="d-flex justify-content-between">
              <button className="btn btn-success rounded-pill px-4" onClick={() => navigate('/fund-account')}>
                <i className="fas fa-plus me-2"></i>Fund Account
              </button>
              <button className="btn btn-outline-success rounded-pill px-4" onClick={() => navigate('/withdraw')}>
                <i className="fas fa-arrow-down me-2"></i>Withdraw
              </button>
              <button className="btn btn-outline-success rounded-pill px-4" onClick={() => navigate('/savings')}>
                <i className="fas fa-piggy-bank me-2"></i>Savings
              </button>
            </div>
          </div>
        </div>

        {/* Recent Recipients */}
        <div className="row mb-4 justify-content-center">
          <div className="col-md-6">
            <div className={`card shadow-sm ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white'}`} style={{ borderRadius: '1.5rem' }}>
              <div className="card-body">
                <h6 className="mb-3">Recent Recipients</h6>
                <div className="d-flex flex-wrap gap-2">
                  {recentRecipients.length === 0 ? (
                    <span className="text-muted">No recent recipients</span>
                  ) : (
                    recentRecipients.map((r, idx) => (
                      <button key={idx} className="btn btn-outline-success rounded-pill" style={{ minWidth: 120 }}
                        onClick={() => navigate(`/transfer?recipient=${r.accountNumber}`)}>
                        <i className="fas fa-user me-2"></i>{r.name || r.accountNumber}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Form */}
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className={`card ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white'}`} style={{ borderRadius: '1.5rem' }}>
              <div className="card-body">
                <Formik
                  initialValues={{
                    recipientAccountNumber: '',
                    amount: '',
                    description: ''
                  }}
                  validationSchema={transferValidationSchema}
                  onSubmit={handleTransfer}
                >
                  {({ isValid, dirty }) => (
                    <Form>
                      <div className="mb-3">
                        <label htmlFor="recipientAccountNumber" className="form-label">
                          <i className="fas fa-user me-2"></i>
                          Recipient Account Number
                        </label>
                        <Field
                          type="text"
                          name="recipientAccountNumber"
                          className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                          placeholder="Enter 10-digit account number"
                          maxLength="10"
                        />
                        <ErrorMessage name="recipientAccountNumber" component="div" className="text-danger small mt-1" />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="amount" className="form-label">
                          <i className="fas fa-naira-sign me-2"></i>
                          Amount
                        </label>
                        <Field
                          type="number"
                          name="amount"
                          className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                          placeholder="Enter amount"
                          min="1"
                          max={user?.accountBalance || 0}
                        />
                        <ErrorMessage name="amount" component="div" className="text-danger small mt-1" />
                        <small className={`${isDarkMode ? 'text-light' : 'text-muted'}`}>
                          Available: {formatCurrency(user?.accountBalance || 0)}
                        </small>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="description" className="form-label">
                          <i className="fas fa-comment me-2"></i>
                          Description
                        </label>
                        <Field
                          type="text"
                          name="description"
                          className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                          placeholder="What's this transfer for?"
                          maxLength="100"
                        />
                        <ErrorMessage name="description" component="div" className="text-danger small mt-1" />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-success w-100 py-3 rounded-pill"
                        disabled={!isValid || !dirty || isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Processing Transfer...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane me-2"></i>
                            Send Money
                          </>
                        )}
                      </button>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="row mt-5 justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className={`card shadow-sm ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white'}`} style={{ borderRadius: '1.5rem' }}>
              <div className="card-body">
                <h6 className="mb-3">Transaction History</h6>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {(user?.transactions || []).slice(0, 10).map((tx, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <span className={`badge ${tx.type === 'debit' ? 'bg-danger' : 'bg-success'} me-2`}>
                          {tx.type === 'debit' ? 'Sent' : 'Received'}
                        </span>
                        <span>{tx.description}</span>
                      </div>
                      <div>
                        <span className="fw-bold">{formatCurrency(tx.amount)}</span>
                        <span className="ms-2 text-muted" style={{ fontSize: 12 }}>{new Date(tx.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {(!user?.transactions || user.transactions.length === 0) && (
                    <span className="text-muted">No transactions yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transfer;
