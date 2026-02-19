import React, { useState } from 'react';
import PageLayout, { COLORS } from '../components/PageLayout';
import { useAppContext } from '../context/AppContext';

const Notification = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', title: 'Payment Successful', message: 'Your transfer of ₦50,000 to John was successful', timestamp: '2 hours ago', read: false },
    { id: 2, type: 'info', title: 'New Feature', message: 'Check out our new savings feature to grow your money', timestamp: '5 hours ago', read: false },
    { id: 3, type: 'warning', title: 'Security Alert', message: 'New login detected from Chrome on Windows', timestamp: '1 day ago', read: true },
    { id: 4, type: 'success', title: 'Deposit Received', message: 'You received ₦100,000 from Sarah', timestamp: '2 days ago', read: true },
    { id: 5, type: 'info', title: 'Loan Approved', message: 'Your loan application has been approved', timestamp: '3 days ago', read: true }
  ]);

  const { isDarkMode } = useAppContext();

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    const icons = {
      success: '✅',
      error: '⚠️',
      warning: '🔒',
      info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const readNotifications = notifications.filter(n => n.read);
  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <PageLayout pageTitle="Notifications" pageSubtitle={`You have ${unreadCount} new notification${unreadCount !== 1 ? 's' : ''}`}>
      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        <button
          className="btn"
          style={{
            background: COLORS.primary,
            color: 'white',
            borderRadius: '12px',
            border: 'none',
            padding: '10px 16px',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap'
          }}
          aria-label="Show all notifications"
        >
          All ({notifications.length})
        </button>
        <button
          className="btn"
          style={{
            background: isDarkMode ? '#374151' : COLORS.light,
            color: isDarkMode ? '#D1D5DB' : COLORS.darkText,
            borderRadius: '12px',
            border: 'none',
            padding: '10px 16px',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap'
          }}
          aria-label={`Show ${unreadCount} unread notifications`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Unread Notifications */}
      {unreadNotifications.length > 0 && (
        <>
          <h6 className="fw-bold mb-3" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
            Unread Messages
          </h6>
          <div className="row g-3 mb-5">
            {unreadNotifications.map((notif) => (
              <div key={notif.id} className="col-12 col-sm-6 col-lg-12">
                <div
                  style={{
                    background: isDarkMode ? '#1F2937' : COLORS.light,
                    borderRadius: '16px',
                    padding: '20px',
                    border: isDarkMode ? '1px solid #374151' : '2px solid ' + COLORS.primary,
                    position: 'relative',
                    boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                  role="article"
                  aria-label={`${notif.title}: ${notif.message}`}
                >
                  <div className="d-flex gap-3">
                    <div style={{ fontSize: '1.5rem', flexShrink: 0 }} aria-hidden="true">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap">
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-1" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                            {notif.title}
                          </h6>
                          <p className="small mb-0" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText, wordBreak: 'break-word' }}>
                            {notif.message}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: COLORS.lightText,
                            padding: '0 8px',
                            marginLeft: '8px',
                            flexShrink: 0
                          }}
                          aria-label={`Delete notification: ${notif.title}`}
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <span className="small" style={{ color: COLORS.lightText }}>
                          {notif.timestamp}
                        </span>
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="btn btn-sm"
                          style={{
                            background: COLORS.primary,
                            color: 'white',
                            borderRadius: '8px',
                            border: 'none',
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap'
                          }}
                          aria-label={`Mark as read: ${notif.title}`}
                        >
                          Mark as read
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Read Notifications */}
      {readNotifications.length > 0 && (
        <>
          <h6 className="fw-bold mb-3" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
            Earlier
          </h6>
          <div className="row g-3">
            {readNotifications.map((notif) => (
              <div key={notif.id} className="col-12 col-sm-6 col-lg-12">
                <div
                  style={{
                    background: isDarkMode ? '#1F2937' : COLORS.card,
                    borderRadius: '16px',
                    padding: '20px',
                    border: isDarkMode ? '1px solid #374151' : 'none',
                    position: 'relative',
                    opacity: 0.8,
                    boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                  role="article"
                  aria-label={`${notif.title}: ${notif.message}`}
                >
                  <div className="d-flex gap-3">
                    <div style={{ fontSize: '1.5rem', opacity: 0.6, flexShrink: 0 }} aria-hidden="true">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap">
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-1" style={{ color: isDarkMode ? '#9CA3AF' : COLORS.lightText }}>
                            {notif.title}
                          </h6>
                          <p className="small mb-0" style={{ color: isDarkMode ? '#6B7280' : COLORS.lightText, wordBreak: 'break-word' }}>
                            {notif.message}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: COLORS.lightText,
                            padding: '0 8px',
                            marginLeft: '8px',
                            flexShrink: 0
                          }}
                          aria-label={`Delete notification: ${notif.title}`}
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                      <span className="small" style={{ color: COLORS.lightText }}>
                        {notif.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {notifications.length === 0 && (
        <div
          style={{
            background: isDarkMode ? '#1F2937' : COLORS.card,
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            border: isDarkMode ? '1px solid #374151' : 'none'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔔</div>
          <h6 className="fw-bold" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
            No Notifications
          </h6>
          <p className="small" style={{ color: COLORS.lightText }}>
            You're all caught up! Check back soon for new updates.
          </p>
        </div>
      )}
    </PageLayout>
  );
};

export default Notification;
