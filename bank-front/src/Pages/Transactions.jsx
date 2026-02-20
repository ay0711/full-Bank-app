import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import PageLayout, { COLORS } from '../components/PageLayout';
import { formatCurrency } from '../utils/currencyConverter';
import '../styles/DashboardNew.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isDarkMode, settings } = useAppContext();
  const navigate = useNavigate();
  
  // Get currency from settings
  const currency = settings?.currency || 'NGN';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchTransactions();
  }, [navigate]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://full-bank-app.onrender.com/api/banking/transactions', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '₦0.00';
    return '₦' + amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTransactions = transactions
    .filter(tx => {
      if (filter === 'all') return true;
      return tx.type === filter;
    })
    .filter(tx =>
      tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.amount?.toString().includes(searchQuery)
    );

  return (
    <PageLayout pageTitle="Transactions" pageSubtitle="View and manage your transaction history">
      {/* Filters */}
      <div
        className="row g-3 mb-5"
        style={{
          background: isDarkMode ? '#1F2937' : COLORS.card,
          padding: '24px',
          borderRadius: '16px',
          boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
          border: isDarkMode ? '1px solid #374151' : 'none'
        }}
      >
          {/* Search */}
          <div className="col-lg-6">
            <div
              style={{
                background: isDarkMode ? '#374151' : COLORS.light,
                borderRadius: '12px',
                border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <input
                type="text"
                className="form-control border-0"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  color: isDarkMode ? '#F3F4F6' : COLORS.darkText
                }}
              />
              <i className="fas fa-search" style={{ color: COLORS.lightText }}></i>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="col-lg-6">
            <div className="d-flex gap-2 flex-wrap">
              {[
                { label: 'All', value: 'all' },
                { label: 'Money In', value: 'credit' },
                { label: 'Money Out', value: 'debit' }
              ].map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setFilter(btn.value)}
                  style={{
                    background: filter === btn.value ? COLORS.primary : isDarkMode ? '#374151' : COLORS.light,
                    color: filter === btn.value ? 'white' : isDarkMode ? '#D1D5DB' : COLORS.darkText,
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (filter !== btn.value) {
                      e.currentTarget.style.background = isDarkMode ? '#4B5563' : COLORS.lighter;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filter !== btn.value) {
                      e.currentTarget.style.background = isDarkMode ? '#374151' : COLORS.light;
                    }
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div
            className="text-center py-5"
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              border: isDarkMode ? '1px solid #374151' : 'none',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <i className="fas fa-inbox fa-3x mb-3" style={{ color: COLORS.lightText }}></i>
            <h5 style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>No transactions found</h5>
            <p style={{ color: COLORS.lightText, fontSize: '0.875rem' }}>
              {filter === 'all' ? "You haven't made any transactions yet" : `No ${filter === 'credit' ? 'income' : 'expense'} transactions found`}
            </p>
          </div>
        ) : (
          <div>
            {filteredTransactions.map((tx, idx) => (
              <div
                key={idx}
                style={{
                  background: isDarkMode ? '#1F2937' : COLORS.card,
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = isDarkMode ? 'none' : '0 4px 12px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: '12px',
                      background: tx.type === 'debit' ? '#FFEBEE' : '#E8F5E9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem'
                    }}
                  >
                    {tx.type === 'debit' ? '📤' : '📥'}
                  </div>
                  <div>
                    <div className="fw-semibold" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                      {tx.description || 'Transaction'}
                    </div>
                    <div className="small" style={{ color: COLORS.lightText }}>
                      {formatDate(tx.date)}
                    </div>
                  </div>
                </div>
                <div className="text-end">
                  <div
                    className="fw-bold"
                    style={{
                      color: tx.type === 'debit' ? COLORS.danger : COLORS.success,
                      fontSize: '1rem'
                    }}
                  >
                    {tx.type === 'debit' ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                  </div>
                  <div className="small" style={{ color: COLORS.lightText }}>
                    {tx.type === 'debit' ? 'Sent' : 'Received'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Note: Bottom Navigation for Mobile handled by PageLayout */}
      </PageLayout>
    );
  };

  export default Transactions;
