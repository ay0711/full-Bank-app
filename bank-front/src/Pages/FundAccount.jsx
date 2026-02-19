import React, { useState } from 'react';
import PageLayout, { COLORS } from '../components/PageLayout';
import { useAppContext } from '../context/AppContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const FundAccount = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode, user, setUser } = useAppContext();

  const paymentMethods = [
    { id: 'card', label: 'Debit Card', icon: '💳', description: 'Visa, Mastercard, Verve' },
    { id: 'bank', label: 'Bank Transfer', icon: '🏦', description: 'Direct bank transfer' },
    { id: 'ussd', label: 'USSD', icon: '📱', description: '*371#' },
    { id: 'mobile', label: 'Mobile Money', icon: '📲', description: 'Airtel, MTN, 9mobile' }
  ];

  const validationSchema = Yup.object({
    amount: Yup.number()
      .positive('Amount must be positive')
      .required('Amount is required')
      .min(100, 'Minimum funding amount is ₦100')
      .max(10000000, 'Maximum transaction limit is ₦10,000,000'),
    paymentMethod: Yup.string().required('Please select a payment method')
  });

  const handleFund = async (values, { resetForm }) => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://full-bank-app.onrender.com/api/banking/fund',
        {
          amount: parseFloat(values.amount),
          paymentMethod: values.paymentMethod
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Funding successful! Balance updated.');
      const updatedUser = { ...user, accountBalance: response.data.newBalance };
      setUser(updatedUser);
      resetForm();
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Funding failed. Please try again.');
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return '₦' + (typeof amount === 'number' ? amount.toLocaleString('en-NG') : '0');
  };

  return (
    <PageLayout pageTitle="Fund Account" pageSubtitle="Add money to your account">
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
        {/* Funding Form */}
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
              Add Funds to Account
            </h5>

            <Formik
              initialValues={{
                amount: '',
                paymentMethod: 'card'
              }}
              validationSchema={validationSchema}
              onSubmit={handleFund}
            >
              {({ errors, touched, isValid, dirty, values }) => (
                <Form>
                  <div className="mb-4">
                    <label className="small fw-semibold mb-3 d-block" style={{ color: COLORS.lightText }}>
                      Choose Payment Method
                    </label>
                    <div className="row g-2 g-md-3">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="col-6 col-sm-6">
                          <label style={{ cursor: 'pointer', width: '100%' }}>
                            <div
                              style={{
                                background: values.paymentMethod === method.id ? COLORS.primary : (isDarkMode ? '#374151' : COLORS.light),
                                border: values.paymentMethod === method.id ? `2px solid ${COLORS.primary}` : 'none',
                                borderRadius: '12px',
                                padding: 'clamp(12px, 3vw, 16px)',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                minHeight: '80px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <div style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', marginBottom: '8px' }} aria-hidden="true">{method.icon}</div>
                              <p
                                className="small fw-semibold mb-0"
                                style={{ 
                                  color: values.paymentMethod === method.id ? 'white' : (isDarkMode ? '#D1D5DB' : COLORS.darkText),
                                  fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
                                }}
                              >
                                {method.label}
                              </p>
                            </div>
                            <Field
                              type="radio"
                              name="paymentMethod"
                              value={method.id}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.paymentMethod && touched.paymentMethod && (
                      <div className="small mt-2" style={{ color: COLORS.danger }}>
                        {errors.paymentMethod}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="fund-amount" className="small fw-semibold mb-2 d-block" style={{ color: COLORS.lightText }}>
                      Amount *
                    </label>
                    <Field
                      id="fund-amount"
                      type="number"
                      name="amount"
                      className="form-control"
                      placeholder="Enter amount"
                      min="100"
                      style={{
                        background: isDarkMode ? '#374151' : COLORS.light,
                        border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                        borderRadius: '12px',
                        color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                        padding: '12px 16px'
                      }}
                    />
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
                      background: COLORS.success,
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
                        <i className="fas fa-plus me-2"></i>
                        Continue to Payment
                      </>
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-lg-6">
          <h5 className="fw-bold mb-3" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
            Quick Top-ups
          </h5>
          <div className="row g-3 mb-5">
            {[5000, 10000, 20000, 50000].map((quickAmount) => (
              <div key={quickAmount} className="col-6">
                <button
                  onClick={() => {
                    document.getElementById('fund-amount').value = quickAmount;
                    document.getElementById('fund-amount').dispatchEvent(new Event('input', { bubbles: true }));
                  }}
                  style={{
                    background: isDarkMode ? '#1F2937' : COLORS.card,
                    border: isDarkMode ? '1px solid #374151' : 'none',
                    borderRadius: '12px',
                    padding: '20px',
                    width: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = isDarkMode ? 'none' : '0 8px 16px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)';
                  }}
                >
                  <p className="fw-bold mb-0" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText, fontSize: '0.9rem' }}>
                    {formatCurrency(quickAmount)}
                  </p>
                  <p className="small mb-0" style={{ color: COLORS.lightText }}>
                    Quick Top-up
                  </p>
                </button>
              </div>
            ))}
          </div>

          {/* Payment Methods Info */}
          <h5 className="fw-bold mb-3" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
            Payment Methods Info
          </h5>
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              style={{
                background: isDarkMode ? '#1F2937' : COLORS.light,
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                border: isDarkMode ? '1px solid #374151' : 'none'
              }}
            >
              <p className="small mb-1" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                <span style={{ fontSize: '1.2rem', marginRight: '8px' }} aria-hidden="true">{method.icon}</span>
                <strong>{method.label}</strong>
              </p>
              <p className="small mb-0" style={{ color: COLORS.lightText }}>
                {method.description}
              </p>
            </div>
          ))}

          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.light,
              borderRadius: '16px',
              padding: '20px',
              marginTop: '24px',
              border: isDarkMode ? '1px solid #374151' : 'none'
            }}
          >
            <h6 className="fw-bold mb-2" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              💡 Tip
            </h6>
            <p className="small mb-0" style={{ color: COLORS.lightText }}>
              Debit card funding is instant. Bank transfers may take 1-24 hours. USSD and mobile money are usually instant.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default FundAccount;
