import React, { useState, useEffect } from 'react';
import PageLayout, { COLORS } from '../components/PageLayout';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';

const BillPayments = () => {
  const [category, setCategory] = useState('electricity');
  const [provider, setProvider] = useState('');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const { isDarkMode } = useAppContext();

  const providers = {
    electricity: ['NEPA', 'Ikeja Electric', 'EEDC'],
    water: ['Okinni Water', 'Lagos Water', 'PW'],
    internet: ['Spectranet', 'Swift', 'Starcomms']
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://full-bank-app.onrender.com/api/bills', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });
      setHistory(response.data.history || [
        { category: 'electricity', provider: 'NEPA', amount: 5000, date: '2025-08-10' },
        { category: 'water', provider: 'Okinni Water', amount: 2000, date: '2025-08-09' }
      ]);
    } catch {
      setHistory([
        { category: 'electricity', provider: 'NEPA', amount: 5000, date: '2025-08-10' },
        { category: 'water', provider: 'Okinni Water', amount: 2000, date: '2025-08-09' }
      ]);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://full-bank-app.onrender.com/api/bills', 
        { category, provider, amount, phone }, 
        { headers: { Authorization: `Bearer ${token}` }, timeout: 8000 }
      );
      setMessage('Bill payment successful!');
      setHistory([{ category, provider, amount: parseInt(amount), date: new Date().toISOString().slice(0, 10) }, ...history]);
      setProvider('');
      setAmount('');
      setPhone('');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Payment failed');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return '₦' + (typeof amount === 'number' ? amount.toLocaleString('en-NG') : '0');
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'electricity': return '⚡';
      case 'water': return '💧';
      case 'internet': return '📡';
      default: return '💳';
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'electricity': return COLORS.warning;
      case 'water': return COLORS.primary;
      case 'internet': return COLORS.success;
      default: return COLORS.light;
    }
  };

  return (
    <PageLayout pageTitle="Bill Payments" pageSubtitle="Pay bills for utilities and services">
      {/* Success/Error Message */}
      {message && (
        <div
          style={{
            background: message.includes('successful') ? COLORS.success : COLORS.danger,
            color: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}
        >
          {message}
        </div>
      )}

      <div className="row g-4 mb-5">
        {/* Payment Form */}
        <div className="col-lg-6">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '28px',
              border: isDarkMode ? '1px solid #374151' : 'none',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              Pay Bill
            </h5>

            <form onSubmit={handlePayment}>
              <div className="mb-4">
                <label className="small fw-semibold mb-3 d-block" style={{ color: COLORS.lightText }}>
                  Category
                </label>
                <div className="d-grid gap-2">
                  {['electricity', 'water', 'internet'].map((cat) => (
                    <label key={cat} style={{ cursor: 'pointer' }}>
                      <div
                        onClick={() => {
                          setCategory(cat);
                          setProvider('');
                        }}
                        style={{
                          background: category === cat ? COLORS.primary : (isDarkMode ? '#374151' : COLORS.light),
                          border: category === cat ? `2px solid ${COLORS.primary}` : 'none',
                          borderRadius: '12px',
                          padding: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <p
                          className="small fw-semibold mb-0"
                          style={{ color: category === cat ? 'white' : (isDarkMode ? '#D1D5DB' : COLORS.darkText) }}
                        >
                          {getCategoryIcon(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </p>
                      </div>
                      <input type="radio" name="category" value={cat} checked={category === cat} onChange={() => {}} style={{ display: 'none' }} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="small fw-semibold mb-2" style={{ color: COLORS.lightText }}>
                  Provider
                </label>
                <select
                  className="form-select"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  required
                  style={{
                    background: isDarkMode ? '#374151' : COLORS.light,
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                    padding: '12px 16px'
                  }}
                >
                  <option value="">Select Provider</option>
                  {providers[category]?.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="small fw-semibold mb-2" style={{ color: COLORS.lightText }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number for bill"
                  required
                  style={{
                    background: isDarkMode ? '#374151' : COLORS.light,
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                    padding: '12px 16px'
                  }}
                />
              </div>

              <div className="mb-4">
                <label className="small fw-semibold mb-2" style={{ color: COLORS.lightText }}>
                  Amount
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="100"
                  required
                  style={{
                    background: isDarkMode ? '#374151' : COLORS.light,
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                    padding: '12px 16px'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn w-100 fw-semibold"
                style={{
                  background: COLORS.primary,
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  padding: '12px',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" style={{ width: '16px', height: '16px' }} />
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check me-2"></i>
                    Pay Bill
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Categories Overview */}
        <div className="col-lg-6">
          <h5 className="fw-bold mb-3" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
            Popular Billers
          </h5>
          <div className="d-grid gap-3">
            {['electricity', 'water', 'internet'].map((cat) => (
              <div
                key={cat}
                style={{
                  background: isDarkMode ? '#1F2937' : COLORS.card,
                  borderRadius: '16px',
                  padding: '20px',
                  border: isDarkMode ? '1px solid #374151' : 'none',
                  boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  if (!isDarkMode) e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  if (!isDarkMode) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                }}
                onClick={() => setCategory(cat)}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p
                      className="fw-bold mb-1"
                      style={{ fontSize: '1.25rem', color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}
                    >
                      {getCategoryIcon(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </p>
                    <p className="small mb-0" style={{ color: COLORS.lightText }}>
                      {providers[cat].length} providers available
                    </p>
                  </div>
                  <i className="fas fa-arrow-right" style={{ color: getCategoryColor(cat) }}></i>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.light,
              borderRadius: '16px',
              padding: '20px',
              border: isDarkMode ? '1px solid #374151' : 'none',
              marginTop: '20px'
            }}
          >
            <h6 className="fw-bold mb-2" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              💡 Tip
            </h6>
            <p className="small mb-0" style={{ color: COLORS.lightText }}>
              Payments are processed instantly. Keep your receipts for records.
            </p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {history.length > 0 && (
        <div>
          <h5 className="fw-bold mb-3" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
            Payment History
          </h5>
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '0',
              border: isDarkMode ? '1px solid #374151' : 'none',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              overflow: 'hidden'
            }}
          >
            <div className="table-responsive">
              <table className="table table-borderless mb-0">
                <thead>
                  <tr style={{ borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB' }}>
                    <th style={{ color: COLORS.lightText, fontSize: '0.875rem', fontWeight: 'semibold', padding: '16px' }}>Category</th>
                    <th style={{ color: COLORS.lightText, fontSize: '0.875rem', fontWeight: 'semibold', padding: '16px' }}>Provider</th>
                    <th style={{ color: COLORS.lightText, fontSize: '0.875rem', fontWeight: 'semibold', padding: '16px' }}>Amount</th>
                    <th style={{ color: COLORS.lightText, fontSize: '0.875rem', fontWeight: 'semibold', padding: '16px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((tx, idx) => (
                    <tr key={idx} style={{ borderBottom: idx < history.length - 1 ? (isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB') : 'none' }}>
                      <td style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText, padding: '16px' }}>
                        <span
                          style={{
                            background: getCategoryColor(tx.category),
                            color: tx.category === 'water' ? 'white' : (tx.category === 'electricity' ? '#1F2937' : 'white'),
                            padding: '4px 12px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {getCategoryIcon(tx.category)} {tx.category.charAt(0).toUpperCase() + tx.category.slice(1)}
                        </span>
                      </td>
                      <td style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText, padding: '16px', fontWeight: '500' }}>{tx.provider}</td>
                      <td style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText, padding: '16px', fontWeight: 'bold' }}>{formatCurrency(tx.amount)}</td>
                      <td style={{ color: COLORS.lightText, padding: '16px', fontSize: '0.875rem' }}>{tx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default BillPayments;
