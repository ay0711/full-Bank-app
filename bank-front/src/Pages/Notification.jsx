import React, { useState, useEffect } from 'react';
import PageLayout, { COLORS } from '../components/PageLayout';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/api';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useAppContext();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      // Add cache-busting query param and timeout to improve LCP
      const response = await axios.get(`${API_ENDPOINTS.NOTIFICATIONS}?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000 // 5 second timeout for faster failure feedback
      });
      const notifs = response.data.notifications || [];
      
      console.log('🔔 Fetched notifications:', notifs); // Debug log
      
      // Add default type and timestamp if not present
      const mappedNotifs = notifs.map((n, index) => ({
        ...n,
        type: n.type || 'info',
        id: n._id || `notif-${index}-${Date.now()}`,
        timestamp: n.createdAt ? formatTime(new Date(n.createdAt)) : 'Just now'
      }));
      
      setNotifications(mappedNotifs);
      console.log('✅ Notifications loaded:', mappedNotifs.length); // Debug log
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      console.error('API Endpoint:', API_ENDPOINTS.NOTIFICATIONS);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-NG');
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
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
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner-border" style={{ color: COLORS.primary }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
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
                      aria-label={notif.message}
                    >
                      <div className="d-flex gap-3">
                        <div style={{ fontSize: '1.5rem', flexShrink: 0 }} aria-hidden="true">
                          {getNotificationIcon(notif.type)}
                        </div>
                    <div className="flex-grow-1 min-width-0">
                      <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap">
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-1" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                            Notification
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
                          aria-label={`Delete notification`}
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
                          aria-label="Mark as read"
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
                  aria-label={notif.message}
                >
                  <div className="d-flex gap-3">
                    <div style={{ fontSize: '1.5rem', opacity: 0.6, flexShrink: 0 }} aria-hidden="true">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap">
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-1" style={{ color: isDarkMode ? '#9CA3AF' : COLORS.lightText }}>
                            Notification
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
                          aria-label="Delete notification"
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
      {notifications.length === 0 && !loading && (
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
        </>
      )}
    </PageLayout>
  );
};

export default Notification;
