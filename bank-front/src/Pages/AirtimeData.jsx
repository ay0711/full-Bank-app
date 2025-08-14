import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BottomNav from '../components/BottomNav';

const AirtimeData = () => {
  const [type, setType] = useState('airtime');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Fetch transaction history (stub)
    setHistory([
      { type: 'airtime', amount: 500, phone: '08012345678', date: '2025-08-10' },
      { type: 'data', amount: 1000, phone: '08098765432', date: '2025-08-09' }
    ]);
  }, []);

  const handlePurchase = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const url = type === 'airtime'
  ? 'https://full-bank-app.onrender.com/api/opay/airtime'
  : 'https://full-bank-app.onrender.com/api/opay/data';
      await axios.post(url, { phone, amount }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(`${type === 'airtime' ? 'Airtime' : 'Data'} purchased successfully!`);
      setHistory([{ type, amount, phone, date: new Date().toISOString().slice(0, 10) }, ...history]);
      setPhone('');
      setAmount('');
    } catch {
      setMessage('Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <div className="container py-4">
        <h3 className="mb-4 text-success">Airtime & Data</h3>
        {message && <div className="alert alert-info">{message}</div>}
        <form className="card shadow-sm mb-3 p-3" style={{ borderRadius: '1.5rem' }} onSubmit={handlePurchase}>
          <div className="mb-3">
            <label className="form-label">Type</label>
            <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
              <option value="airtime">Airtime</option>
              <option value="data">Data</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input type="text" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter phone number" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" required />
          </div>
          <button className="btn btn-success w-100" type="submit" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            Buy {type === 'airtime' ? 'Airtime' : 'Data'}
          </button>
        </form>
        <div className="card shadow-sm mb-3" style={{ borderRadius: '1.5rem' }}>
          <div className="card-body">
            <h5>Recent Purchases</h5>
            {history.length === 0 ? (
              <div className="text-muted">No purchases yet</div>
            ) : (
              <ul className="list-group">
                {history.map((tx, idx) => (
                  <li className="list-group-item d-flex justify-content-between align-items-center" key={idx}>
                    <span>{tx.type === 'airtime' ? 'Airtime' : 'Data'} for {tx.phone}</span>
                    <span className="fw-bold">₦{tx.amount}</span>
                    <span className="text-muted" style={{ fontSize: 12 }}>{tx.date}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <BottomNav active="airtime" />
    </div>
  );
};

export default AirtimeData;
