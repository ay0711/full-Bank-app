import React from 'react';

const ConfirmModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = '#EF4444',
  isDarkMode = false
}) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: isDarkMode ? '#1F2937' : '#FFFFFF',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '450px',
          width: '100%',
          boxShadow: isDarkMode ? '0 20px 60px rgba(0, 0, 0, 0.8)' : '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: isDarkMode ? '1px solid #374151' : 'none',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        <style>
          {`
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>

        {/* Icon */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: `${confirmColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '24px'
          }}
        >
          ⚠️
        </div>

        {/* Title */}
        <h5
          style={{
            color: isDarkMode ? '#F3F4F6' : '#1F2937',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '12px',
            textAlign: 'center'
          }}
        >
          {title}
        </h5>

        {/* Message */}
        <p
          style={{
            color: isDarkMode ? '#D1D5DB' : '#6B7280',
            fontSize: '1rem',
            lineHeight: '1.6',
            marginBottom: '28px',
            textAlign: 'center',
            whiteSpace: 'pre-line'
          }}
        >
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'stretch' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px 24px',
              borderRadius: '12px',
              border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB',
              background: isDarkMode ? '#374151' : '#F3F4F6',
              color: isDarkMode ? '#F3F4F6' : '#1F2937',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? '#4B5563' : '#E5E7EB';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDarkMode ? '#374151' : '#F3F4F6';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              flex: 1,
              padding: '14px 24px',
              borderRadius: '12px',
              border: 'none',
              background: confirmColor,
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `0 8px 20px ${confirmColor}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
