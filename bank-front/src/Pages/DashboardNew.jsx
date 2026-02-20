
import React, { useState, useEffect, startTransition, useMemo } from 'react';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import ayBankCircle from '../../image/ay bank cirlcle.png';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import '../styles/DashboardNew.css';
import { formatCurrency, getMaskedCurrency } from '../utils/currencyConverter';
import { API_ENDPOINTS } from '../utils/api';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';

const COLORS = {
  primary: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  secondary: '#6B7280',
  light: '#F3F4F6',
  lighter: '#E5E7EB',
  darkText: '#1F2937',
  lightText: '#6B7280',
  card: '#FFFFFF',
  cardHover: '#F9FAFB'
};

const chartColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Dashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState({ totalSpent: 0, totalReceived: 0 });
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [quickTransferUsers, setQuickTransferUsers] = useState([]);
  const [quickTransferAmount, setQuickTransferAmount] = useState('');
  const [selectedQuickRecipient, setSelectedQuickRecipient] = useState(null);
  const { user, setUser, isDarkMode, toggleTheme, isBalanceVisible, toggleBalanceVisibility, logout, settings } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get currency from settings, default to NGN
  const currency = settings?.currency || 'NGN';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      navigate('/signin');
      return;
    }
    // Fetch ONLY transactions for critical path
    const fetchCriticalData = async () => {
      try {
        setIsLoading(true);
        const txRes = await axios.get(API_ENDPOINTS.TRANSACTIONS, { 
          headers: { Authorization: `Bearer ${token}` }, 
          timeout: 8000 
        });
        setTransactions(txRes.data.transactions || []);
        
        // Calculate analytics immediately
        let totalSpent = 0, totalReceived = 0;
        (txRes.data.transactions || []).forEach(tx => {
          if (tx.type === 'debit') totalSpent += tx.amount;
          if (tx.type === 'credit') totalReceived += tx.amount;
        });
        setAnalytics({ totalSpent, totalReceived });
        setAnalyticsLoaded(true);
        
        // Defer non-critical calculations to not block rendering
        startTransition(() => {
          // Generate weekly activity data from REAL transactions
          const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const today = new Date();
          const weeklyActivity = weekDays.map((day, index) => {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() - (6 - index));
            const dateStr = targetDate.toISOString().split('T')[0];
            
            const dayTransactions = (txRes.data.transactions || []).filter(tx => {
              const txDate = new Date(tx.date || tx.createdAt).toISOString().split('T')[0];
              return txDate === dateStr;
            });
            
            const deposit = dayTransactions
              .filter(tx => tx.type === 'credit')
              .reduce((sum, tx) => sum + (tx.amount || 0), 0);
            const withdraw = dayTransactions
              .filter(tx => tx.type === 'debit')
              .reduce((sum, tx) => sum + (tx.amount || 0), 0);
            
            return { day, Deposit: deposit, Withdraw: withdraw };
          });
          setWeeklyData(weeklyActivity);

          // Generate expense statistics from REAL transaction categories
          const categories = {};
          (txRes.data.transactions || []).forEach(tx => {
            if (tx.type === 'debit') {
              const category = tx.category || 'Others';
              categories[category] = (categories[category] || 0) + (tx.amount || 0);
            }
          });
          
          const totalExpenses = Object.values(categories).reduce((sum, val) => sum + val, 0) || 1;
          const expenseStats = Object.entries(categories).map(([name, value]) => ({
            name,
            value: Math.round((value / totalExpenses) * 100)
          })).sort((a, b) => b.value - a.value).slice(0, 4);
          
          // Ensure we have at least some data for display
          if (expenseStats.length === 0) {
            setExpenseData([
              { name: 'No expenses', value: 100 }
            ]);
          } else {
            setExpenseData(expenseStats);
          }
        });
      } catch (err) {
        // fallback: do nothing
      } finally {
        setIsLoading(false);
      }
    };
    fetchCriticalData();
  }, [navigate, setUser, user]);

  // Fetch notifications and recipients separately (non-critical)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchNonCritical = async () => {
      try {
        const [notifRes, recipientsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || 'https://full-bank-app.onrender.com'}/api/auth/notification`, { 
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          }).catch(() => ({ data: { notifications: [] } })),
          axios.get(API_ENDPOINTS.RECIPIENTS, { 
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          }).catch(() => ({ data: { recipients: [] } }))
        ]);
        
        setNotifications(notifRes.data.notifications || []);
        
        const recipients = (recipientsRes.data.recipients || []).map((recipient, index) => {
          const name = recipient.name || `Acct ${recipient.accountNumber}`;
          return {
            id: index + 1,
            name,
            accountNumber: recipient.accountNumber,
            role: 'Contact',
            initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            color: ['#667eea', '#764ba2', '#f093fb', '#4F46E5', '#10B981', '#F59E0B'][index % 6]
          };
        });

        setQuickTransferUsers(recipients.slice(0, 3));
      } catch (err) {
        console.error('Error fetching non-critical data:', err);
      }
    };
    
    fetchNonCritical();
  }, []);

  if (!user) {
    return (
      <div className={`min-vh-100 ${isDarkMode ? 'bg-dark' : 'bg-light'} d-flex justify-content-center align-items-center`}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  const StatCard = ({ title, value, change, icon, iconBg, changeType = 'positive', showEyeIcon, onToggleVisibility }) => (
    <div
      className={`rounded-4 border-0 overflow-hidden transition-all`}
      style={{
        background: isDarkMode ? '#1F2937' : COLORS.card,
        boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: isDarkMode ? '1px solid #374151' : 'none'
      }}
      onMouseEnter={(e) => {
        if (!isDarkMode) {
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDarkMode) {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-3">
        <span className={`${isDarkMode ? 'text-secondary' : 'text-muted'}`} style={{ fontSize: '0.875rem', fontWeight: 500 }}>
          {title}
        </span>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: '12px',
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}
        >
          {icon}
        </div>
      </div>
      <div className="d-flex align-items-center gap-2">
        <h3 className="fw-bold mb-2" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText, fontSize: '1.75rem', flex: '1' }}>
          {value}
        </h3>
        {showEyeIcon && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: COLORS.lightText,
              cursor: 'pointer',
              padding: '8px',
              fontSize: '1.2rem',
              transition: 'all 0.2s ease',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? '#374151' : COLORS.light;
              e.currentTarget.style.color = COLORS.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = COLORS.lightText;
            }}
            title={isBalanceVisible ? 'Hide balance' : 'Show balance'}
          >
            <i className={`fas fa-eye${isBalanceVisible ? '' : '-slash'}`}></i>
          </button>
        )}
      </div>
      <div style={{ fontSize: '0.875rem', color: changeType === 'positive' ? COLORS.success : COLORS.danger }}>
        <i className={`fas fa-arrow-${changeType === 'positive' ? 'up' : 'down'} me-1`}></i>
        <span>{Math.abs(change)}% from last month</span>
      </div>
    </div>
  );

  const SkeletonStatCard = () => (
    <div
      className={`rounded-4 border-0 overflow-hidden`}
      style={{
        background: isDarkMode ? '#1F2937' : COLORS.card,
        boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
        padding: '24px',
        border: isDarkMode ? '1px solid #374151' : 'none'
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div style={{ height: '16px', background: isDarkMode ? '#374151' : '#f0f0f0', borderRadius: '4px', width: '80px' }} />
        <div style={{ width: 50, height: 50, borderRadius: '12px', background: isDarkMode ? '#374151' : '#f0f0f0' }} />
      </div>
      <div style={{ height: '28px', background: isDarkMode ? '#374151' : '#f0f0f0', borderRadius: '4px', marginBottom: '12px', width: '100px' }} />
      <div style={{ height: '14px', background: isDarkMode ? '#374151' : '#f0f0f0', borderRadius: '4px', width: '60px' }} />
    </div>
  );

  const ChartCard = ({ title, children }) => (
    <div
      style={{
        background: isDarkMode ? '#1F2937' : COLORS.card,
        boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
        padding: '28px',
        borderRadius: '16px',
        border: isDarkMode ? '1px solid #374151' : 'none'
      }}
    >
      <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
        {title}
      </h5>
      {children}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: isDarkMode ? '#111827' : '#F9FAFB' }}>
      {/* Sidebar */}
      <aside
        className="d-none d-lg-flex flex-column py-3 px-0 app-sidebar"
        style={{
          width: 280,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100vh',
          background: isDarkMode ? '#1F2937' : COLORS.card,
          borderRight: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB',
          overflowX: 'hidden',
          overflowY: 'hidden'
        }}
      >
        {/* Logo */}
        <div className="d-flex align-items-center mb-3 px-4">
          <img
            src={ayBankCircle}
            alt="BankDash"
            loading="eager"
            fetchPriority="high"
            style={{ width: 42, height: 42, marginRight: 12, borderRadius: '10px' }}
          />
          <h5 className="mb-0 fw-bold" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText, fontSize: '1.25rem' }}>
            BankDash
          </h5>
        </div>

        {/* Menu Items */}
        <nav className="flex-grow-1 px-3" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {[
            { label: 'Dashboard', icon: 'fa-home', path: '/dashboard' },
            { label: 'Accounts', icon: 'fa-wallet', path: '/accounts' },
            { label: 'Transfers', icon: 'fa-exchange-alt', path: '/transfer' },
            { label: 'Transactions', icon: 'fa-history', path: '/transactions' },
            { label: 'Bill Payments', icon: 'fa-file-invoice', path: '/bill-payments' },
            { label: 'Cards', icon: 'fa-credit-card', path: '/cards' },
            { label: 'Savings', icon: 'fa-chart-line', path: '/savings' },
            { label: 'Loans', icon: 'fa-handshake', path: '/loans' },
            { label: 'Finances', icon: 'fa-money-bill-wave', path: '/finances' },
            { label: 'Airtime & Data', icon: 'fa-mobile-alt', path: '/airtime-data' },
            { label: 'Profile', icon: 'fa-user-circle', path: '/profile' },
            { label: 'Settings', icon: 'fa-cog', path: '/me' }
          ].map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className="btn w-100 text-start d-flex align-items-center gap-3 px-3 py-2 rounded-2 mb-1"
                onClick={() => navigate(item.path)}
                style={{
                  background: isActive ? COLORS.primary : 'transparent',
                  color: isActive ? 'white' : isDarkMode ? '#9CA3AF' : COLORS.lightText,
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = isDarkMode ? '#374151' : '#F3F4F6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <i className={`fas ${item.icon}`}></i>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Settings & Logout */}
        <div className="px-3 border-top" style={{ borderColor: isDarkMode ? '#374151' : '#E5E7EB', paddingTop: '1.5rem' }}>
          <button
            className="btn w-100 text-start d-flex align-items-center gap-3 px-3 py-2 rounded-2 mb-1"
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              color: isDarkMode ? '#9CA3AF' : COLORS.lightText,
              border: 'none',
              fontSize: '0.85rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? '#374151' : '#F3F4F6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            className="btn w-100 text-start d-flex align-items-center gap-3 px-3 py-2 rounded-2"
            onClick={() => { logout(); navigate('/signin'); }}
            style={{
              background: 'transparent',
              color: isDarkMode ? '#9CA3AF' : COLORS.lightText,
              border: 'none',
              fontSize: '0.85rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? '#374151' : '#F3F4F6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1 p-3 p-md-4 p-lg-5 app-main" style={{ overflowY: 'auto' }}>
        {/* Header */}
        <div className="mb-4 mb-md-5">
          <div className="d-flex justify-content-between align-items-start mb-3 gap-3 flex-column flex-md-row">
            <div>
              <h2 className="mb-0 fw-bold" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText, fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
                Welcome, {user.firstName}!
              </h2>
            </div>
            <div className="d-flex gap-2 gap-md-3 align-items-center">
              {/* Search Bar with Results */}
              <div style={{ position: 'relative', flex: '1 1 auto', minWidth: '200px', maxWidth: '300px' }}>
              <div
                className="input-group"
                style={{
                  width: '100%',
                  background: isDarkMode ? '#374151' : COLORS.card,
                  borderRadius: '12px',
                  border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                  padding: '0 12px'
                }}
              >
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(e.target.value.length > 0);
                  }}
                  style={{
                    background: 'transparent',
                    color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                    fontSize: '0.875rem'
                  }}
                />
                <span
                  className="input-group-text bg-transparent border-0"
                  style={{ color: COLORS.lightText, cursor: 'pointer' }}
                >
                  <i className="fas fa-search"></i>
                </span>
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchQuery && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: isDarkMode ? '#1F2937' : COLORS.card,
                    border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    marginTop: '8px',
                    zIndex: 1000,
                    maxHeight: '300px',
                    overflowY: 'auto',
                    boxShadow: isDarkMode ? 'none' : '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  {transactions
                    .filter(tx =>
                      tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      tx.amount?.toString().includes(searchQuery)
                    )
                    .slice(0, 5)
                    .map((tx, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSearchQuery('');
                          setShowSearchResults(false);
                          navigate('/transactions');
                        }}
                        style={{
                          padding: '12px 16px',
                          borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB',
                          cursor: 'pointer',
                          hoverColor: isDarkMode ? '#374151' : '#F3F4F6'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = isDarkMode ? '#374151' : '#F3F4F6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText, fontSize: '0.875rem' }}>
                            {tx.description}
                          </span>
                          <span
                            style={{
                              color: tx.type === 'debit' ? COLORS.danger : COLORS.success,
                              fontWeight: 'bold',
                              fontSize: '0.875rem'
                            }}
                          >
                            {tx.type === 'debit' ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  {transactions.filter(tx =>
                    tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    tx.amount?.toString().includes(searchQuery)
                  ).length === 0 && (
                    <div
                      style={{
                        padding: '16px',
                        textAlign: 'center',
                        color: COLORS.lightText,
                        fontSize: '0.875rem'
                      }}
                    >
                      No transactions found
                    </div>
                  )}
                </div>
              )}
            </div>

              {/* Settings Button */}
              <button
                className="btn rounded-2"
                onClick={() => navigate('/me')}
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  border: 'none',
                  color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              title="Settings"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode ? '#4B5563' : COLORS.lighter;
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode ? '#374151' : COLORS.light;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <i className="fas fa-cog"></i>
            </button>

              {/* Notification Button */}
              <button
                className="btn rounded-2 position-relative"
                onClick={() => navigate('/notification')}
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  border: 'none',
                  color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              title="Notifications"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode ? '#4B5563' : COLORS.lighter;
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode ? '#374151' : COLORS.light;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <i className="fas fa-bell"></i>
              {notifications.length > 0 && (
                <span
                  className="position-absolute top-0 end-0 translate-middle"
                  style={{
                    background: COLORS.danger,
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }}
                >
                  {notifications.length}
                </span>
              )}
            </button>

              {/* Profile Avatar */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  background: COLORS.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  flexShrink: 0
                }}
              onClick={() => navigate('/me')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Profile"
            >
              {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-6 col-lg-4">
            <StatCard
              title="Total Balance"
              value={isBalanceVisible ? formatCurrency(user.accountBalance, currency) : getMaskedCurrency(currency)}
              change={2.5}
              icon="💳"
              iconBg={isDarkMode ? '#374151' : '#E3F2FD'}
              changeType="positive"
              showEyeIcon={true}
              onToggleVisibility={toggleBalanceVisibility}
            />
          </div>
          <div className="col-md-6 col-lg-4">
            {analyticsLoaded ? (
              <StatCard
                title="Total Income"
                value={formatCurrency(analytics.totalReceived, currency)}
                change={1.2}
                icon="📈"
                iconBg={isDarkMode ? '#374151' : '#E8F5E9'}
                changeType="positive"
              />
            ) : (
              <SkeletonStatCard />
            )}
          </div>
          <div className="col-md-6 col-lg-4">
            {analyticsLoaded ? (
              <StatCard
                title="Total Expense"
                value={formatCurrency(analytics.totalSpent, currency)}
                change={0.5}
                icon="📉"
                iconBg={isDarkMode ? '#374151' : '#FFEBEE'}
                changeType="negative"
              />
            ) : (
              <SkeletonStatCard />
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="row g-4 mb-5">
          {/* Weekly Activity Chart */}
          <div className="col-lg-8">
            <ChartCard title="Weekly Activity">
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDarkMode ? '#374151' : '#E5E7EB'}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                      style={{ fontSize: '0.875rem' }}
                    />
                    <YAxis
                      stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                      style={{ fontSize: '0.875rem' }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: isDarkMode ? '#374151' : COLORS.card,
                        borderRadius: '12px',
                        border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                        color: isDarkMode ? '#F3F4F6' : COLORS.darkText
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Bar dataKey="Deposit" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Withdraw" fill={COLORS.success} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" />
                </div>
              )}
            </ChartCard>
          </div>

          {/* Expense Statistics */}
          <div className="col-lg-4">
            <ChartCard title="Expense Statistics">
              {expenseData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4">
                    {expenseData.map((item, idx) => (
                      <div key={idx} className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <span
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              background: chartColors[idx % chartColors.length]
                            }}
                          ></span>
                          <span style={{ color: isDarkMode ? '#D1D5DB' : COLORS.lightText, fontSize: '0.875rem' }}>
                            {item.name}
                          </span>
                        </div>
                        <span
                          className="fw-semibold"
                          style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText, fontSize: '0.875rem' }}
                        >
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" />
                </div>
              )}
            </ChartCard>
          </div>
        </div>

        {/* Quick Transfer & Recent Transactions */}
        <div className="row g-4 mb-5">
          {/* Quick Transfer */}
          <div className="col-lg-6">
            <div
              style={{
                background: isDarkMode ? '#1F2937' : COLORS.card,
                boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                padding: 'clamp(20px, 4vw, 28px)',
                borderRadius: '16px',
                border: isDarkMode ? '1px solid #374151' : 'none'
              }}
            >
              <h5 className="fw-bold mb-3 mb-md-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText, fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
                Quick Transfer
              </h5>
              {quickTransferUsers.length > 0 ? (
                <>
                  <div className="d-flex justify-content-around align-items-start gap-2 gap-md-3 mb-3 mb-md-4">
                {quickTransferUsers.map((u) => {
                  const isSelected = selectedQuickRecipient?.accountNumber === u.accountNumber;
                  return (
                  <div
                    key={u.id}
                    className="text-center"
                    style={{ cursor: 'pointer', flex: '1 1 0', maxWidth: '110px', minWidth: '60px' }}
                    onClick={() => setSelectedQuickRecipient(u)}
                  >
                    <div
                      style={{
                        width: '100%',
                        paddingTop: '100%',
                        position: 'relative',
                        borderRadius: 'clamp(10px, 2vw, 14px)',
                        marginBottom: 'clamp(8px, 2vw, 12px)'
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `linear-gradient(135deg, ${u.color} 0%, ${u.color}dd 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'clamp(1rem, 3vw, 1.5rem)',
                          color: 'white',
                          fontWeight: 'bold',
                          boxShadow: `0 4px 12px ${u.color}33`,
                          transition: 'all 0.3s ease',
                          borderRadius: 'clamp(10px, 2vw, 14px)',
                          outline: isSelected ? `2px solid ${COLORS.primary}` : 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = `0 8px 20px ${u.color}55`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = `0 4px 12px ${u.color}33`;
                        }}
                      >
                        {u.initials}
                      </div>
                    </div>
                    <div 
                      className="fw-semibold" 
                      style={{ 
                        color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                        fontSize: 'clamp(0.7rem, 1.8vw, 0.875rem)',
                        lineHeight: '1.2',
                        marginBottom: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {u.name}
                    </div>
                    <div 
                      className="text-muted" 
                      style={{ 
                        fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {u.role}
                    </div>
                  </div>
                );
                })}
              </div>
              <div className="mb-2" style={{ fontSize: '0.8rem', color: COLORS.lightText }}>
                {selectedQuickRecipient ? `Sending to: ${selectedQuickRecipient.name}` : 'Select a contact to send money'}
              </div>
              <div className="d-flex gap-2 flex-column flex-sm-row">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Amount"
                  value={quickTransferAmount}
                  onChange={(e) => setQuickTransferAmount(e.target.value)}
                  style={{
                    background: isDarkMode ? '#374151' : COLORS.light,
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                    borderRadius: '12px',
                    padding: 'clamp(10px, 2vw, 12px) clamp(12px, 3vw, 16px)',
                    fontSize: 'clamp(0.875rem, 2vw, 1rem)'
                  }}
                />
                <button
                  className="btn fw-semibold"
                  onClick={() => {
                    if (!selectedQuickRecipient || !quickTransferAmount) {
                      return;
                    }
                    navigate('/transfer', {
                      state: {
                        recipientAccountNumber: selectedQuickRecipient.accountNumber,
                        amount: quickTransferAmount,
                        description: 'Quick transfer'
                      }
                    });
                  }}
                  disabled={!selectedQuickRecipient || !quickTransferAmount}
                  style={{
                    background: COLORS.primary,
                    color: 'white',
                    borderRadius: '12px',
                    border: 'none',
                    padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 24px)',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap',
                    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                    minWidth: '100px',
                    opacity: (!selectedQuickRecipient || !quickTransferAmount) ? 0.6 : 1,
                    cursor: (!selectedQuickRecipient || !quickTransferAmount) ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#3730A3';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = COLORS.primary;
                  }}
                >
                  <i className="fas fa-arrow-right me-2"></i>
                  Send
                </button>
              </div>
              </>
              ) : (
                <div className="text-center py-5">
                  <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }}>👥</div>
                  <p style={{ color: COLORS.lightText, fontSize: '0.875rem', marginBottom: '12px' }}>
                    No recent contacts yet
                  </p>
                  <p style={{ color: COLORS.lightText, fontSize: '0.75rem' }}>
                    Make your first transfer to see quick contacts here
                  </p>
                  <button
                    className="btn btn-sm fw-semibold mt-3"
                    onClick={() => navigate('/transfer')}
                    style={{
                      background: COLORS.primary,
                      color: 'white',
                      borderRadius: '8px',
                      border: 'none',
                      padding: '8px 16px'
                    }}
                  >
                    Make Transfer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="col-lg-6">
            <div
              style={{
                background: isDarkMode ? '#1F2937' : COLORS.card,
                boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                padding: '28px',
                borderRadius: '16px',
                border: isDarkMode ? '1px solid #374151' : 'none'
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                  Recent Transactions
                </h5>
                <button
                  className="btn btn-link p-0 text-primary fw-semibold"
                  onClick={() => navigate('/transactions')}
                  style={{ fontSize: '0.875rem', textDecoration: 'none' }}
                >
                  See All →
                </button>
              </div>
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-muted small text-center py-4">No transactions yet</div>
              ) : (
                <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                  {transactions.slice(0, 5).map((tx, idx) => (
                    <div
                      key={idx}
                      className="d-flex justify-content-between align-items-center mb-4 pb-4"
                      style={{
                        borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB'
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
                          <div
                            className="fw-semibold small"
                            style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}
                          >
                            {tx.description || 'Transaction'}
                          </div>
                          <div
                            className="text-muted"
                            style={{ fontSize: '0.8rem' }}
                          >
                            {tx.date ? new Date(tx.date).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div
                        className="fw-bold"
                        style={{
                          color: tx.type === 'debit' ? COLORS.danger : COLORS.success,
                          fontSize: '0.95rem'
                        }}
                      >
                        {tx.type === 'debit' ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Navigation for Mobile */}
        <div className="d-lg-none">
          {(() => {
            let active = 'home';
            if (location.pathname.startsWith('/transactions')) active = 'transactions';
            else if (location.pathname.startsWith('/cards')) active = 'cards';
            else if (location.pathname.startsWith('/airtime-data')) active = 'airtime';
            else if (location.pathname.startsWith('/me') || location.pathname.startsWith('/profile')) active = 'me';
            return <BottomNav active={active} />;
          })()}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
