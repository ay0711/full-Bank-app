import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaCreditCard, FaMoneyBillWave, FaMobileAlt, FaUser } from 'react-icons/fa';

import { useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const getActive = () => {
    if (path.startsWith('/dashboard')) return 'home';
    if (path.startsWith('/finances')) return 'finances';
    if (path.startsWith('/cards')) return 'cards';
    if (path.startsWith('/airtime-data')) return 'airtime';
    if (path.startsWith('/me') || path.startsWith('/profile')) return 'me';
    return '';
  };
  const active = getActive();
  return (
    <nav className="fixed-bottom bg-white border-top shadow-sm" style={{ zIndex: 1000 }}>
      <div className="d-flex justify-content-around py-2">
        <button className={`btn btn-link ${active === 'home' ? 'text-success' : 'text-muted'}`} onClick={() => navigate('/dashboard')}>
          <FaHome size={24} />
          <div style={{ fontSize: 12 }}>Home</div>
        </button>
        <button className={`btn btn-link ${active === 'finances' ? 'text-success' : 'text-muted'}`} onClick={() => navigate('/finances')}>
          <FaMoneyBillWave size={24} />
          <div style={{ fontSize: 12 }}>Finances</div>
        </button>
        <button className={`btn btn-link ${active === 'cards' ? 'text-success' : 'text-muted'}`} onClick={() => navigate('/cards')}>
          <FaCreditCard size={24} />
          <div style={{ fontSize: 12 }}>Cards</div>
        </button>
        <button className={`btn btn-link ${active === 'airtime' ? 'text-success' : 'text-muted'}`} onClick={() => navigate('/airtime-data')}>
          <FaMobileAlt size={24} />
          <div style={{ fontSize: 12 }}>Airtime/Data</div>
        </button>
        <button className={`btn btn-link ${active === 'me' ? 'text-success' : 'text-muted'}`} onClick={() => navigate('/me')}>
          <FaUser size={24} />
          <div style={{ fontSize: 12 }}>Me</div>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
