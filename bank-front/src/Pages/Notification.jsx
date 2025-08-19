import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://full-bank-app.onrender.com/api/auth/notification', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.notifications);
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    await axios.put(`https://full-bank-app.onrender.com/api/auth/notification/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container py-4">
      <h3 className="mb-4">Notifications</h3>
      {notifications.length === 0 ? (
        <div className="alert alert-info">No notifications yet.</div>
      ) : (
        <ul className="list-group">
          {notifications.map(n => (
            <li key={n._id} className={`list-group-item d-flex justify-content-between align-items-center ${n.read ? '' : 'list-group-item-warning'}`}>
              <span>{n.message}</span>
              {!n.read && <button className="btn btn-sm btn-success" onClick={() => markAsRead(n._id)}>Mark as read</button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notification;
