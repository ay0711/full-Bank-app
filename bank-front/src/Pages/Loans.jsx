import React, { useState, useEffect } from 'react';
import PageLayout, { COLORS } from '../components/PageLayout';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/api';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [applyAmount, setApplyAmount] = useState('');
  const [applyDuration, setApplyDuration] = useState('');
  const [applyReason, setApplyReason] = useState('');
  const [applyMessage, setApplyMessage] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const { isDarkMode } = useAppContext();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_ENDPOINTS.LOANS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoans(response.data.loans || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
      // Keep empty array if no data
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return '₦' + amount.toLocaleString('en-NG');
  };

  const openApplyModal = (loan) => {
    setSelectedLoan(loan);
    setApplyAmount(loan.minAmount?.toString() || '');
    setApplyDuration(loan.duration?.toString() || '');
    setApplyReason('');
    setApplyMessage('');
    setShowApplyModal(true);
  };

  const submitLoanApplication = async (e) => {
    e.preventDefault();
    if (!selectedLoan) return;

    const amountValue = Number(applyAmount);
    const durationValue = Number(applyDuration);

    if (!amountValue || !durationValue) {
      setApplyMessage('Amount and duration are required');
      return;
    }

    if (amountValue < selectedLoan.minAmount || amountValue > selectedLoan.maxAmount) {
      setApplyMessage('Amount must be within the allowed range');
      return;
    }

    setApplyLoading(true);
    setApplyMessage('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        API_ENDPOINTS.LOAN_APPLY,
        {
          loanId: selectedLoan.id,
          amount: amountValue,
          duration: durationValue,
          reason: applyReason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplyMessage('Loan application submitted successfully');
      setTimeout(() => {
        setShowApplyModal(false);
      }, 1200);
    } catch (error) {
      setApplyMessage('Failed to submit loan application');
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <PageLayout pageTitle="Loans" pageSubtitle="Browse and apply for loans tailored to your needs">
      {/* Loan Offers */}
      <div className="row g-4 mb-5">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : loans.length === 0 ? (
          <div className="col-12 text-center py-5">
            <i className="fas fa-inbox fa-3x mb-3" style={{ color: COLORS.lightText }}></i>
            <h5 style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>No loans available</h5>
          </div>
        ) : (
          loans.map((loan) => (
            <div key={loan.id} className="col-lg-6 col-xl-4">
              <div
                style={{
                  background: isDarkMode ? '#1F2937' : COLORS.card,
                  borderRadius: '16px',
                  padding: '28px',
                  boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                  border: isDarkMode ? '1px solid #374151' : 'none',
                  transition: 'all 0.3s ease'
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
                <h5 className="fw-bold mb-3" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                  {loan.name}
                </h5>

                <div className="mb-3">
                  <div className="small" style={{ color: COLORS.lightText }}>Amount Range</div>
                  <div className="fw-semibold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                    {formatCurrency(loan.minAmount)} - {formatCurrency(loan.maxAmount)}
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="small" style={{ color: COLORS.lightText }}>Interest Rate</div>
                    <div className="fw-semibold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                      {loan.interestRate}% p.a.
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="small" style={{ color: COLORS.lightText }}>Duration</div>
                    <div className="fw-semibold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                      {loan.duration} months
                    </div>
                  </div>
                </div>

                <button
                  className="btn w-100 fw-semibold"
                  style={{
                    background: COLORS.primary,
                    color: 'white',
                    borderRadius: '12px',
                    border: 'none',
                    padding: '12px',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => openApplyModal(loan)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#3730A3';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = COLORS.primary;
                  }}
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showApplyModal && selectedLoan && (
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
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setShowApplyModal(false)}
        >
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '28px',
              width: '100%',
              maxWidth: '520px',
              border: isDarkMode ? '1px solid #374151' : 'none'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                Apply for {selectedLoan.name}
              </h5>
              <button
                onClick={() => setShowApplyModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: isDarkMode ? '#9CA3AF' : COLORS.lightText }}
              >
                ×
              </button>
            </div>

            {applyMessage && (
              <div
                style={{
                  background: applyMessage.includes('successfully') ? COLORS.success : COLORS.danger,
                  color: 'white',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '16px'
                }}
              >
                {applyMessage}
              </div>
            )}

            <form onSubmit={submitLoanApplication}>
              <div className="mb-3">
                <label className="small fw-semibold mb-2" style={{ color: COLORS.lightText }}>
                  Amount (min {formatCurrency(selectedLoan.minAmount)} - max {formatCurrency(selectedLoan.maxAmount)})
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={applyAmount}
                  onChange={(e) => setApplyAmount(e.target.value)}
                  min={selectedLoan.minAmount}
                  max={selectedLoan.maxAmount}
                  required
                  style={{
                    background: isDarkMode ? '#374151' : COLORS.light,
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                    padding: '12px 16px'
                  }}
                />
              </div>

              <div className="mb-3">
                <label className="small fw-semibold mb-2" style={{ color: COLORS.lightText }}>
                  Duration (months)
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={applyDuration}
                  onChange={(e) => setApplyDuration(e.target.value)}
                  min="1"
                  required
                  style={{
                    background: isDarkMode ? '#374151' : COLORS.light,
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                    padding: '12px 16px'
                  }}
                />
              </div>

              <div className="mb-4">
                <label className="small fw-semibold mb-2" style={{ color: COLORS.lightText }}>
                  Reason (optional)
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={applyReason}
                  onChange={(e) => setApplyReason(e.target.value)}
                  style={{
                    background: isDarkMode ? '#374151' : COLORS.light,
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                    padding: '12px 16px'
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn w-100 fw-semibold"
                disabled={applyLoading}
                style={{
                  background: COLORS.primary,
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  padding: '12px',
                  opacity: applyLoading ? 0.6 : 1,
                  cursor: applyLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {applyLoading ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* How it works */}
      <div
        style={{
          background: isDarkMode ? '#1F2937' : COLORS.card,
          borderRadius: '16px',
          padding: '28px',
          boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
          border: isDarkMode ? '1px solid #374151' : 'none'
        }}
      >
        <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
          How to Apply
        </h5>
        <div className="row g-4">
          {[
            { num: 1, title: 'Choose Loan', desc: 'Select a loan product that suits your needs' },
            { num: 2, title: 'Fill Details', desc: 'Provide your personal and financial information' },
            { num: 3, title: 'Get Approved', desc: 'We review and approve your application' },
            { num: 4, title: 'Receive Funds', desc: 'Get your loan disbursed directly to your account' }
          ].map((step) => (
            <div key={step.num} className="col-md-6">
              <div className="d-flex gap-3">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: COLORS.primary,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  {step.num}
                </div>
                <div>
                  <div className="fw-semibold" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                    {step.title}
                  </div>
                  <div className="small" style={{ color: COLORS.lightText }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default Loans;
