import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaCreditCard, FaMoneyBillWave, FaMobileAlt, FaUser, FaExchangeAlt, FaFileInvoice } from 'react-icons/fa';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  
  const getActive = () => {
    if (path.startsWith('/dashboard')) return 'home';
    if (path.startsWith('/transfer')) return 'transfer';
    if (path.startsWith('/finances')) return 'finances';
    if (path.startsWith('/bill-payments')) return 'bills';
    if (path.startsWith('/cards')) return 'cards';
    if (path.startsWith('/airtime-data')) return 'airtime';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/me')) return 'me';
    return '';
  };
  
  const active = getActive();
  
  return (
    <nav className="fixed-bottom border-top shadow-sm" style={{ 
      zIndex: 1000, 
      background: 'white',
      overflowX: 'auto'
    }}>
      <div className="d-flex justify-content-around py-2" style={{ minWidth: 'fit-content' }}>
        <button 
          className={`btn btn-link ${active === 'home' ? 'text-success' : 'text-muted'}`} 
          onClick={() => navigate('/dashboard')}
          style={{ minWidth: '70px' }}
        >
          <FaHome size={20} />
          <div style={{ fontSize: 10, marginTop: '2px' }}>Home</div>
        </button>
        
        <button 
          className={`btn btn-link ${active === 'transfer' ? 'text-success' : 'text-muted'}`} 
          onClick={() => navigate('/transfer')}
          style={{ minWidth: '70px' }}
        >
          <FaExchangeAlt size={20} />
          <div style={{ fontSize: 10, marginTop: '2px' }}>Send</div>
        </button>
        
        <button 
          className={`btn btn-link ${active === 'bills' ? 'text-success' : 'text-muted'}`} 
          onClick={() => navigate('/bill-payments')}
          style={{ minWidth: '70px' }}
        >
          <FaFileInvoice size={20} />
          <div style={{ fontSize: 10, marginTop: '2px' }}>Bills</div>
        </button>
        
        <button 
          className={`btn btn-link ${active === 'cards' ? 'text-success' : 'text-muted'}`} 
          onClick={() => navigate('/cards')}
          style={{ minWidth: '70px' }}
        >
          <FaCreditCard size={20} />
          <div style={{ fontSize: 10, marginTop: '2px' }}>Cards</div>
        </button>
        
        <button 
          className={`btn btn-link ${active === 'airtime' ? 'text-success' : 'text-muted'}`} 
          onClick={() => navigate('/airtime-data')}
          style={{ minWidth: '70px' }}
        >
          <FaMobileAlt size={20} />
          <div style={{ fontSize: 10, marginTop: '2px' }}>Airtime</div>
        </button>
        
        <button 
          className={`btn btn-link ${active === 'finances' ? 'text-success' : 'text-muted'}`} 
          onClick={() => navigate('/finances')}
          style={{ minWidth: '70px' }}
        >
          <FaMoneyBillWave size={20} />
          <div style={{ fontSize: 10, marginTop: '2px' }}>Finances</div>
        </button>
        
        <button 
          className={`btn btn-link ${active === 'profile' ? 'text-success' : 'text-muted'}`} 
          onClick={() => navigate('/profile')}
          style={{ minWidth: '70px' }}
        >
          <FaUser size={20} />
          <div style={{ fontSize: 10, marginTop: '2px' }}>Profile</div>
        </button>
        
        <button 
          className={`btn btn-link ${active === 'me' ? 'text-success' : 'text-muted'}`} 
          onClick={() => navigate('/me')}
          style={{ minWidth: '70px' }}
        >
          <FaUser size={20} />
          <div style={{ fontSize: 10, marginTop: '2px' }}>Settings</div>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
