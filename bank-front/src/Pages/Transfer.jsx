import React, { useState, useEffect } from 'react';
import PageLayout, { COLORS } from '../components/PageLayout';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ConfirmModal from '../components/ConfirmModal';
import { API_ENDPOINTS } from '../utils/api';

const Transfer = () => {
  const { user, setUser, isDarkMode } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [receivedRecipient, setReceivedRecipient] = useState(null);
  const [message, setMessage] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const prefillRecipientAccountNumber = location.state?.recipientAccountNumber || '';
  const prefillAmount = location.state?.amount || '';
  const prefillDescription = location.state?.description || '';

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

  // Look up recipient by account number
  const lookupRecipient = async (accountNumber) => {
    if (!accountNumber || accountNumber.length !== 10) {
      setReceivedRecipient(null);
      return;
    }

    setLookupLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        API_ENDPOINTS.USER(accountNumber),
        { headers: { Authorization: `Bearer ${token}` }, timeout: 8000 }
      );
      
      if (response.data.user) {
        setReceivedRecipient({
          name: `${response.data.user.firstName} ${response.data.user.lastName}`,
          accountNumber: response.data.user.accountNumber,
          found: true
        });
      }
    } catch (error) {
      setReceivedRecipient({
        name: 'Account not found',
        accountNumber,
        found: false
      });
    } finally {
      setLookupLoading(false);
    }
  };

  useEffect(() => {
    setProfileImage(user?.profileImage || '');
    if (prefillRecipientAccountNumber && prefillRecipientAccountNumber.length === 10) {
      lookupRecipient(prefillRecipientAccountNumber);
    }
  }, [user, prefillRecipientAccountNumber]);

  const handleTransfer = async (values, { resetForm }) => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Validate data before sending
      const transferData = {
        recipientAccountNumber: values.recipientAccountNumber.trim(),
        amount: parseFloat(values.amount),
        description: values.description?.trim() || 'Transfer'
      };
      
      // Log for debugging (remove in production)
      console.log('Sending transfer request:', transferData);
      console.log('API Endpoint:', API_ENDPOINTS.TRANSFER);
      console.log('Token exists:', !!token);
      
      const response = await axios.post(API_ENDPOINTS.TRANSFER, 
        transferData,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 90000 // 90 seconds
        }
      );

      console.log('Transfer response:', response.data);
      setMessage('Transfer completed successfully!');
      const updatedUser = { ...user, accountBalance: response.data.newBalance };
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      resetForm();
      setReceivedRecipient(null);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Transfer error full details:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      
      let errorMsg = 'Transfer failed. Please try again.';
      
      if (error.code === 'ECONNABORTED') {
        errorMsg = 'Request timed out. Please check your internet connection and try again.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMsg = 'Network error. Please check if the backend is accessible.';
      } else if (error.response) {
        errorMsg = error.response?.data?.message || error.response?.data?.error || errorMsg;
      }
      
      setMessage(errorMsg);
      
      // If it's a limit error, offer upgrade option
      if (errorMsg.includes('limit exceeded')) {
        setTimeout(() => {
          setUpgradeMessage(errorMsg);
          setShowUpgradePrompt(true);
        }, 500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setProfileImage(base64);
      
      const token = localStorage.getItem('token');
      try {
        const res = await axios.put(API_ENDPOINTS.PROFILE_IMAGE, 
          { image: base64 }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser({ ...user, profileImage: res.data.profileImage });
        setMessage('Profile image updated!');
        setShowImageModal(false);
        setTimeout(() => setMessage(''), 3000);
      } catch {
        setMessage('Failed to update image');
        setTimeout(() => setMessage(''), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const formatCurrency = (amount) => {
    return '₦' + (typeof amount === 'number' ? amount.toLocaleString('en-NG') : '0');
  };

  return (
    <PageLayout pageTitle="Transfer Money" pageSubtitle="Send money to your contacts">
      {/* Success/Error Message */}
      {message && (
        <div
          style={{
            background: message.includes('successfully') ? COLORS.success : COLORS.danger,
            color: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}
        >
          {message}
        </div>
      )}

      <div className="row g-4 mb-5">
        {/* Available Balance */}
        <div className="col-lg-6">

          {/* Available Balance */}
          <div
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primary}dd 100%)`,
              borderRadius: '16px',
              padding: 'clamp(16px, 3vw, 24px)',
              color: 'white',
              marginBottom: '20px'
            }}
          >
            <p className="small mb-2" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Available Balance</p>
            <h4 className="fw-bold mb-0" style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}>{formatCurrency(user?.accountBalance || 0)}</h4>
          </div>

        </div>

        {/* Transfer Form */}
        <div className="col-lg-6">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '28px',
              border: isDarkMode ? '1px solid #374151' : 'none',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              Transfer Details
            </h5>

            <Formik
              initialValues={{
                recipientAccountNumber: prefillRecipientAccountNumber,
                amount: prefillAmount,
                description: prefillDescription
              }}
              enableReinitialize
              validationSchema={transferValidationSchema}
              onSubmit={handleTransfer}
            >
              {({ isValid, dirty, errors, touched }) => (
                <Form>
                  <div className="mb-4">
                    <label className="small fw-semibold mb-2" style={{ color: COLORS.lightText }}>
                      Recipient Account Number
                    </label>
                    <Field name="recipientAccountNumber">
                      {({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="form-control"
                          placeholder="10-digit account number"
                          maxLength="10"
                          onChange={(e) => {
                            field.onChange(e);
                            lookupRecipient(e.target.value);
                          }}
                          style={{
                            background: isDarkMode ? '#374151' : COLORS.light,
                            border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                            borderRadius: '12px',
                            color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                            padding: '12px 16px'
                          }}
                        />
                      )}
                    </Field>
                    
                    {/* Recipient Lookup Display */}
                    {receivedRecipient && (
                      <div 
                        className="mt-3 p-3" 
                        style={{
                          borderRadius: '12px',
                          background: receivedRecipient.found 
                            ? (isDarkMode ? '#065F46' : '#D1FAE5')
                            : (isDarkMode ? '#7F1D1D' : '#FEE2E2'),
                          border: `1px solid ${receivedRecipient.found ? COLORS.success : COLORS.danger}`
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {receivedRecipient.found ? (
                            <span style={{ fontSize: '18px', color: COLORS.success }}>✓</span>
                          ) : (
                            <span style={{ fontSize: '18px', color: COLORS.danger }}>✕</span>
                          )}
                          <div>
                            <small 
                              style={{ 
                                color: receivedRecipient.found ? COLORS.success : COLORS.danger,
                                fontWeight: '600',
                                display: 'block',
                                marginBottom: '4px'
                              }}
                            >
                              {receivedRecipient.found ? 'Recipient Found' : 'Recipient Not Found'}
                            </small>
                            <small 
                              style={{ 
                                color: isDarkMode ? '#D1D5DB' : '#6B7280',
                                display: 'block'
                              }}
                            >
                              {receivedRecipient.name}
                            </small>
                          </div>
                        </div>
                        {lookupLoading && (
                          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px' }} />
                            <small style={{ color: isDarkMode ? '#D1D5DB' : '#6B7280' }}>Verifying...</small>
                          </div>
                        )}
                      </div>
                    )}
                    {lookupLoading && !receivedRecipient && (
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px', color: COLORS.primary }} />
                        <small style={{ color: COLORS.primary }}>Searching for recipient...</small>
                      </div>
                    )}
                    
                    {errors.recipientAccountNumber && touched.recipientAccountNumber && (
                      <div className="small mt-2" style={{ color: COLORS.danger }}>
                        {errors.recipientAccountNumber}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="small fw-semibold mb-2" style={{ color: COLORS.lightText }}>
                      Amount
                    </label>
                    <Field
                      type="number"
                      name="amount"
                      className="form-control"
                      placeholder="Enter amount"
                      min="1"
                      max={user?.accountBalance || 0}
                      style={{
                        background: isDarkMode ? '#374151' : COLORS.light,
                        border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                        borderRadius: '12px',
                        color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                        padding: '12px 16px'
                      }}
                    />
                    <small style={{ color: COLORS.lightText }} className="d-block mt-2">
                      Available: {formatCurrency(user?.accountBalance || 0)}
                    </small>
                    {errors.amount && touched.amount && (
                      <div className="small mt-2" style={{ color: COLORS.danger }}>
                        {errors.amount}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="small fw-semibold mb-2" style={{ color: COLORS.lightText }}>
                      Description
                    </label>
                    <Field
                      type="text"
                      name="description"
                      className="form-control"
                      placeholder="What's this transfer for?"
                      maxLength="100"
                      style={{
                        background: isDarkMode ? '#374151' : COLORS.light,
                        border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                        borderRadius: '12px',
                        color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                        padding: '12px 16px'
                      }}
                    />
                    {errors.description && touched.description && (
                      <div className="small mt-2" style={{ color: COLORS.danger }}>
                        {errors.description}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!isValid || !dirty || isLoading || (receivedRecipient && !receivedRecipient.found)}
                    className="btn w-100 fw-semibold"
                    style={{
                      background: COLORS.primary,
                      color: 'white',
                      borderRadius: '12px',
                      border: 'none',
                      padding: '12px',
                      opacity: (!isValid || !dirty || isLoading || (receivedRecipient && !receivedRecipient.found)) ? 0.6 : 1,
                      cursor: (!isValid || !dirty || isLoading || (receivedRecipient && !receivedRecipient.found)) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" style={{ width: '16px', height: '16px' }} />
                        Processing...
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

      {/* Image Upload Modal */}
      {showImageModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowImageModal(false)}
        >
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '400px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              Update Profile Image
            </h5>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="form-control"
              style={{
                background: isDarkMode ? '#374151' : COLORS.light,
                border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                borderRadius: '12px',
                color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                padding: '12px 16px'
              }}
            />
            <div className="d-flex gap-2 mt-4">
              <button
                className="btn w-100"
                onClick={() => setShowImageModal(false)}
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  color: isDarkMode ? '#D1D5DB' : COLORS.darkText,
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px'
                }}
              >
                Cancel
              </button>
              <button
                className="btn w-100"
                style={{
                  background: COLORS.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px'
                }}
                onClick={() => document.querySelector('input[type="file"]').click()}
              >
                Choose File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      {user?.transactions && user.transactions.length > 0 && (
        <div className="mt-5">
          <h5 className="fw-bold mb-3" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
            Transaction History
          </h5>
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '0',
              border: isDarkMode ? '1px solid #374151' : 'none',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              overflow: 'hidden'
            }}
          >
            <div className="table-responsive">
              <table className="table table-borderless mb-0">
                <thead>
                  <tr style={{ borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB' }}>
                    <th style={{ color: COLORS.lightText, fontSize: '0.875rem', fontWeight: 'semibold', padding: '16px' }}>Type</th>
                    <th style={{ color: COLORS.lightText, fontSize: '0.875rem', fontWeight: 'semibold', padding: '16px' }}>Description</th>
                    <th style={{ color: COLORS.lightText, fontSize: '0.875rem', fontWeight: 'semibold', padding: '16px' }}>Amount</th>
                    <th style={{ color: COLORS.lightText, fontSize: '0.875rem', fontWeight: 'semibold', padding: '16px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {user.transactions.slice(0, 10).map((tx, idx) => (
                    <tr key={idx} style={{ borderBottom: idx < Math.min(10, user.transactions.length) - 1 ? (isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB') : 'none' }}>
                      <td style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText, padding: '16px' }}>
                        <span
                          style={{
                            background: tx.type === 'debit' ? COLORS.danger : COLORS.success,
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {tx.type === 'debit' ? 'Sent' : 'Received'}
                        </span>
                      </td>
                      <td style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText, padding: '16px' }}>{tx.description}</td>
                      <td style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText, padding: '16px', fontWeight: 'bold' }}>
                        <span style={{ color: tx.type === 'debit' ? COLORS.danger : COLORS.success }}>
                          {tx.type === 'debit' ? '-' : '+'}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td style={{ color: COLORS.lightText, padding: '16px', fontSize: '0.875rem' }}>
                        {new Date(tx.date).toLocaleDateString('en-NG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Prompt Modal */}
      <ConfirmModal
        show={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        onConfirm={() => { setShowUpgradePrompt(false); navigate('/me'); }}
        title="Account Upgrade Recommended"
        message={upgradeMessage}
        confirmText="Upgrade Now"
        confirmColor="#F59E0B"
        isDarkMode={isDarkMode}
      />
    </PageLayout>
  );
};

export default Transfer;
