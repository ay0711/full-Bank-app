
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import ayBankCircle from '../../image/ay bank cirlcle.png';
import Cards from './Cards';
import AirtimeData from './AirtimeData';
import Savings from './Savings';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const Dashboard = () => {
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '₦0.00';
    return '₦' + amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState({ totalSpent: 0, totalReceived: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const { user, setUser, isDarkMode, toggleTheme, isBalanceVisible, toggleBalanceVisibility, logout } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      navigate('/signin');
      return;
    }
    // Fetch transactions and notifications
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [txRes, notifRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || 'https://backend-bank-3fqd.onrender.com/api/banking'}/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_API_URL || 'https://backend-bank-3fqd.onrender.com/api/opay'}/notifications`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setTransactions(txRes.data.transactions || []);
        setNotifications(notifRes.data.notifications || []);
        // Calculate analytics
        let totalSpent = 0, totalReceived = 0;
        (txRes.data.transactions || []).forEach(tx => {
          if (tx.type === 'debit') totalSpent += tx.amount;
          if (tx.type === 'credit') totalReceived += tx.amount;
        });
        setAnalytics({ totalSpent, totalReceived });
      } catch (err) {
        // fallback: do nothing
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate, setUser, user]);

  if (!user) {
    return (
      <div className={`min-vh-100 ${isDarkMode ? 'bg-dark' : 'bg-light'} d-flex justify-content-center align-items-center`}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className={`min-vh-100 d-flex ${isDarkMode ? 'bg-dark' : 'bg-light'}`} style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className={`d-none d-md-flex flex-column align-items-center py-4 px-2 ${isDarkMode ? 'bg-dark border-end border-secondary' : 'bg-white border-end'} shadow-sm`} style={{ width: 90 }}>
        <img src={ayBankCircle} alt="AY Bank Logo" style={{ width: 48, height: 48, borderRadius: '50%', marginBottom: 32 }} />
        <button className="btn btn-link mb-4" onClick={() => navigate('/dashboard')} title="Dashboard">
          <i className="fas fa-home fa-lg" style={{ color: '#007bff' }}></i>
        </button>
        <button className="btn btn-link mb-4" onClick={() => navigate('/cards')} title="Cards">
          <i className="fas fa-credit-card fa-lg" style={{ color: '#dc3545' }}></i>
        </button>
        <button className="btn btn-link mb-4" onClick={() => navigate('/savings')} title="Savings">
          <i className="fas fa-piggy-bank fa-lg" style={{ color: '#28a745' }}></i>
        </button>
        <button className="btn btn-link mb-4" onClick={() => navigate('/transactions')} title="Transactions">
          <i className="fas fa-list fa-lg" style={{ color: '#6f42c1' }}></i>
        </button>
        <button className="btn btn-link mb-4" onClick={() => navigate('/me')} title="Profile">
          <i className="fas fa-user fa-lg" style={{ color: '#343a40' }}></i>
        </button>
        <button className="btn btn-link mt-auto" onClick={logout} title="Logout">
          <i className="fas fa-sign-out-alt fa-lg" style={{ color: '#adb5bd' }}></i>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1 px-0 px-md-4 py-4">
        {/* Header: Greeting, Theme Toggle */}
        <div className="d-flex justify-content-between align-items-center mb-4 gap-2 flex-wrap">
          <div>
            <h4 className="fw-bold mb-1">Good day, {user.firstName} {user.lastName}</h4>
            <div className="text-muted small">Welcome back!</div>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <button className="btn btn-outline-primary" onClick={toggleTheme} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} fa-lg`}></i>
            </button>
            <button className="btn btn-outline-danger" onClick={() => { logout(); navigate('/signin'); }} title="Log Out">
              <i className="fas fa-sign-out-alt me-2"></i> Log Out
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="mb-4">
          <div className={`shadow-lg rounded-5 p-4 position-relative overflow-hidden ${isDarkMode ? 'bg-gradient-dark text-light' : 'bg-white'}`} style={{ minHeight: 180 }}>
            <div className="position-absolute" style={{ right: -60, top: -60, width: 200, height: 200, background: 'linear-gradient(135deg, #007bff33 60%, #fff0 100%)', borderRadius: '50%' }}></div>
            <div className="position-relative">
              <div className="d-flex align-items-center mb-2">
                <span className="me-2 text-muted">Total Balance</span>
                <button className="btn btn-sm btn-outline-secondary" onClick={toggleBalanceVisibility}>
                  <i className={`fas ${isBalanceVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              <h1 className="fw-bold mb-0" style={{ fontSize: '2.5rem' }}>{isBalanceVisible ? formatCurrency(user.accountBalance) : '₦****'}</h1>
              <div className="mt-2 text-muted">Account Number: <span className="fw-semibold">{user.accountNumber}</span></div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="row g-3 mb-4">
          {/* Quick Actions with active highlight */}
          {[
            { label: 'Transfer', icon: 'fa-exchange-alt', color: 'primary', path: '/transfer' },
            { label: 'Fund', icon: 'fa-wallet', color: 'success', path: '/fund-account' },
            { label: 'Withdraw', icon: 'fa-money-bill-wave', color: 'warning', path: '/withdraw' },
            { label: 'Airtime/Data', icon: 'fa-mobile-alt', color: 'info', path: '/airtime-data' },
            { label: 'Bills', icon: 'fa-file-invoice-dollar', color: 'secondary', path: '/bill-payments' },
            { label: 'Cards', icon: 'fa-credit-card', color: 'danger', path: '/cards' },
          ].map((action, idx) => {
            const isActive = location.pathname === action.path || (action.path === '/transfer' && location.pathname === '/dashboard');
            return (
              <div className="col-6 col-md-2" key={action.label}>
                <div
                  className={`rounded-4 shadow-sm d-flex flex-column align-items-center py-3 h-100 ${isActive ? `bg-${action.color} text-white` : 'bg-white'}`}
                  style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                  onClick={() => navigate(action.path)}
                >
                  <i className={`fas ${action.icon} fa-2x mb-2 ${isActive ? '' : `text-${action.color}`}`}></i>
                  <div className={`fw-semibold ${isActive ? '' : 'text-dark'}`}>{action.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cards, Airtime/Data, Savings summaries */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <Cards summaryOnly />
          </div>
          <div className="col-md-4">
            <AirtimeData quickPurchaseOnly />
          </div>
          <div className="col-md-4">
            <Savings summaryOnly />
          </div>
        </div>


        {/* Analytics & Notifications */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="bg-white rounded-4 shadow-sm p-4 h-100">
              <h6 className="fw-bold mb-3">Analytics</h6>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Total Spent</span>
                <span className="fw-semibold text-danger">{formatCurrency(analytics.totalSpent)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Total Received</span>
                <span className="fw-semibold text-success">{formatCurrency(analytics.totalReceived)}</span>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-white rounded-4 shadow-sm p-4 h-100">
              <h6 className="fw-bold mb-3">Notifications</h6>
              {notifications.length === 0 ? (
                <div className="text-muted small">No notifications</div>
              ) : (
                <ul className="list-unstyled mb-0" style={{ maxHeight: 120, overflowY: 'auto' }}>
                  {notifications.slice(0, 4).map((notif, idx) => (
                    <li key={idx} className="mb-2 d-flex align-items-start">
                      <i className="fas fa-bell text-warning me-2 mt-1"></i>
                      <div>
                        <div className="fw-semibold">{notif.title || 'Notification'}</div>
                        <div className="small text-muted">{notif.message || notif.body}</div>
                        <div className="small text-secondary">{notif.date ? new Date(notif.date).toLocaleString() : ''}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mb-4">
          <div className="bg-white rounded-4 shadow-sm p-4">
            <h6 className="fw-bold mb-3">Recent Transactions</h6>
            {isLoading ? (
              <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
            ) : transactions.length === 0 ? (
              <div className="text-muted small">No transactions yet</div>
            ) : (
              <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                <table className="table table-borderless align-middle mb-0">
                  <tbody>
                    {transactions.slice(0, 6).map((tx, idx) => (
                      <tr key={idx}>
                        <td><i className={`fas ${tx.type === 'debit' ? 'fa-arrow-up text-danger' : 'fa-arrow-down text-success'}`}></i></td>
                        <td>{tx.description || 'Transaction'}</td>
                        <td>{tx.date ? new Date(tx.date).toLocaleDateString() : ''}</td>
                        <td className={`fw-bold ${tx.type === 'debit' ? 'text-danger' : 'text-success'}`}>{tx.type === 'debit' ? '-' : '+'}{formatCurrency(tx.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* More Features Section */}
        <div className="mb-4">
          <div className="bg-white rounded-4 shadow-sm p-4">
            <h6 className="fw-bold mb-3">More Features</h6>
            <div className="d-flex flex-wrap gap-3">
              <button className="btn btn-outline-primary rounded-pill px-4" onClick={() => navigate('/loans')}>Loans</button>
              <button className="btn btn-outline-success rounded-pill px-4" onClick={() => navigate('/support')}>Support</button>
              <button className="btn btn-outline-warning rounded-pill px-4" onClick={() => navigate('/me')}>Profile & Settings</button>
              <button className="btn btn-outline-info rounded-pill px-4" onClick={() => navigate('/notifications')}>All Notifications</button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation for Mobile */}
        <div className="fixed-bottom d-md-none">
          {/* Pass active prop to BottomNav for green highlight */}
          {(() => {
            let active = 'home';
            if (location.pathname.startsWith('/finances')) active = 'finances';
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
