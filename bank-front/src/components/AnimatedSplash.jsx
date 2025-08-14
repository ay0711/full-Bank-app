import React, { useEffect, useState } from 'react';
import ayBankLogo from '../../image/ay bank cirlcle.png';

const AnimatedSplash = ({ show, duration = 1200 }) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [show, duration]);

  return visible ? (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(255,255,255,0.95)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'opacity 0.5s',
      opacity: visible ? 1 : 0
    }}>
      <img
        src={ayBankLogo}
        alt="AY Bank Logo"
        style={{
          width: 120,
          height: 120,
          animation: 'splash-bounce 1.2s cubic-bezier(.68,-0.55,.27,1.55)'
        }}
      />
      <style>{`
        @keyframes splash-bounce {
          0% { transform: scale(0.7); opacity: 0; }
          40% { transform: scale(1.1); opacity: 1; }
          60% { transform: scale(0.95); }
          80% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  ) : null;
};

export default AnimatedSplash;
