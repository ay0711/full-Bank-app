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
  const [approvingId, setApprovingId] = useState(null);
  const [creditScore, setCreditScore] = useState(500);
  const [loanLimit, setLoanLimit] = useState(50000);
  const [hasActiveLoan, setHasActiveLoan] = useState(false);
  const [calculatorAmount, setCalculatorAmount] = useState(50000);
  const [calculatorDuration, setCalculatorDuration] = useState(12);
  const [selectedLoanForCalc, setSelectedLoanForCalc] = useState(null);
  const [showQuickApply, setShowQuickApply] = useState(false);
  const [quickApplyLoan, setQuickApplyLoan] = useState(null);
  const { isDarkMode, user, setUser } = useAppContext();

  useEffect(() => {
    fetchLoans();
    if (user?.loanApplications) {
      setLoanApplications(user.loanApplications);
    }
  }, [user]);

  const fetchLoanApplications = () => {
    if (user?.loanApplications) {
      setLoanApplications(user.loanApplications);
    }
  };

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
      
      console.log('✅ Loans fetched successfully', {
        count: response.data.loans?.length,
        creditScore: response.data.creditScore,
        loanLimit: response.data.loanLimit
      });
    } catch (error) {
      console.error('❌ Error fetching loans:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      // Set default loans if fetch fails
      setLoans([
        { id: 1, name: 'Personal Loan', minAmount: 50000, maxAmount: 500000, interestRate: 12, duration: 24 },
        { id: 2, name: 'Business Loan', minAmount: 100000, maxAmount: 5000000, interestRate: 10, duration: 36 },
        { id: 3, name: 'Auto Loan', minAmount: 200000, maxAmount: 3000000, interestRate: 8, duration: 60 },
        { id: 4, name: 'Education Loan', minAmount: 50000, maxAmount: 2000000, interestRate: 9, duration: 48 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return '₦' + amount.toLocaleString('en-NG');
  };

  const calculateRepayment = (loanData) => {
    if (!loanData) return { monthly: 0, total: 0, interest: 0 };
    const principal = calculatorAmount || 50000;
    const rate = (loanData.interestRate || 12) / 100 / 12;
    const months = calculatorDuration || 12;
    
    if (rate === 0) {
      const total = principal;
      const monthly = principal / months;
      return { monthly: Math.round(monthly), total: Math.round(total), interest: 0 };
    }
    
    const monthlyPayment = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;
    
    return {
      monthly: Math.round(monthlyPayment),
      total: Math.round(totalPayment),
      interest: Math.round(totalInterest)
    };
  };

  const getApprovalStatus = (score) => {
    if (score >= 750) return { badge: 'Instant Approval', color: '#10B981', icon: '✓' };
    if (score >= 650) return { badge: 'Quick Approval', color: '#3B82F6', icon: '⚡' };
    if (score >= 500) return { badge: 'Standard Review', color: '#F59E0B', icon: '📋' };
    return { badge: 'Additional Verification Needed', color: '#EF4444', icon: '⚠️' };
  };

  const quickApply = async (loan, amount) => {
    setSelectedLoan(loan);
    setApplyAmount(amount.toString());
    setApplyDuration(loan.duration?.toString() || '12');
    setApplyReason('');
    setApplyMessage('');
    setShowApplyModal(true);
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
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      setApplyMessage('Loan application submitted successfully');
      setTimeout(async () => {
        setShowApplyModal(false);
        // Refresh user data to get updated loanApplications
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(API_ENDPOINTS.DASHBOARD, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          });
          if (response.data.user) {
            setUser(response.data.user);
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      }, 1200);
    } catch (error) {
      setApplyMessage('Failed to submit loan application');
    } finally {
      setApplyLoading(false);
    }
  };

  const openRepayModal = (application) => {
    const remainingBalance = application.amount - (application.totalRepaid || 0);
    setSelectedApplication(application);
    setRepayAmount(Math.min(remainingBalance, 10000).toString()); // Default to 10k or remaining
    setRepayMessage('');
    setShowRepayModal(true);
  };

  const submitRepayment = async (e) => {
    e.preventDefault();
    if (!selectedApplication) return;

    // Convert and validate the repayment amount
    let repayValue = repayAmount.trim();
    if (!repayValue || isNaN(Number(repayValue))) {
      setRepayMessage('Please enter a valid amount');
      return;
    }

    repayValue = Number(repayValue);
    const remainingBalance = selectedApplication.amount - (selectedApplication.totalRepaid || 0);

    if (repayValue <= 0) {
      setRepayMessage('Repayment amount must be greater than 0');
      return;
    }

    if (repayValue > remainingBalance) {
      setRepayMessage(`Repayment cannot exceed remaining balance: ${formatCurrency(remainingBalance)}`);
      return;
    }

    setRepayLoading(true);
    setRepayMessage('');
    try {
      const token = localStorage.getItem('token');
      console.log('Submitting repayment:', { amount: repayValue, applicationId: selectedApplication._id });
      const response = await axios.post(
        API_ENDPOINTS.LOAN_REPAY(selectedApplication._id),
        { amount: repayValue },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );

      console.log('📤 Repayment response:', { 
        status: response.status, 
        updatedApp: response.data.application,
        newAppStatus: response.data.application.status
      });

      setRepayMessage('Repayment processed successfully');
      setTimeout(async () => {
        setShowRepayModal(false);
        // Refresh user data to get updated loanApplications and balance
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(API_ENDPOINTS.DASHBOARD, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          });
          if (response.data.user) {
            setUser(response.data.user);
            console.log('🔄 User refreshed. Loans:', response.data.user.loanApplications.map(l => ({ name: l.loanName, status: l.status, paid: l.totalRepaid, total: l.amount })));
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      }, 1200);
    } catch (error) {
      console.error('Repayment error:', error);
      console.error('Error response:', error.response?.data);
      setRepayMessage(error.response?.data?.message || error.message || 'Failed to process repayment');
    } finally {
      setRepayLoading(false);
    }
  };

  const approveLoanApplication = async (applicationId) => {
    setApprovingId(applicationId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        API_ENDPOINTS.LOAN_APPROVE(applicationId),
        { status: 'approved' },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );

      // Refresh user data
      const dashboardResponse = await axios.get(API_ENDPOINTS.DASHBOARD, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });
      if (dashboardResponse.data.user) {
        setUser(dashboardResponse.data.user);
      }
    } catch (error) {
      console.error('Error approving loan:', error);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <PageLayout pageTitle="Loans" pageSubtitle="Browse and apply for loans tailored to your needs">
      {/* Credit Score Card */}
      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              border: isDarkMode ? '1px solid #374151' : 'none'
            }}
          >
            <div className="small mb-2" style={{ color: COLORS.lightText }}>Credit Score</div>
            <h2 className="fw-bold mb-2" style={{ color: COLORS.primary }}>{creditScore}/850</h2>
            <div style={{ height: '8px', background: isDarkMode ? '#374151' : COLORS.light, borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: creditScore >= 700 ? COLORS.success : creditScore >= 500 ? COLORS.warning : COLORS.danger, width: `${(creditScore / 850) * 100}%` }}></div>
            </div>
            <p className="small mt-2 mb-0" style={{ color: COLORS.lightText }}>
              {creditScore >= 700 ? 'Excellent' : creditScore >= 500 ? 'Good' : 'Fair'}
            </p>
          </div>
        </div>
        <div className="col-lg-4">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              border: isDarkMode ? '1px solid #374151' : 'none'
            }}
          >
            <div className="small mb-2" style={{ color: COLORS.lightText }}>Your Loan Limit</div>
            <h2 className="fw-bold mb-2" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>{formatCurrency(loanLimit)}</h2>
            <p className="small mb-0" style={{ color: COLORS.lightText }}>
              Maximum amount you can borrow
            </p>
          </div>
        </div>
        <div className="col-lg-4">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              border: isDarkMode ? '1px solid #374151' : 'none'
            }}
          >
            <div className="small mb-2" style={{ color: COLORS.lightText }}>Loan Status</div>
            <h4 className="fw-bold mb-2" style={{ color: hasActiveLoan ? COLORS.warning : COLORS.success }}>
              {hasActiveLoan ? 'Active Loan' : 'No Active Loans'}
            </h4>
            <p className="small mb-0" style={{ color: COLORS.lightText }}>
              {hasActiveLoan ? 'Repay existing loan to apply for new ones' : 'You can apply for a new loan'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Loan Calculator */}
      <div className="row g-4 mb-5">
        <div className="col-lg-8">
          <div style={{
            background: isDarkMode ? '#1F2937' : COLORS.card,
            borderRadius: '16px',
            padding: '32px',
            boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
            border: isDarkMode ? '1px solid #374151' : 'none'
          }}>
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              <i className="fas fa-calculator me-2" style={{ color: COLORS.primary }}></i>Repayment Calculator
            </h5>
            
            <div className="row g-3 mb-4">
              <div className="col-lg-6">
                <label style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }} className="fw-semibold small mb-2 d-block">
                  Select Loan Type
                </label>
                <select 
                  className="form-select"
                  value={selectedLoanForCalc?._id || ''}
                  onChange={(e) => {
                    const selected = loans.find(l => l.id === parseInt(e.target.value) || l._id === e.target.value);
                    setSelectedLoanForCalc(selected);
                    setCalculatorAmount(selected?.minAmount || 50000);
                  }}
                  style={{
                    borderRadius: '8px',
                    borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
                    background: isDarkMode ? '#111827' : '#F9FAFB',
                    color: isDarkMode ? '#D1D5DB' : '#374151'
                  }}
                >
                  <option value="">Choose a loan...</option>
                  {loans.map(loan => (
                    <option key={loan.id} value={loan.id}>{loan.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-lg-6">
                <label style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }} className="fw-semibold small mb-2 d-block">
                  Loan Amount: {formatCurrency(calculatorAmount)}
                </label>
                <input 
                  type="range"
                  min={selectedLoanForCalc?.minAmount || 50000}
                  max={selectedLoanForCalc?.maxAmount || 500000}
                  value={calculatorAmount}
                  onChange={(e) => setCalculatorAmount(Number(e.target.value))}
                  className="form-range"
                  style={{ height: '6px' }}
                />
              </div>

              <div className="col-lg-6">
                <label style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }} className="fw-semibold small mb-2 d-block">
                  Loan Duration: {calculatorDuration} months
                </label>
                <input 
                  type="range"
                  min="6"
                  max="60"
                  value={calculatorDuration}
                  onChange={(e) => setCalculatorDuration(Number(e.target.value))}
                  className="form-range"
                  style={{ height: '6px' }}
                />
              </div>
            </div>

            {selectedLoanForCalc && (
              <div className="row g-3">
                {(() => {
                  const repayment = calculateRepayment(selectedLoanForCalc);
                  return (
                    <>
                      <div className="col-md-4">
                        <div style={{
                          background: isDarkMode ? '#111827' : '#F9FAFB',
                          borderRadius: '12px',
                          padding: '16px',
                          border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`
                        }}>
                          <div className="small" style={{ color: COLORS.lightText }}>Monthly Payment</div>
                          <div className="fw-bold" style={{ color: COLORS.primary, fontSize: '1.5rem' }}>
                            {formatCurrency(repayment.monthly)}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div style={{
                          background: isDarkMode ? '#111827' : '#F9FAFB',
                          borderRadius: '12px',
                          padding: '16px',
                          border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`
                        }}>
                          <div className="small" style={{ color: COLORS.lightText }}>Total Interest</div>
                          <div className="fw-bold" style={{ color: COLORS.danger, fontSize: '1.5rem' }}>
                            {formatCurrency(repayment.interest)}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div style={{
                          background: isDarkMode ? '#111827' : '#F9FAFB',
                          borderRadius: '12px',
                          padding: '16px',
                          border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`
                        }}>
                          <div className="small" style={{ color: COLORS.lightText }}>Total Repayment</div>
                          <div className="fw-bold" style={{ color: COLORS.success, fontSize: '1.5rem' }}>
                            {formatCurrency(repayment.total)}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Approval Status */}
        <div className="col-lg-4">
          <div style={{
            background: isDarkMode ? '#1F2937' : COLORS.card,
            borderRadius: '16px',
            padding: '32px',
            boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
            border: isDarkMode ? '1px solid #374151' : 'none'
          }}>
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              <i className="fas fa-badge-check me-2" style={{ color: COLORS.primary }}></i>Your Status
            </h5>
            
            {(() => {
              const status = getApprovalStatus(creditScore);
              return (
                <>
                  <div style={{
                    background: isDarkMode ? '#111827' : '#F9FAFB',
                    borderRadius: '12px',
                    padding: '24px',
                    border: `2px solid ${status.color}`,
                    textAlign: 'center',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{status.icon}</div>
                    <h6 className="fw-bold mb-2" style={{ color: status.color }}>
                      {status.badge}
                    </h6>
                    <p className="small mb-0" style={{ color: COLORS.lightText }}>
                      Based on your credit score of {creditScore}
                    </p>
                  </div>

                  <div style={{
                    background: isDarkMode ? '#111827' : '#F9FAFB',
                    borderRadius: '12px',
                    padding: '16px',
                    border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`
                  }}>
                    <h6 className="fw-bold mb-3" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                      Your Benefits
                    </h6>
                    <div className="small" style={{ color: COLORS.lightText }}>
                      <p className="mb-2">✓ Borrow up to {formatCurrency(loanLimit)}</p>
                      <p className="mb-2">✓ Fast & Easy Application</p>
                      <p className="mb-0">✓ Flexible Repayment Terms</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
      
      {/* Loan Offers */}
      <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
        <i className="fas fa-handshake me-2" style={{ color: COLORS.primary }}></i>Available Loans
      </h5>
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
          loans.map((loan) => {
            const approvalStatus = getApprovalStatus(creditScore);
            const quickAmounts = [
              loan.minAmount,
              Math.round((loan.minAmount + loan.maxAmount) / 2),
              Math.min(loan.maxAmount, loanLimit)
            ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
            
            return (
            <div key={loan.id} className="col-lg-6 col-xl-4">
              <div
                style={{
                  background: isDarkMode ? '#1F2937' : COLORS.card,
                  borderRadius: '16px',
                  padding: '28px',
                  boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                  border: isDarkMode ? '1px solid #374151' : 'none',
                  transition: 'all 0.3s ease',
                  position: 'relative'
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
                {/* Approval Badge */}
                {creditScore >= 650 && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: approvalStatus.color,
                    color: 'white',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {approvalStatus.icon} {approvalStatus.badge === 'Instant Approval' ? 'INSTANT' : approvalStatus.badge === 'Quick Approval' ? 'QUICK' : ''}
                  </div>
                )}

                <h5 className="fw-bold mb-3" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                  {loan.name}
                </h5>

                <div className="mb-3">
                  <div className="small" style={{ color: COLORS.lightText }}>Amount Range</div>
                  <div className="fw-semibold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                    {formatCurrency(loan.minAmount)} - {formatCurrency(loan.maxAmount)}
                  </div>
                </div>

                <div className="row g-2 mb-4">
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

                {/* Quick Apply Buttons */}
                <div className="mb-3">
                  <div className="small fw-semibold" style={{ color: COLORS.lightText, marginBottom: '8px' }}>Quick Apply</div>
                  <div className="d-flex gap-2 justify-content-between">
                    {quickAmounts.map((amount, idx) => (
                      <button
                        key={idx}
                        onClick={() => quickApply(loan, amount)}
                        style={{
                          flex: 1,
                          background: isDarkMode ? '#111827' : '#F3F4F6',
                          border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                          borderRadius: '8px',
                          padding: '8px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          color: isDarkMode ? '#D1D5DB' : '#6B7280',
                          fontWeight: '500',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = COLORS.primary;
                          e.target.style.color = 'white';
                          e.target.style.borderColor = COLORS.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = isDarkMode ? '#111827' : '#F3F4F6';
                          e.target.style.color = isDarkMode ? '#D1D5DB' : '#6B7280';
                          e.target.style.borderColor = isDarkMode ? '#374151' : '#E5E7EB';
                        }}
                      >
                        {formatCurrency(amount)}
                      </button>
                    ))}
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
                  disabled={hasActiveLoan}
                  title={hasActiveLoan ? 'Repay existing loan first' : 'Apply for this loan'}
                >
                  {hasActiveLoan ? 'Repay First' : 'Full Application'}
                </button>
              </div>
            </div>
          );
          })
        )}
      </div>

      {/* My Loan Applications */}
      {loanApplications.length > 0 && (
        <div className="mb-5">
          <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
            My Applications {loanApplications.filter(app => app.status === 'repaid').length > 0 && `(${loanApplications.filter(app => app.status !== 'repaid').length} Active)`}
          </h5>
          <div className="row g-4">
            {loanApplications
            .filter(app => app.status !== 'repaid')  // Hide fully repaid loans
            .map((application) => {
              const remainingBalance = application.amount - (application.totalRepaid || 0);
              const progressPercent = application.totalRepaid ? (application.totalRepaid / application.amount) * 100 : 0;
              const statusColor = 
                application.status === 'approved' ? '#10B981' :
                application.status === 'pending' ? '#F59E0B' :
                application.status === 'repaid' ? '#8B5CF6' :
                application.status?.includes('partial') ? '#3B82F6' :
                '#EF4444';

              return (
                <div key={application._id} className="col-lg-6">
                  <div
                    style={{
                      background: isDarkMode ? '#1F2937' : COLORS.card,
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                      border: isDarkMode ? '1px solid #374151' : 'none'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h6 className="fw-bold mb-0" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                        {application.loanName}
                      </h6>
                      <span
                        style={{
                          background: statusColor,
                          color: 'white',
                          borderRadius: '20px',
                          padding: '4px 12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}
                      >
                        {application.status?.replace('-', ' ')}
                      </span>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-6">
                        <div className="small" style={{ color: COLORS.lightText }}>Loan Amount</div>
                        <div className="fw-semibold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                          {formatCurrency(application.amount)}
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="small" style={{ color: COLORS.lightText }}>Interest Rate</div>
                        <div className="fw-semibold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                          {application.interestRate}% p.a.
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="small" style={{ color: COLORS.lightText }}>Duration</div>
                        <div className="fw-semibold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                          {application.duration} months
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="small" style={{ color: COLORS.lightText }}>Applied On</div>
                        <div className="fw-semibold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                          {new Date(application.createdAt).toLocaleDateString('en-NG')}
                        </div>
                      </div>
                    </div>

                    {(application.status === 'approved' || application.status === 'partial-repayment') && (
                      <>
                        <div className="mb-3">
                          <div className="small d-flex justify-content-between mb-2" style={{ color: COLORS.lightText }}>
                            <span>Repayment Progress</span>
                            <span>{formatCurrency(application.totalRepaid || 0)} / {formatCurrency(application.amount)}</span>
                          </div>
                          <div
                            style={{
                              background: isDarkMode ? '#374151' : '#E5E7EB',
                              height: '8px',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}
                          >
                            <div
                              style={{
                                background: '#10B981',
                                height: '100%',
                                width: `${progressPercent}%`,
                                transition: 'width 0.3s ease'
                              }}
                            />
                          </div>
                          <div className="small mt-2" style={{ color: COLORS.lightText }}>
                            Remaining: {formatCurrency(remainingBalance)}
                          </div>
                        </div>

                        {remainingBalance > 0 && (
                          <button
                            className="btn w-100 fw-semibold"
                            style={{
                              background: COLORS.primary,
                              color: 'white',
                              borderRadius: '12px',
                              border: 'none',
                              padding: '10px',
                              fontSize: '0.9rem',
                              transition: 'all 0.3s ease'
                            }}
                            onClick={() => openRepayModal(application)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#3730A3';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = COLORS.primary;
                            }}
                          >
                            Make Repayment
                          </button>
                        )}

                        {remainingBalance <= 0 && (
                          <div
                            style={{
                              background: '#D1FAE5',
                              color: '#065F46',
                              borderRadius: '12px',
                              padding: '12px',
                              textAlign: 'center',
                              fontWeight: '500'
                            }}
                          >
                            Loan fully repaid
                          </div>
                        )}
                      </>
                    )}

                    {application.status === 'pending' && (
                      <button
                        className="btn w-100 fw-semibold"
                        disabled={approvingId === application._id}
                        style={{
                          background: '#F59E0B',
                          color: 'white',
                          borderRadius: '12px',
                          border: 'none',
                          padding: '10px',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease',
                          opacity: approvingId === application._id ? 0.6 : 1,
                          cursor: approvingId === application._id ? 'not-allowed' : 'pointer'
                        }}
                        onClick={() => approveLoanApplication(application._id)}
                        onMouseEnter={(e) => {
                          if (approvingId !== application._id) {
                            e.currentTarget.style.background = '#D97706';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (approvingId !== application._id) {
                            e.currentTarget.style.background = '#F59E0B';
                          }
                        }}
                        title="Approve this loan for testing purposes"
                      >
                        {approvingId === application._id ? 'Approving...' : 'Approve for Testing'}
                      </button>
                    )}

                    {application.reason && (
                      <div className="mt-3 pt-3 border-top" style={{ borderColor: isDarkMode ? '#374151' : '#E5E7EB' }}>
                        <div className="small" style={{ color: COLORS.lightText }}>Applied For</div>
                        <div style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText, fontSize: '0.9rem' }}>
                          {application.reason}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
            
            {/* Allocate space for message to prevent CLS */}
            {!applyMessage && <div style={{ minHeight: '48px', marginBottom: '16px' }} />}

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

      {/* Repayment Modal */}
      {showRepayModal && selectedApplication && (
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
          onClick={() => setShowRepayModal(false)}
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
                Repay {selectedApplication.loanName}
              </h5>
              <button
                onClick={() => setShowRepayModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: isDarkMode ? '#9CA3AF' : COLORS.lightText }}
              >
                ×
              </button>
            </div>

            {repayMessage && (
              <div
                style={{
                  background: repayMessage.includes('successfully') ? COLORS.success : COLORS.danger,
                  color: 'white',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '16px'
                }}
              >
                {repayMessage}
              </div>
            )}
            
            {/* Allocate space for message to prevent CLS */}
            {!repayMessage && <div style={{ minHeight: '48px', marginBottom: '16px' }} />}

            <div className="mb-4 p-3" style={{ background: isDarkMode ? '#374151' : '#F3F4F6', borderRadius: '12px' }}>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <div className="small" style={{ color: COLORS.lightText }}>Loan Amount</div>
                  <div className="fw-semibold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                    {formatCurrency(selectedApplication.amount)}
                  </div>
                </div>
                <div className="col-6">
                  <div className="small" style={{ color: COLORS.lightText }}>Already Paid</div>
                  <div className="fw-semibold" style={{ color: '#10B981' }}>
                    {formatCurrency(selectedApplication.totalRepaid || 0)}
                  </div>
                </div>
              </div>
              <div className="small" style={{ color: COLORS.lightText }}>
                Remaining Balance
              </div>
              <div className="fw-bold" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText, fontSize: '1.25rem' }}>
                {formatCurrency(selectedApplication.amount - (selectedApplication.totalRepaid || 0))}
              </div>
            </div>

            <form onSubmit={submitRepayment}>
              <div className="mb-4">
                <label className="small fw-semibold mb-2" style={{ color: COLORS.lightText }}>
                  Repayment Amount
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="form-control"
                  value={repayAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Allow any amount: numbers and decimals only
                    const cleaned = val.replace(/[^0-9.]/g, '');
                    // Prevent multiple decimal points
                    const parts = cleaned.split('.');
                    const finalVal = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
                    setRepayAmount(finalVal);
                  }}
                  placeholder="Enter amount"
                  style={{
                    background: isDarkMode ? '#374151' : COLORS.light,
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                    padding: '12px 16px'
                  }}
                />
                <div className="small mt-2" style={{ color: COLORS.lightText }}>
                  Max: {formatCurrency(selectedApplication.amount - (selectedApplication.totalRepaid || 0))}
                </div>
              </div>

              <button
                type="submit"
                className="btn w-100 fw-semibold"
                disabled={repayLoading}
                style={{
                  background: COLORS.primary,
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  padding: '12px',
                  opacity: repayLoading ? 0.6 : 1,
                  cursor: repayLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {repayLoading ? 'Processing...' : 'Confirm Repayment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Stories */}
      <div className="row g-4 mb-5">
        <div className="col-12">
          <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
            <i className="fas fa-star me-2" style={{ color: COLORS.primary }}></i>Success Stories
          </h5>
        </div>
        {[
          {
            name: 'Chioma A.',
            avatar: '👩‍💼',
            testimony: 'Got ₦500,000 personal loan in just 5 minutes. The process was so simple!',
            amount: '₦500,000',
            status: 'Fully Repaid'
          },
          {
            name: 'Ahmed K.',
            avatar: '👨‍💼',
            testimony: 'Business loan helped me expand my store. Now doing 3x better!',
            amount: '₦1,000,000',
            status: 'Repaying'
          },
          {
            name: 'Zainab M.',
            avatar: '👩',
            testimony: 'Easy approval, flexible repayment. Highly recommended!',
            amount: '₦200,000',
            status: 'Fully Repaid'
          }
        ].map((story, idx) => (
          <div key={idx} className="col-lg-4">
            <div style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              border: isDarkMode ? '1px solid #374151' : 'none'
            }}>
              <div className="d-flex align-items-center mb-3">
                <div style={{
                  fontSize: '2.5rem',
                  marginRight: '12px'
                }}>
                  {story.avatar}
                </div>
                <div>
                  <h6 className="fw-bold mb-0" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                    {story.name}
                  </h6>
                  <div style={{ color: COLORS.lightText, fontSize: '0.85rem' }}>
                    {story.status}
                  </div>
                </div>
              </div>
              
              <p className="small mb-3" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText, fontStyle: 'italic' }}>
                "{story.testimony}"
              </p>
              
              <div style={{
                background: isDarkMode ? '#111827' : '#F9FAFB',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                borderTop: `3px solid ${COLORS.primary}`
              }}>
                <div className="small" style={{ color: COLORS.lightText }}>Loan Amount</div>
                <div className="fw-bold" style={{ color: COLORS.primary }}>
                  {story.amount}
                </div>
              </div>

              <div className="mt-3 text-center">
                <i className="fas fa-star" style={{ color: '#F59E0B' }}></i>
                <i className="fas fa-star ms-1" style={{ color: '#F59E0B' }}></i>
                <i className="fas fa-star ms-1" style={{ color: '#F59E0B' }}></i>
                <i className="fas fa-star ms-1" style={{ color: '#F59E0B' }}></i>
                <i className="fas fa-star ms-1" style={{ color: '#F59E0B' }}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="row g-4 mb-5">
        <div className="col-12">
          <div style={{
            background: isDarkMode ? '#1F2937' : COLORS.card,
            borderRadius: '16px',
            padding: '32px',
            boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
            border: isDarkMode ? '1px solid #374151' : 'none'
          }}>
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              <i className="fas fa-question-circle me-2" style={{ color: COLORS.primary }}></i>Frequently Asked Questions
            </h5>

            <div className="row g-4">
              {[
                {
                  q: 'How quickly will I get approved?',
                  a: 'Instant Approval members get approved within minutes. Others receive a decision within 24 hours.'
                },
                {
                  q: 'What\'s the maximum loan I can get?',
                  a: `Your loan limit is ${formatCurrency(loanLimit)} based on your credit score and account type.`
                },
                {
                  q: 'Can I apply for multiple loans?',
                  a: 'You can only have one active loan at a time. Repay your current loan to apply for another.'
                },
                {
                  q: 'What are the interest rates?',
                  a: 'Rates vary by loan type (8-12% p.a.). Use our calculator above to see exact rates.'
                }
              ].map((faq, idx) => (
                <div key={idx} className="col-lg-6">
                  <div>
                    <h6 className="fw-bold mb-2" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                      {faq.q}
                    </h6>
                    <p className="small mb-0" style={{ color: COLORS.lightText }}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Loans;
