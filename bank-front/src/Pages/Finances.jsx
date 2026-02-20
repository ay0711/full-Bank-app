import React, { useState, useEffect } from 'react';
import PageLayout, { COLORS } from '../components/PageLayout';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/api';

const Finances = () => {
  const [stats, setStats] = useState({
    savings: 0,
    activeLoan: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    investmentTotal: 0
  });
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_ENDPOINTS.DASHBOARD, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000  // 8s timeout - fail fast if backend is slow
      });
      const userData = response.data.user || {};
      
      // Calculate total loan amount from loan applications
      // Include both 'approved' and 'partial-repayment' loans as active
      const totalLoanAmount = userData.loanApplications?.reduce((sum, loan) => {
        if (loan.status === 'approved' || loan.status === 'partial-repayment') {
          return sum + (loan.amount - (loan.totalRepaid || 0));
        }
        return sum;
      }, 0) || 0;
      
      // Calculate monthly expense from transactions
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      const monthlyExpense = userData.transactions?.filter(tx => {
        const txDate = new Date(tx.date);
        return tx.type === 'debit' && txDate >= thisMonth;
      }).reduce((sum, tx) => sum + tx.amount, 0) || 0;
      
      // Calculate monthly income from transactions
      const monthlyIncome = userData.transactions?.filter(tx => {
        const txDate = new Date(tx.date);
        return tx.type === 'credit' && txDate >= thisMonth;
      }).reduce((sum, tx) => sum + tx.amount, 0) || 0;
      
      // Calculate total savings
      const totalSavings = userData.savings?.reduce((sum, saving) => sum + saving.current, 0) || 0;
      
      setStats({
        savings: userData.accountBalance || 0,
        activeLoan: totalLoanAmount,
        monthlyIncome: monthlyIncome || 0,
        monthlyExpense: monthlyExpense || 0,
        investmentTotal: totalSavings
      });
    } catch (error) {
      console.error('Error fetching finance data:', error);
      // Set zeros instead of mock data when API fails
      setStats({
        savings: 0,
        activeLoan: 0,
        monthlyIncome: 0,
        monthlyExpense: 0,
        investmentTotal: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return '₦' + (typeof amount === 'number' ? amount.toLocaleString('en-NG') : '0');
  };

  const StatCard = ({ icon, label, amount, color }) => (
    <div
      style={{
        background: isDarkMode ? '#1F2937' : COLORS.card,
        borderRadius: '16px',
        padding: '24px',
        border: isDarkMode ? '1px solid #374151' : 'none',
        boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
        borderLeft: `4px solid ${color}`
      }}
    >
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <p className="small mb-2" style={{ color: COLORS.lightText }}>
            {label}
          </p>
          <p className="fw-bold mb-0" style={{ fontSize: '1.5rem', color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
            {formatCurrency(amount)}
          </p>
        </div>
        <div style={{ fontSize: '1.75rem' }}>
          {icon}
        </div>
      </div>
    </div>
  );

  const ActionCard = ({ icon, title, description, onClick }) => (
    <div
      onClick={onClick}
      style={{
        background: isDarkMode ? '#1F2937' : COLORS.card,
        borderRadius: '16px',
        padding: '24px',
        border: isDarkMode ? '1px solid #374151' : 'none',
        boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        if (!isDarkMode) e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        if (!isDarkMode) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
      }}
    >
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <h6 className="fw-bold mb-2" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
            {icon} {title}
          </h6>
          <p className="small mb-0" style={{ color: COLORS.lightText }}>
            {description}
          </p>
        </div>
        <i className="fas fa-arrow-right" style={{ color: COLORS.primary }}></i>
      </div>
    </div>
  );

  const SkeletonStat = () => (
    <div
      style={{
        background: isDarkMode ? '#1F2937' : COLORS.card,
        borderRadius: '16px',
        padding: '24px',
        border: isDarkMode ? '1px solid #374151' : 'none',
        boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
        borderLeft: `4px solid ${COLORS.light}`
      }}
    >
      <div className="d-flex justify-content-between align-items-start">
        <div style={{ width: '100%' }}>
          <div style={{ height: '16px', background: isDarkMode ? '#374151' : '#f0f0f0', borderRadius: '4px', marginBottom: '12px', width: '60%' }} />
          <div style={{ height: '28px', background: isDarkMode ? '#374151' : '#f0f0f0', borderRadius: '4px', width: '80%' }} />
        </div>
        <div style={{ fontSize: '1.75rem', opacity: 0.3 }}>📊</div>
      </div>
    </div>
  );

  return (
    <PageLayout pageTitle="Finances" pageSubtitle="Overview of your financial status">
      {/* Key Statistics - Always Show (Skeleton While Loading) */}
      <div className="row g-4 mb-5">
        <div className="col-md-6">
          {loading ? <SkeletonStat /> : <StatCard icon="💰" label="Savings" amount={stats.savings} color={COLORS.success} />}
        </div>
        <div className="col-md-6">
          {loading ? <SkeletonStat /> : <StatCard icon="📊" label="Active Loan" amount={stats.activeLoan} color={COLORS.danger} />}
        </div>
        <div className="col-md-6">
          {loading ? <SkeletonStat /> : <StatCard icon="📈" label="Monthly Income" amount={stats.monthlyIncome} color={COLORS.primary} />}
        </div>
        <div className="col-md-6">
          {loading ? <SkeletonStat /> : <StatCard icon="💸" label="Monthly Expense" amount={stats.monthlyExpense} color={COLORS.warning} />}
        </div>
      </div>

      {/* Finance Summary */}
      <div className="row g-4 mb-5">
        <div className="col-lg-4">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '24px',
              border: isDarkMode ? '1px solid #374151' : 'none',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}
          >
            <p className="small mb-2" style={{ color: COLORS.lightText }}>
              Net Balance
            </p>
            <p className="fw-bold mb-3" style={{ fontSize: '1.75rem', color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              {loading ? <span style={{ background: isDarkMode ? '#374151' : '#f0f0f0', display: 'inline-block', width: '150px', height: '28px', borderRadius: '4px' }} /> : formatCurrency(stats.monthlyIncome - stats.monthlyExpense)}
            </p>
            <div
              style={{
                background: isDarkMode ? '#374151' : COLORS.light,
                borderRadius: '12px',
                padding: '12px',
                fontSize: '0.875rem'
              }}
            >
              <i className="fas fa-check" style={{ color: COLORS.success, marginRight: '8px' }}></i>
              <span style={{ color: COLORS.lightText }}>Good Financial Health</span>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '24px',
              border: isDarkMode ? '1px solid #374151' : 'none',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}
          >
            <p className="small mb-2" style={{ color: COLORS.lightText }}>
              Savings Rate
            </p>
            <p className="fw-bold mb-3" style={{ fontSize: '1.75rem', color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              {loading ? <span style={{ background: isDarkMode ? '#374151' : '#f0f0f0', display: 'inline-block', width: '150px', height: '28px', borderRadius: '4px' }} /> : ((stats.savings / stats.monthlyIncome) * 100).toFixed(1) + '%'}
            </p>
            <div
              style={{
                height: '8px',
                background: isDarkMode ? '#374151' : COLORS.light,
                borderRadius: '999px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: COLORS.success,
                  width: `${Math.min(((stats.savings / stats.monthlyIncome) * 100), 100)}%`
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '24px',
              border: isDarkMode ? '1px solid #374151' : 'none',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}
          >
            <p className="small mb-2" style={{ color: COLORS.lightText }}>
              Investments
            </p>
            <p className="fw-bold mb-3" style={{ fontSize: '1.75rem', color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              {loading ? <span style={{ background: isDarkMode ? '#374151' : '#f0f0f0', display: 'inline-block', width: '150px', height: '28px', borderRadius: '4px' }} /> : formatCurrency(stats.investmentTotal)}
            </p>
            <div
              style={{
                background: isDarkMode ? '#374151' : COLORS.light,
                borderRadius: '12px',
                padding: '12px',
                fontSize: '0.875rem'
              }}
            >
              <span style={{ color: COLORS.success }}>↑ 12% Growth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h5 className="fw-bold mb-3" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
        Quick Actions
      </h5>
      <div className="row g-3">
        <div className="col-md-6">
          <ActionCard
            icon="🏦"
            title="Savings Goals"
            description="Create and track your savings targets"
            onClick={() => navigate('/savings')}
          />
        </div>
        <div className="col-md-6">
          <ActionCard
            icon="💳"
            title="Loans & Credits"
            description="View and manage your active loans"
            onClick={() => navigate('/loans')}
          />
        </div>
        <div className="col-md-6">
          <ActionCard
            icon="📊"
            title="Financial Reports"
            description="View detailed spending analytics"
            onClick={() => navigate('/transactions')}
          />
        </div>
        <div className="col-md-6">
          <ActionCard
            icon="🎯"
            title="Financial Planning"
            description="Get personalized financial advice"
            onClick={() => {}}
          />
        </div>
      </div>

      {/* Tips Section */}
      <div
        style={{
          background: isDarkMode ? '#1F2937' : COLORS.light,
          borderRadius: '16px',
          padding: '24px',
          border: isDarkMode ? '1px solid #374151' : 'none',
          marginTop: '32px'
        }}
      >
        <h6 className="fw-bold mb-3" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
          💡 Financial Tips
        </h6>
        <ul style={{ color: COLORS.lightText, paddingLeft: '20px', margin: 0 }}>
          <li className="mb-2">Aim to save at least 20% of your monthly income</li>
          <li className="mb-2">Review your spending regularly to identify cut costs</li>
          <li className="mb-2">Build an emergency fund for 3-6 months of expenses</li>
          <li>Diversify your investments for better returns</li>
        </ul>
      </div>
    </PageLayout>
  );
};

export default Finances;
