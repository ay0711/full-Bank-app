import React, { useState } from 'react';
import PageLayout, { COLORS } from '../components/PageLayout';
import { useAppContext } from '../context/AppContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const Withdraw = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode, user, setUser } = useAppContext();

  const validationSchema = Yup.object({
    amount: Yup.number()
      .positive('Amount must be positive')
      .required('Amount is required')
      .min(1000, 'Minimum withdrawal is ₦1,000')
      .max(user?.accountBalance || 0, 'Insufficient balance'),
    accountType: Yup.string().required('Please select withdrawal type')
  });

  const handleWithdraw = async (values, { resetForm }) => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://full-bank-app.onrender.com/api/banking/withdraw',
        {
          amount: parseFloat(values.amount),
          withdrawalType: values.accountType
        },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 8000 }
      );

      setMessage('Withdrawal successful! Check your account.');
      const updatedUser = { ...user, accountBalance: response.data.newBalance };
      setUser(updatedUser);
      resetForm();
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Withdrawal failed. Please try again.');
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return '₦' + (typeof amount === 'number' ? amount.toLocaleString('en-NG') : '0');
  };

  return (
    <PageLayout pageTitle="Withdraw Funds" pageSubtitle="Withdraw money from your account">
      {message && (
        <div
          style={{
            background: message.includes('successful') ? COLORS.success : COLORS.danger,
            color: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}
        >
          {message}
        </div>
      )}

      <div className="row g-4">
        {/* Withdrawal Form */}
        <div className="col-lg-6">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: 'clamp(20px, 4vw, 28px)',
              border: isDarkMode ? '1px solid #374151' : 'none',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              Withdraw Money
            </h5>

            <Formik
              initialValues={{
                amount: '',
                accountType: 'bank'
              }}
              validationSchema={validationSchema}
              onSubmit={handleWithdraw}
            >
              {({ errors, touched, isValid, dirty, values }) => (
                <Form>
                  <div className="mb-4">
                    <label className="small fw-semibold mb-2 d-block" style={{ color: COLORS.lightText }}>
                      Withdrawal Type
                    </label>
                    <div className="d-flex gap-2 flex-wrap">
                      {['bank', 'atm'].map((type) => (
                        <label key={type} style={{ cursor: 'pointer', flex: '1 1 120px', minWidth: '100px' }}>
                          <div
                            style={{
                              background: values.accountType === type ? COLORS.primary : (isDarkMode ? '#374151' : COLORS.light),
                              border: values.accountType === type ? `2px solid ${COLORS.primary}` : 'none',
                              borderRadius: '12px',
                              padding: '12px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <p
                              className="small fw-semibold mb-0"
                              style={{ color: values.accountType === type ? 'white' : (isDarkMode ? '#D1D5DB' : COLORS.darkText) }}
                            >
                              {type === 'bank' ? '🏦 Bank Transfer' : '🏧 ATM'}
                            </p>
                          </div>
                          <Field
                            type="radio"
                            name="accountType"
                            value={type}
                            style={{ display: 'none' }}
                          />
                        </label>
                      ))}
                    </div>
                    {errors.accountType && touched.accountType && (
                      <div className="small mt-2" style={{ color: COLORS.danger }}>
                        {errors.accountType}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="withdraw-amount" className="small fw-semibold mb-2 d-block" style={{ color: COLORS.lightText }}>
                      Amount *
                    </label>
                    <Field
                      id="withdraw-amount"
                      type="number"
                      name="amount"
                      className="form-control"
                      placeholder="Enter amount"
                      min="1000"
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

                  <button
                    type="submit"
                    disabled={!isValid || !dirty || loading}
                    className="btn w-100 fw-semibold"
                    style={{
                      background: COLORS.primary,
                      color: 'white',
                      borderRadius: '12px',
                      border: 'none',
                      padding: '12px',
                      opacity: (!isValid || !dirty || loading) ? 0.6 : 1,
                      cursor: (!isValid || !dirty || loading) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" style={{ width: '16px', height: '16px' }} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-arrow-down me-2"></i>
                        Proceed
                      </>
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>

        {/* Info Cards */}
        <div className="col-lg-6">
          <div className="row g-3">
            <div className="col-12">
              <div
                style={{
                  background: isDarkMode ? '#1F2937' : COLORS.card,
                  borderRadius: '16px',
                  padding: '20px',
                  border: isDarkMode ? '1px solid #374151' : 'none',
                  boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <div className="d-flex align-items-start">
                  <div style={{ fontSize: '2rem', marginRight: '16px' }} aria-hidden="true">📊</div>
                  <div>
                    <h6 className="fw-bold mb-2" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                      Daily Limit
                    </h6>
                    <p className="small mb-0" style={{ color: COLORS.lightText }}>
                      {formatCurrency(5000000)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div
                style={{
                  background: isDarkMode ? '#1F2937' : COLORS.card,
                  borderRadius: '16px',
                  padding: '20px',
                  border: isDarkMode ? '1px solid #374151' : 'none',
                  boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <div className="d-flex align-items-start">
                  <div style={{ fontSize: '2rem', marginRight: '16px' }} aria-hidden="true">⏱️</div>
                  <div>
                    <h6 className="fw-bold mb-2" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                      Processing Time
                    </h6>
                    <p className="small mb-0" style={{ color: COLORS.lightText }}>
                      Instant for ATM, 1-3 hours for bank transfer
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div
                style={{
                  background: isDarkMode ? '#1F2937' : COLORS.card,
                  borderRadius: '16px',
                  padding: '20px',
                  border: isDarkMode ? '1px solid #374151' : 'none',
                  boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <div className="d-flex align-items-start">
                  <div style={{ fontSize: '2rem', marginRight: '16px' }} aria-hidden="true">💰</div>
                  <div>
                    <h6 className="fw-bold mb-2" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                      Withdrawal Charges
                    </h6>
                    <p className="small mb-0" style={{ color: COLORS.lightText }}>
                      ₦50 flat fee for all withdrawals
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Withdraw;
