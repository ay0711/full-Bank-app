import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import BottomNav from './BottomNav';

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

const PageLayout = ({ children, pageTitle, pageSubtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isDarkMode, toggleTheme, logout } = useAppContext();

  const menuItems = [
    { label: 'Dashboard', icon: 'fa-home', path: '/dashboard' },
    { label: 'Transactions', icon: 'fa-exchange-alt', path: '/transactions' },
    { label: 'Accounts', icon: 'fa-wallet', path: '/accounts' },
    { label: 'Investments', icon: 'fa-chart-line', path: '/savings' },
    { label: 'Credit Cards', icon: 'fa-credit-card', path: '/cards' },
    { label: 'Loans', icon: 'fa-handshake', path: '/loans' },
    { label: 'Services', icon: 'fa-cog', path: '/airtime-data' },
    { label: 'My Privileges', icon: 'fa-crown', path: '/me' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: isDarkMode ? '#111827' : '#F9FAFB' }}>
      {/* Sidebar */}
      <aside
        className="d-none d-lg-flex flex-column py-5 px-0 app-sidebar"
        style={{
          width: 280,
          minHeight: '100vh',
          background: isDarkMode ? '#1F2937' : COLORS.card,
          borderRight: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB'
        }}
      >
        <div className="d-flex align-items-center mb-5 px-4">
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '10px',
            background: COLORS.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            color: 'white',
            fontWeight: 'bold'
          }}>
            B
          </div>
          <h5 className="mb-0 fw-bold" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText, fontSize: '1.25rem' }}>
            BankDash
          </h5>
        </div>

        <nav className="flex-grow-1 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className="btn w-100 text-start d-flex align-items-center gap-3 px-4 py-3 rounded-2 mb-2"
                onClick={() => navigate(item.path)}
                style={{
                  background: isActive ? COLORS.primary : 'transparent',
                  color: isActive ? 'white' : isDarkMode ? '#9CA3AF' : COLORS.lightText,
                  border: 'none',
                  fontSize: '0.95rem',
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

        <div className="px-3 border-top" style={{ borderColor: isDarkMode ? '#374151' : '#E5E7EB', paddingTop: '1.5rem' }}>
          <button
            className="btn w-100 text-start d-flex align-items-center gap-3 px-4 py-3 rounded-2 mb-2"
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              color: isDarkMode ? '#9CA3AF' : COLORS.lightText,
              border: 'none',
              fontSize: '0.95rem',
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
            className="btn w-100 text-start d-flex align-items-center gap-3 px-4 py-3 rounded-2"
            onClick={() => { logout(); navigate('/signin'); }}
            style={{
              background: 'transparent',
              color: isDarkMode ? '#9CA3AF' : COLORS.lightText,
              border: 'none',
              fontSize: '0.95rem',
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
        {pageTitle && (
          <div className="mb-5">
            <h2 className="mb-1 fw-bold" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText, fontSize: '1.75rem' }}>
              {pageTitle}
            </h2>
            {pageSubtitle && (
              <p className="mb-0" style={{ color: COLORS.lightText, fontSize: '0.875rem' }}>
                {pageSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        {children}

        {/* Bottom Navigation for Mobile */}
        <div className="d-lg-none mt-4">
          <BottomNav active={location.pathname.substring(1)} />
        </div>
      </main>
    </div>
  );
};

export default PageLayout;
export { COLORS };
