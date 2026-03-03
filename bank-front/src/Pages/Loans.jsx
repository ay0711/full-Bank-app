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
  const [loanApplications, setLoanApplications] = useState([]);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayMessage, setRepayMessage] = useState('');
  const [repayLoading, setRepayLoading] = useState(false);
  const [creditScore, setCreditScore] = useState(500);
  const [loanLimit, setLoanLimit] = useState(50000);
  const [hasActiveLoan, setHasActiveLoan] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const { isDarkMode, user, setUser } = useAppContext();

  useEffect(() => {
    fetchLoans();
    if (user?.loanApplications) {
      setLoanApplications(user.loanApplications);
    }
  }, [user]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_ENDPOINTS.LOANS, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      if (response.data.loans) {
        setLoans(response.data.loans);
      }
      setCreditScore(response.data.creditScore || 500);
      setLoanLimit(response.data.loanLimit || 50000);
      setHasActiveLoan(response.data.hasActiveLoan || false);
    } catch (error) {
      setLoans([
        { id: 1, name: 'Personal Loan', minAmount: 50000, maxAmount: 500000, interestRate: 12, duration: 24, icon: '💰' },
        { id: 2, name: 'Business Loan', minAmount: 100000, maxAmount: 5000000, interestRate: 10, duration: 36, icon: '💼' },
        { id: 3, name: 'Emergency Loan', minAmount: 20000, maxAmount: 200000, interestRate: 15, duration: 12, icon: '⚡' },
        { id: 4, name: 'Education Loan', minAmount: 50000, maxAmount: 2000000, interestRate: 9, duration: 48, icon: '🎓' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return '₦' + amount.toLocaleString('en-NG');
  };

  const calculateRepayment = (amount, rate, months) => {
    const principal = amount;
    const r = rate / 100 / 12;
    const n = months;
    
    if (r === 0) {
      return { monthly: Math.round(principal / n), total: principal, interest: 0 };
    }
    
    const monthly = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = monthly * n;
    const interest = total - principal;
    
    return {
      monthly: Math.round(monthly),
      total: Math.round(total),
      interest: Math.round(interest)
    };
  };

  const getApprovalBadge = (score) => {
    if (score >= 750) return { text: 'Instant', color: '#10B981', emoji: '⚡' };
    if (score >= 650) return { text: 'Quick', color: '#3B82F6', emoji: '✓' };
    if (score >= 500) return { text: 'Standard', color: '#F59E0B', emoji: '📋' };
    return { text: 'Review', color: '#EF4444', emoji: '⏱' };
  };

  const openApplyModal = (loan, quickAmount = null) => {
    setSelectedLoan(loan);
    setApplyAmount(quickAmount ? quickAmount.toString() : loan.minAmount?.toString() || '');
    setApplyDuration(loan.duration?.toString() || '12');
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
      setApplyMessage(`Amount must be between ${formatCurrency(selectedLoan.minAmount)} and ${formatCurrency(selectedLoan.maxAmount)}`);
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
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
      );
      setApplyMessage('✓ Application submitted successfully');
      setTimeout(async () => {
        setShowApplyModal(false);
        const response = await axios.get(API_ENDPOINTS.DASHBOARD, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });
        if (response.data.user) setUser(response.data.user);
      }, 1200);
    } catch (error) {
      setApplyMessage(error.response?.data?.message || 'Application failed');
    } finally {
      setApplyLoading(false);
    }
  };

  const openRepayModal = (application) => {
    const remaining = application.amount - (application.totalRepaid || 0);
    setSelectedApplication(application);
    setRepayAmount(Math.min(remaining, 10000).toString());
    setRepayMessage('');
    setShowRepayModal(true);
  };

  const submitRepayment = async (e) => {
    e.preventDefault();
    if (!selectedApplication) return;

    const repayValue = Number(repayAmount);
    const remaining = selectedApplication.amount - (selectedApplication.totalRepaid || 0);

    if (!repayValue || repayValue <= 0) {
      setRepayMessage('Enter a valid amount');
      return;
    }

    if (repayValue > remaining) {
      setRepayMessage(`Maximum: ${formatCurrency(remaining)}`);
      return;
    }

    setRepayLoading(true);
    setRepayMessage('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        API_ENDPOINTS.LOAN_REPAY(selectedApplication._id),
        { amount: repayValue },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
      );
      setRepayMessage('✓ Repayment successful');
      setTimeout(async () => {
        setShowRepayModal(false);
        const response = await axios.get(API_ENDPOINTS.DASHBOARD, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });
        if (response.data.user) setUser(response.data.user);
      }, 1200);
    } catch (error) {
      setRepayMessage(error.response?.data?.message || 'Repayment failed');
    } finally {
      setRepayLoading(false);
    }
  };

  const deleteLoanApplication = async (applicationId) => {
    if (!confirm('Are you sure you want to delete this loan application?')) {
      return;
    }

    setDeleteLoading(applicationId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_ENDPOINTS.LOANS}/${applicationId}`,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
      );
      
      // Refresh user data
      const response = await axios.get(API_ENDPOINTS.DASHBOARD, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });
      if (response.data.user) {
        setUser(response.data.user);
        setLoanApplications(response.data.user.loanApplications || []);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete application');
    } finally {
      setDeleteLoading(null);
    }
  };

  const badge = getApprovalBadge(creditScore);
  const activeLoan = loanApplications.find(app => ['approved', 'partial-repayment', 'pending'].includes(app.status));
  const lowestRate = loans.length > 0 ? Math.min(...loans.map(l => l.interestRate || 12)) : 8;

  return (
    <PageLayout pageTitle="Loans" pageSubtitle="Fast & flexible loans">
      {/* Hero Card - Okash Style */}
      <div className="row justify-content-center mb-4">
        <div className="col-xl-5 col-lg-6 col-md-8">
          <div
            style={{
              background: isDarkMode
                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              borderRadius: '24px',
              padding: '28px 24px',
              color: '#FFFFFF',
              boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative circles */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.06)'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: 500 }}>
                    Hi {user?.firstName || 'there'} 👋
                  </div>
                  <div className="fw-bold" style={{ fontSize: '1.1rem', marginTop: '4px' }}>
                    Get instant cash
                  </div>
                </div>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {badge.emoji} {badge.text}
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', opacity: 0.92, marginBottom: '6px' }}>
                You can borrow up to
              </div>
              <div className="fw-bold mb-4" style={{ fontSize: '2.25rem', lineHeight: 1, letterSpacing: '-0.5px' }}>
                {formatCurrency(loanLimit)}
              </div>

              <div className="row g-2 mb-4">
                <div className="col-4">
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '12px 8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.85, marginBottom: '4px' }}>Score</div>
                    <div className="fw-bold" style={{ fontSize: '1.1rem' }}>{creditScore}</div>
                  </div>
                </div>
                <div className="col-4">
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '12px 8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.85, marginBottom: '4px' }}>From</div>
                    <div className="fw-bold" style={{ fontSize: '1.1rem' }}>{lowestRate}%</div>
                  </div>
                </div>
                <div className="col-4">
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '12px 8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.85, marginBottom: '4px' }}>Status</div>
                    <div className="fw-bold" style={{ fontSize: '1.1rem' }}>
                      {hasActiveLoan ? '1' : '0'}
                    </div>
                  </div>
                </div>
              </div>

              <button
                className="btn w-100 fw-bold"
                style={{
                  background: '#FFFFFF',
                  color: '#059669',
                  borderRadius: '999px',
                  border: 'none',
                  padding: '14px',
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => {
                  if (hasActiveLoan) {
                    setApplyMessage('Repay your active loan first');
                    setTimeout(() => setApplyMessage(''), 3000);
                  } else if (loans[0]) {
                    openApplyModal(loans[0]);
                  }
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {hasActiveLoan ? 'Repay Active Loan' : 'Get Loan Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div style={{
            background: isDarkMode ? '#1F2937' : '#ECFDF5',
            borderRadius: '16px',
            padding: '16px',
            border: isDarkMode ? '1px solid #374151' : '1px solid #A7F3D0'
          }}>
            <div className="fw-semibold mb-1" style={{ color: isDarkMode ? '#F3F4F6' : '#065F46', fontSize: '0.95rem' }}>
              ⚡ Quick approval
            </div>
            <div className="small" style={{ color: isDarkMode ? '#9CA3AF' : '#047857' }}>
              Get approved in minutes with our smart system
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div style={{
            background: isDarkMode ? '#1F2937' : '#ECFDF5',
            borderRadius: '16px',
            padding: '16px',
            border: isDarkMode ? '1px solid #374151' : '1px solid #A7F3D0'
          }}>
            <div className="fw-semibold mb-1" style={{ color: isDarkMode ? '#F3F4F6' : '#065F46', fontSize: '0.95rem' }}>
              💸 Flexible repayment
            </div>
            <div className="small" style={{ color: isDarkMode ? '#9CA3AF' : '#047857' }}>
              Pay at your own pace with no hidden charges
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div style={{
            background: isDarkMode ? '#1F2937' : '#ECFDF5',
            borderRadius: '16px',
            padding: '16px',
            border: isDarkMode ? '1px solid #374151' : '1px solid #A7F3D0'
          }}>
            <div className="fw-semibold mb-1" style={{ color: isDarkMode ? '#F3F4F6' : '#065F46', fontSize: '0.95rem' }}>
              🔒 100% secure
            </div>
            <div className="small" style={{ color: isDarkMode ? '#9CA3AF' : '#047857' }}>
              Your data is encrypted and fully protected
            </div>
          </div>
        </div>
      </div>

      {applyMessage && !showApplyModal && (
        <div className="alert" style={{
          background: isDarkMode ? '#1F2937' : '#FEF3C7',
          color: isDarkMode ? '#FDE047' : '#92400E',
          border: isDarkMode ? '1px solid #374151' : '1px solid #FDE047',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '20px'
        }}>
          {applyMessage}
        </div>
      )}

      {/* Loan Offers */}
      <h5 className="fw-bold mb-3" style={{ color: isDarkMode ? '#F3F4F6' : '#0F172A', fontSize: '1.1rem' }}>
        💰 Choose Your Loan
      </h5>
      <div className="row g-3 mb-5">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border" style={{ color: '#10B981', width: '3rem', height: '3rem' }} />
          </div>
        ) : loans.length === 0 ? (
          <div className="col-12 text-center py-5">
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
            <h5 style={{ color: COLORS.lightText }}>No loans available</h5>
          </div>
        ) : (
          loans.map((loan) => {
            const repayment = calculateRepayment(loan.minAmount, loan.interestRate, loan.duration);
            const quickAmounts = [
              loan.minAmount,
              Math.round((loan.minAmount + loan.maxAmount) / 2),
              Math.min(loan.maxAmount, loanLimit)
            ].filter((v, i, a) => a.indexOf(v) === i);

            return (
              <div key={loan.id} className="col-lg-6 col-xl-4">
                <div style={{
                  background: isDarkMode ? '#1F2937' : '#FFFFFF',
                  borderRadius: '20px',
                  padding: '24px',
                  border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB',
                  boxShadow: isDarkMode ? 'none' : '0 8px 24px rgba(15, 23, 42, 0.08)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = isDarkMode ? '0 12px 32px rgba(0, 0, 0, 0.3)' : '0 12px 32px rgba(15, 23, 42, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isDarkMode ? 'none' : '0 8px 24px rgba(15, 23, 42, 0.08)';
                }}
                >
                  {/* Corner decoration */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%)',
                    borderRadius: '0 20px 0 100%'
                  }} />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '1.75rem' }}>{loan.icon || '💰'}</span>
                        <h6 className="fw-bold mb-0" style={{ color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                          {loan.name}
                        </h6>
                      </div>
                      <span style={{
                        background: '#DCFCE7',
                        color: '#047857',
                        borderRadius: '999px',
                        padding: '5px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {loan.interestRate}%
                      </span>
                    </div>

                    <div className="mb-3" style={{ color: COLORS.lightText, fontSize: '0.85rem' }}>
                      {formatCurrency(loan.minAmount)} - {formatCurrency(loan.maxAmount)}
                    </div>

                    <div style={{
                      background: isDarkMode ? '#111827' : '#F8FAFC',
                      borderRadius: '14px',
                      padding: '14px',
                      marginBottom: '16px',
                      border: isDarkMode ? '1px solid #374151' : '1px solid #E2E8F0'
                    }}>
                      <div className="d-flex justify-content-between mb-2">
                        <span style={{ color: COLORS.lightText, fontSize: '0.8rem' }}>Monthly from</span>
                        <span className="fw-bold" style={{ color: '#10B981', fontSize: '0.9rem' }}>
                          {formatCurrency(repayment.monthly)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span style={{ color: COLORS.lightText, fontSize: '0.8rem' }}>Duration</span>
                        <span className="fw-semibold" style={{ color: isDarkMode ? '#D1D5DB' : '#334155', fontSize: '0.85rem' }}>
                          {loan.duration} months
                        </span>
                      </div>
                    </div>

                    <div className="d-flex gap-2 mb-3">
                      {quickAmounts.slice(0, 2).map((amount, idx) => (
                        <button
                          key={idx}
                          onClick={() => openApplyModal(loan, amount)}
                          disabled={hasActiveLoan}
                          style={{
                            flex: 1,
                            borderRadius: '999px',
                            border: 'none',
                            background: isDarkMode ? '#374151' : '#F1F5F9',
                            color: isDarkMode ? '#D1D5DB' : '#475569',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '8px 12px',
                            opacity: hasActiveLoan ? 0.5 : 1,
                            cursor: hasActiveLoan ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!hasActiveLoan) {
                              e.currentTarget.style.background = '#E0F2FE';
                              e.currentTarget.style.color = '#0369A1';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!hasActiveLoan) {
                              e.currentTarget.style.background = isDarkMode ? '#374151' : '#F1F5F9';
                              e.currentTarget.style.color = isDarkMode ? '#D1D5DB' : '#475569';
                            }
                          }}
                        >
                          {formatCurrency(amount)}
                        </button>
                      ))}
                    </div>

                    <button
                      className="btn w-100 fw-bold"
                      style={{
                        background: hasActiveLoan ? '#94A3B8' : '#10B981',
                        color: '#FFFFFF',
                        borderRadius: '12px',
                        border: 'none',
                        padding: '12px',
                        fontSize: '0.95rem',
                        cursor: hasActiveLoan ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => !hasActiveLoan && openApplyModal(loan)}
                      disabled={hasActiveLoan}
                      onMouseEnter={(e) => {
                        if (!hasActiveLoan) {
                          e.currentTarget.style.background = '#059669';
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!hasActiveLoan) {
                          e.currentTarget.style.background = '#10B981';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      {hasActiveLoan ? 'Repay First' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Active Loans */}
      {loanApplications.filter(app => app.status !== 'repaid' && app.status !== 'rejected').length > 0 && (
        <>
          <h5 className="fw-bold mb-3" style={{ color: isDarkMode ? '#F3F4F6' : '#0F172A', fontSize: '1.1rem' }}>
            📊 Your Loans
          </h5>
          <div className="row g-3 mb-5">
            {loanApplications
              .filter(app => app.status !== 'repaid' && app.status !== 'rejected')
              .map((app) => {
                const remaining = app.amount - (app.totalRepaid || 0);
                const progress = app.totalRepaid ? (app.totalRepaid / app.amount) * 100 : 0;
                const statusColors = {
                  approved: '#10B981',
                  pending: '#F59E0B',
                  'partial-repayment': '#3B82F6',
                  rejected: '#EF4444'
                };
                const statusColor = statusColors[app.status] || '#6B7280';

                return (
                  <div key={app._id} className="col-lg-6">
                    <div style={{
                      background: isDarkMode ? '#1F2937' : '#FFFFFF',
                      borderRadius: '20px',
                      padding: '24px',
                      border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB',
                      boxShadow: isDarkMode ? 'none' : '0 4px 12px rgba(15, 23, 42, 0.06)'
                    }}>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="fw-bold mb-1" style={{ color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                            {app.loanName}
                          </h6>
                          <div style={{ color: COLORS.lightText, fontSize: '0.85rem' }}>
                            Applied {new Date(app.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <span style={{
                          background: statusColor + '20',
                          color: statusColor,
                          borderRadius: '999px',
                          padding: '5px 14px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'capitalize'
                        }}>
                          {app.status.replace('-', ' ')}
                        </span>
                      </div>

                      <div className="row g-3 mb-3">
                        <div className="col-6">
                          <div style={{ color: COLORS.lightText, fontSize: '0.8rem', marginBottom: '4px' }}>
                            Loan Amount
                          </div>
                          <div className="fw-bold" style={{ color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                            {formatCurrency(app.amount)}
                          </div>
                        </div>
                        <div className="col-6">
                          <div style={{ color: COLORS.lightText, fontSize: '0.8rem', marginBottom: '4px' }}>
                            Repaid
                          </div>
                          <div className="fw-bold" style={{ color: '#10B981' }}>
                            {formatCurrency(app.totalRepaid || 0)}
                          </div>
                        </div>
                      </div>

                      {(app.status === 'approved' || app.status === 'partial-repayment') && (
                        <>
                          <div style={{
                            background: isDarkMode ? '#374151' : '#F1F5F9',
                            height: '10px',
                            borderRadius: '999px',
                            overflow: 'hidden',
                            marginBottom: '12px'
                          }}>
                            <div style={{
                              background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                              height: '100%',
                              width: `${progress}%`,
                              transition: 'width 0.5s ease',
                              borderRadius: '999px'
                            }} />
                          </div>

                          <div className="d-flex justify-content-between mb-3" style={{ fontSize: '0.8rem' }}>
                            <span style={{ color: COLORS.lightText }}>Remaining</span>
                            <span className="fw-bold" style={{ color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                              {formatCurrency(remaining)}
                            </span>
                          </div>

                          {remaining > 0 && (
                            <button
                              className="btn w-100 fw-semibold"
                              style={{
                                background: '#10B981',
                                color: '#FFFFFF',
                                borderRadius: '12px',
                                border: 'none',
                                padding: '11px',
                                fontSize: '0.9rem'
                              }}
                              onClick={() => openRepayModal(app)}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#10B981'}
                            >
                              Make Repayment
                            </button>
                          )}

                          {remaining <= 0 && (
                            <div style={{
                              background: '#D1FAE5',
                              color: '#047857',
                              borderRadius: '12px',
                              padding: '12px',
                              textAlign: 'center',
                              fontWeight: 600,
                              fontSize: '0.9rem'
                            }}>
                              ✓ Fully Repaid
                            </div>
                          )}
                        </>
                      )}

                      {app.status === 'pending' && (
                        <>
                          <div style={{
                            background: '#FEF3C7',
                            color: '#92400E',
                            borderRadius: '12px',
                            padding: '12px',
                            textAlign: 'center',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            marginBottom: '12px'
                          }}>
                            ⏱ Under Review
                          </div>
                          <button
                            className="btn w-100 fw-semibold"
                            style={{
                              background: deleteLoading === app._id ? '#94A3B8' : '#EF4444',
                              color: '#FFFFFF',
                              borderRadius: '12px',
                              border: 'none',
                              padding: '11px',
                              fontSize: '0.9rem',
                              cursor: deleteLoading === app._id ? 'not-allowed' : 'pointer'
                            }}
                            onClick={() => deleteLoanApplication(app._id)}
                            disabled={deleteLoading === app._id}
                            onMouseEnter={(e) => {
                              if (deleteLoading !== app._id) {
                                e.currentTarget.style.background = '#DC2626';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (deleteLoading !== app._id) {
                                e.currentTarget.style.background = '#EF4444';
                              }
                            }}
                          >
                            {deleteLoading === app._id ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-trash me-2"></i>Delete Application
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedLoan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}
        onClick={() => setShowApplyModal(false)}
        >
          <div
            style={{
              background: isDarkMode ? '#1F2937' : '#FFFFFF',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '480px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0" style={{ color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                Apply for {selectedLoan.name}
              </h5>
              <button
                onClick={() => setShowApplyModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: COLORS.lightText,
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={submitLoanApplication}>
              <div className="mb-3">
                <label className="fw-semibold small mb-2 d-block" style={{ color: isDarkMode ? '#D1D5DB' : '#334155' }}>
                  Loan Amount
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={applyAmount}
                  onChange={(e) => setApplyAmount(e.target.value)}
                  min={selectedLoan.minAmount}
                  max={Math.min(selectedLoan.maxAmount, loanLimit)}
                  required
                  style={{
                    background: isDarkMode ? '#374151' : '#F9FAFB',
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: isDarkMode ? '#F3F4F6' : '#0F172A',
                    fontSize: '1rem'
                  }}
                />
                <div className="small mt-1" style={{ color: COLORS.lightText }}>
                  {formatCurrency(selectedLoan.minAmount)} - {formatCurrency(Math.min(selectedLoan.maxAmount, loanLimit))}
                </div>
              </div>

              <div className="mb-3">
                <label className="fw-semibold small mb-2 d-block" style={{ color: isDarkMode ? '#D1D5DB' : '#334155' }}>
                  Duration (months)
                </label>
                <select
                  className="form-select"
                  value={applyDuration}
                  onChange={(e) => setApplyDuration(e.target.value)}
                  required
                  style={{
                    background: isDarkMode ? '#374151' : '#F9FAFB',
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: isDarkMode ? '#F3F4F6' : '#0F172A'
                  }}
                >
                  {[6, 12, 18, 24, 36, 48, 60].filter(m => m <= selectedLoan.duration).map(m => (
                    <option key={m} value={m}>{m} months</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="fw-semibold small mb-2 d-block" style={{ color: isDarkMode ? '#D1D5DB' : '#334155' }}>
                  Purpose (Optional)
                </label>
                <textarea
                  className="form-control"
                  value={applyReason}
                  onChange={(e) => setApplyReason(e.target.value)}
                  rows={3}
                  placeholder="What will you use this loan for?"
                  style={{
                    background: isDarkMode ? '#374151' : '#F9FAFB',
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: isDarkMode ? '#F3F4F6' : '#0F172A',
                    resize: 'none'
                  }}
                />
              </div>

              {applyAmount && applyDuration && (
                <div style={{
                  background: isDarkMode ? '#111827' : '#F0FDF4',
                  border: isDarkMode ? '1px solid #374151' : '1px solid #BBF7D0',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div className="small fw-semibold mb-2" style={{ color: isDarkMode ? '#D1D5DB' : '#166534' }}>
                    Repayment Summary
                  </div>
                  {(() => {
                    const calc = calculateRepayment(Number(applyAmount), selectedLoan.interestRate, Number(applyDuration));
                    return (
                      <>
                        <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                          <span style={{ color: COLORS.lightText }}>Monthly Payment</span>
                          <span className="fw-bold" style={{ color: isDarkMode ? '#F3F4F6' : '#047857' }}>
                            {formatCurrency(calc.monthly)}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between" style={{ fontSize: '0.85rem' }}>
                          <span style={{ color: COLORS.lightText }}>Total Repayment</span>
                          <span className="fw-semibold" style={{ color: isDarkMode ? '#D1D5DB' : '#334155' }}>
                            {formatCurrency(calc.total)}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {applyMessage && (
                <div className="alert mb-3" style={{
                  background: applyMessage.includes('✓') ? '#D1FAE5' : '#FEE2E2',
                  color: applyMessage.includes('✓') ? '#065F46' : '#991B1B',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '0.85rem'
                }}>
                  {applyMessage}
                </div>
              )}

              <button
                type="submit"
                className="btn w-100 fw-bold"
                disabled={applyLoading}
                style={{
                  background: applyLoading ? '#94A3B8' : '#10B981',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  border: 'none',
                  padding: '14px',
                  fontSize: '1rem',
                  cursor: applyLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {applyLoading ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Repay Modal */}
      {showRepayModal && selectedApplication && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}
        onClick={() => setShowRepayModal(false)}
        >
          <div
            style={{
              background: isDarkMode ? '#1F2937' : '#FFFFFF',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0" style={{ color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                Make Repayment
              </h5>
              <button
                onClick={() => setShowRepayModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: COLORS.lightText,
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              background: isDarkMode ? '#111827' : '#F9FAFB',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div className="small mb-2" style={{ color: COLORS.lightText }}>Loan Details</div>
              <div className="fw-bold mb-1" style={{ color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                {selectedApplication.loanName}
              </div>
              <div className="d-flex justify-content-between" style={{ fontSize: '0.85rem' }}>
                <span style={{ color: COLORS.lightText }}>Remaining Balance</span>
                <span className="fw-bold" style={{ color: '#EF4444' }}>
                  {formatCurrency(selectedApplication.amount - (selectedApplication.totalRepaid || 0))}
                </span>
              </div>
            </div>

            <form onSubmit={submitRepayment}>
              <div className="mb-3">
                <label className="fw-semibold small mb-2 d-block" style={{ color: isDarkMode ? '#D1D5DB' : '#334155' }}>
                  Amount to Repay
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  min={1}
                  max={selectedApplication.amount - (selectedApplication.totalRepaid || 0)}
                  required
                  style={{
                    background: isDarkMode ? '#374151' : '#F9FAFB',
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: isDarkMode ? '#F3F4F6' : '#0F172A',
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}
                />
                <div className="small mt-1" style={{ color: COLORS.lightText }}>
                  Maximum: {formatCurrency(selectedApplication.amount - (selectedApplication.totalRepaid || 0))}
                </div>
              </div>

              {repayMessage && (
                <div className="alert mb-3" style={{
                  background: repayMessage.includes('✓') ? '#D1FAE5' : '#FEE2E2',
                  color: repayMessage.includes('✓') ? '#065F46' : '#991B1B',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '0.85rem'
                }}>
                  {repayMessage}
                </div>
              )}

              <button
                type="submit"
                className="btn w-100 fw-bold"
                disabled={repayLoading}
                style={{
                  background: repayLoading ? '#94A3B8' : '#10B981',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  border: 'none',
                  padding: '14px',
                  fontSize: '1rem',
                  cursor: repayLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {repayLoading ? 'Processing...' : 'Confirm Payment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Loans;
