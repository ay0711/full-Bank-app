import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Support = () => {
  const [supportRequests, setSupportRequests] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formMsg, setFormMsg] = useState('');

  useEffect(() => {
    fetchSupport();
  }, []);

  const fetchSupport = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('https://full-bank-app.onrender.com/api/auth/support', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setSupportRequests(res.data.supportRequests);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMsg('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://full-bank-app.onrender.com/api/auth/support', { subject, message }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormMsg('Support request sent!');
      setSubject('');
      setMessage('');
      fetchSupport();
    } catch {
      setFormMsg('Failed to send support request.');
    } finally {
      setFormLoading(false);
    }
  };

  const closeRequest = async (id) => {
    const token = localStorage.getItem('token');
    await axios.put(`https://full-bank-app.onrender.com/api/auth/support/${id}/close`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchSupport();
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">Support</h3>
      <form className="card p-3 mb-4" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Subject</label>
          <input type="text" className="form-control" value={subject} onChange={e => setSubject(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Message</label>
          <textarea className="form-control" value={message} onChange={e => setMessage(e.target.value)} required />
        </div>
        <button className="btn btn-primary" type="submit" disabled={formLoading}>{formLoading ? 'Sending...' : 'Send'}</button>
        {formMsg && <div className="mt-2 text-info">{formMsg}</div>}
      </form>
      <h5>Support History</h5>
      {loading ? <div>Loading...</div> : (
        <ul className="list-group">
          {supportRequests.map(s => (
            <li key={s._id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{s.subject}</strong>
                <div className="small text-muted">{s.message}</div>
                <div className="small">Status: <span className={s.status === 'open' ? 'text-success' : 'text-secondary'}>{s.status}</span></div>
              </div>
              {s.status === 'open' && <button className="btn btn-sm btn-outline-danger" onClick={() => closeRequest(s._id)}>Close</button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Support;
