import React, { useState, useEffect, useRef } from 'react';
import PageLayout, { COLORS } from '../components/PageLayout';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatCurrency, getMaskedCurrency } from '../utils/currencyConverter';

const Accounts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hideAccountNumber, setHideAccountNumber] = useState(false);
  const { user, isDarkMode, isBalanceVisible, toggleBalanceVisibility, settings } = useAppContext();
  const navigate = useNavigate();
  const accountInfoRef = useRef(null);
  
  // Get currency from settings
  const currency = settings?.currency || 'NGN';

  useEffect(() => {
    // Accounts data is loaded from user context
    setIsLoading(false);
  }, []);

  const getAccountType = () => {
    const type = user?.accountType || 'Standard';
    if (type === 'Standard') return 'Standard Account';
    if (type === 'Premium') return 'Premium Account';
    if (type === 'Business') return 'Business Account';
    return 'Standard Account';
  };

  const getAccountLimits = () => {
    const type = user?.accountType || 'Standard';
    const limits = {
      'Standard': { daily: 100000, monthly: 500000 },
      'Premium': { daily: 500000, monthly: 5000000 },
      'Business': { daily: 'Unlimited', monthly: 'Unlimited' }
    };
    const limit = limits[type] || limits['Standard'];
    
    // Format with proper currency
    if (typeof limit.daily === 'number') {
      return {
        daily: formatCurrency(limit.daily, currency),
        monthly: formatCurrency(limit.monthly, currency)
      };
    }
    return limit;
  };

  const accountActions = [
    { 
      label: 'Add Money', 
      icon: '💰', 
      color: COLORS.success, 
      action: () => navigate('/fund-account'),
      description: 'Fund your account'
    },
    { 
      label: 'Withdraw', 
      icon: '💸', 
      color: COLORS.warning, 
      action: () => navigate('/withdraw'),
      description: 'Withdraw cash'
    },
    { 
      label: 'Transfer', 
      icon: '➡️', 
      color: COLORS.primary, 
      action: () => navigate('/transfer'),
      description: 'Send money'
    },
    { 
      label: 'View Details', 
      icon: '📋', 
      color: '#8B5CF6', 
      action: () => {
        if (accountInfoRef.current) {
          accountInfoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
      description: 'Account info'
    }
  ];

  if (isLoading) {
    return (
      <PageLayout pageTitle="My Accounts" pageSubtitle="View and manage your accounts">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageTitle="My Accounts" pageSubtitle="View and manage your accounts">
      <div className="row g-4">
        {/* Main Account Card */}
        <div className="col-lg-8">
          <div
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, #3730A3 100%)`,
              borderRadius: '20px',
              padding: 'clamp(20px, 5vw, 40px)',
              boxShadow: '0 12px 36px rgba(79, 70, 229, 0.3)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative circles */}
            <div style={{ 
              position: 'absolute', 
              top: -40, 
              right: -40, 
              width: 180, 
              height: 180, 
              background: 'rgba(255,255,255,0.08)', 
              borderRadius: '50%' 
            }}></div>
            <div style={{ 
              position: 'absolute', 
              bottom: -20, 
              left: -20, 
              width: 140, 
              height: 140, 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '50%' 
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Account Type */}
              <div style={{ 
                fontSize: '0.9rem', 
                opacity: 0.9, 
                marginBottom: '24px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: '600'
              }}>
                {getAccountType()}
              </div>

              {/* Main Balance */}
              <div className="mb-4">
                <div style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '8px' }}>
                  Total Balance
                </div>
                <div className="d-flex align-items-center gap-3">
                  <h1 className="mb-0 fw-bold" style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)' }}>
                    {isBalanceVisible ? formatCurrency(user?.accountBalance || 0, currency) : getMaskedCurrency(currency)}
                  </h1>
                  <button
                    onClick={toggleBalanceVisibility}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      padding: '8px 12px',
                      fontSize: '1.2rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    title={isBalanceVisible ? 'Hide balance' : 'Show balance'}
                  >
                    <i className={`fas fa-eye${isBalanceVisible ? '' : '-slash'}`}></i>
                  </button>
                </div>
              </div>

              {/* Account Number & Status Row */}
              <div style={{ 
                borderTop: 'rgba(255,255,255,0.2) 1px solid', 
                paddingTop: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 'clamp(16px, 3vw, 32px)'
              }}>
                <div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Account Number</div>
                  <div className="d-flex align-items-center gap-2" style={{ marginTop: '8px' }}>
                    <div className="fw-semibold" style={{ fontSize: '1.1rem' }}>
                      {hideAccountNumber ? '****' + (user?.accountNumber || 'N/A').slice(-4) : (user?.accountNumber || 'Not assigned')}
                    </div>
                    <button
                      onClick={() => setHideAccountNumber(!hideAccountNumber)}
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                      title={hideAccountNumber ? 'Show account number' : 'Hide account number'}
                    >
                      <i className={`fas fa-eye${hideAccountNumber ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Status</div>
                  <div style={{ 
                    fontSize: '1.1rem', 
                    marginTop: '8px',
                    background: 'rgba(16, 185, 129, 0.3)',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    width: 'fit-content',
                    fontWeight: '500'
                  }}>
                    ✓ Active
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Section */}
          <div style={{ marginTop: '32px' }} ref={accountInfoRef}>
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              Account Information
            </h5>
            <div className="row g-3">
              {[
                { label: 'Account Name', value: `${user?.firstName || ''} ${user?.lastName || ''}` },
                { label: 'Email', value: user?.email || 'Not provided' },
                { label: 'Phone', value: user?.phone || 'Not provided' },
                { label: 'Account Type', value: getAccountType() },
                { label: 'Daily Transfer Limit', value: getAccountLimits().daily },
                { label: 'Monthly Transfer Limit', value: getAccountLimits().monthly }
              ].map((item, idx) => (
                <div key={idx} className="col-md-6">
                  <div
                    style={{
                      background: isDarkMode ? '#1F2937' : COLORS.light,
                      borderRadius: '12px',
                      padding: '16px',
                      border: isDarkMode ? '1px solid #374151' : 'none'
                    }}
                  >
                    <div style={{ color: COLORS.lightText, fontSize: '0.875rem', marginBottom: '4px' }}>
                      {item.label}
                    </div>
                    <div className="fw-semibold" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="col-lg-4">
          <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
            Quick Actions
          </h5>
          <div className="row g-3">
            {accountActions.map((action, idx) => (
              <div key={idx} className="col-12">
                <button
                  onClick={action.action}
                  style={{
                    background: isDarkMode ? '#1F2937' : COLORS.card,
                    border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB',
                    borderRadius: '16px',
                    padding: '20px',
                    width: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = isDarkMode ? 'none' : '0 8px 16px rgba(0,0,0,0.12)';
                    e.currentTarget.style.borderColor = action.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = isDarkMode ? '#374151' : '#E5E7EB';
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '8px' }} aria-hidden="true">
                    {action.icon}
                  </div>
                  <div className="fw-semibold" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                    {action.label}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: COLORS.lightText, marginTop: '4px' }}>
                    {action.description}
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* Account Tier Card */}
          <div style={{
            background: isDarkMode ? '#1F2937' : COLORS.light,
            borderRadius: '16px',
            padding: '20px',
            marginTop: '24px',
            border: isDarkMode ? '1px solid #374151' : 'none'
          }}>
            <h6 className="fw-bold mb-3" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              📊 Account Tier
            </h6>
            <p className="small mb-0" style={{ color: COLORS.lightText }}>
              Current tier: <strong>{getAccountType()}</strong>
            </p>
            <p style={{ fontSize: '0.85rem', color: COLORS.lightText, margin: '8px 0 0 0' }}>
              Upgrade your account to enjoy higher limits and exclusive features.
            </p>
            <button 
              onClick={() => navigate('/me')}
              className="btn btn-sm mt-3 w-100"
              style={{
                background: COLORS.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}
            >
              View Upgrade Options
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Accounts;
