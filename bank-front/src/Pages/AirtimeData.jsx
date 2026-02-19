import React, { useState, useEffect } from 'react';
import PageLayout, { COLORS } from '../components/PageLayout';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';

const AirtimeData = () => {
  const [type, setType] = useState('airtime');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const { isDarkMode } = useAppContext();

  // Data plans: {id, name, data, price}
  const dataPlans = [
    { id: '100mb', name: '100MB', data: '100MB', price: 100 },
    { id: '200mb', name: '200MB', data: '200MB', price: 200 },
    { id: '500mb', name: '500MB', data: '500MB', price: 500 },
    { id: '1gb', name: '1GB', data: '1GB', price: 1000 },
    { id: '2gb', name: '2GB', data: '2GB', price: 2000 },
    { id: '5gb', name: '5GB', data: '5GB', price: 5000 },
  ];

  // Quick airtime amounts
  const airtimeAmounts = [100, 200, 500, 1000, 2000, 5000];

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `https://full-bank-app.onrender.com/api/opay/${type}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data.history || [
        { type: 'airtime', amount: 500, phone: '08012345678', date: '2025-08-10' },
        { type: 'data', amount: 1000, phone: '08098765432', date: '2025-08-09' }
      ]);
    } catch {
      setHistory([
        { type: 'airtime', amount: 500, phone: '08012345678', date: '2025-08-10' },
        { type: 'data', amount: 1000, phone: '08098765432', date: '2025-08-09' }
      ]);
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Validate inputs
    if (!phone) {
      setMessage('Please enter a phone number');
      setTimeout(() => setMessage(''), 3000);
      setLoading(false);
      return;
    }

    if (type === 'data' && !selectedPlan) {
      setMessage('Please select a data plan');
      setTimeout(() => setMessage(''), 3000);
      setLoading(false);
      return;
    }

    if (type === 'airtime' && !amount) {
      setMessage('Please enter an amount');
      setTimeout(() => setMessage(''), 3000);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = type === 'airtime'
        ? 'https://full-bank-app.onrender.com/api/opay/airtime'
        : 'https://full-bank-app.onrender.com/api/opay/data';
      
      const payload = type === 'airtime'
        ? { phone, amount }
        : { phone, planId: selectedPlan, amount: dataPlans.find(p => p.id === selectedPlan)?.price };

      await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const purchaseAmount = type === 'data' 
        ? dataPlans.find(p => p.id === selectedPlan)?.price 
        : parseInt(amount);
      const purchaseDesc = type === 'data'
        ? dataPlans.find(p => p.id === selectedPlan)?.name
        : `${amount} Airtime`;

      setMessage(`${type === 'airtime' ? 'Airtime' : 'Data'} purchased successfully!`);
      
      // Update history
      if (type === 'data') {
        setHistory([{ 
          type: 'data', 
          plan: dataPlans.find(p => p.id === selectedPlan)?.name,
          amount: purchaseAmount, 
          phone, 
          date: new Date().toISOString().slice(0, 10) 
        }, ...history]);
      } else {
        setHistory([{ 
          type: 'airtime', 
          amount: parseInt(amount), 
          phone, 
          date: new Date().toISOString().slice(0, 10) 
        }, ...history]);
      }

      setPhone('');
      setAmount('');
      setSelectedPlan('');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Purchase failed');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return '₦' + (typeof amount === 'number' ? amount.toLocaleString('en-NG') : '0');
  };

  return (
    <PageLayout pageTitle="Airtime & Data" pageSubtitle="Buy airtime and data for your mobile phone">
      {/* Success/Error Message */}
      {message && (
        <div
          style={{
            background: message.includes('successfully') ? COLORS.success : COLORS.danger,
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
        {/* Purchase Form */}
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
              Buy {type === 'airtime' ? 'Airtime' : 'Data'}
            </h5>

            <form onSubmit={handlePurchase}>
              <div className="mb-4">
                <label className="small fw-semibold mb-3 d-block" style={{ color: COLORS.lightText }}>
                  Type
                </label>
                <div className="d-flex gap-2">
                  {['airtime', 'data'].map((t) => (
                    <label key={t} style={{ cursor: 'pointer', flex: 1 }}>
                      <div
                        style={{
                          background: type === t ? COLORS.primary : (isDarkMode ? '#374151' : COLORS.light),
                          border: type === t ? `2px solid ${COLORS.primary}` : 'none',
                          borderRadius: '12px',
                          padding: '12px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <p
                          className="small fw-semibold mb-0"
                          style={{ color: type === t ? 'white' : (isDarkMode ? '#D1D5DB' : COLORS.darkText) }}
                        >
                          {t === 'airtime' ? '📱 Airtime' : '📡 Data'}
                        </p>
                      </div>
                      <input type="radio" name="type" value={t} checked={type === t} onChange={(e) => setType(e.target.value)} style={{ display: 'none' }} />
                    </label>
                  ))}
                </div>
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
                  placeholder="Enter phone number"
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
                  {type === 'airtime' ? 'Amount' : 'Data Plan'}
                </label>
                
                {type === 'airtime' ? (
                  // Airtime: Show amount input and quick amounts
                  <>
                    <input
                      type="number"
                      className="form-control mb-3"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="50"
                      required
                      style={{
                        background: isDarkMode ? '#374151' : COLORS.light,
                        border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                        borderRadius: '12px',
                        color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                        padding: '12px 16px'
                      }}
                    />
                    {/* Quick amount buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {airtimeAmounts.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmount(amt.toString())}
                          style={{
                            background: amount === amt.toString() ? COLORS.primary : (isDarkMode ? '#374151' : COLORS.light),
                            color: amount === amt.toString() ? 'white' : (isDarkMode ? '#D1D5DB' : COLORS.darkText),
                            border: 'none',
                            borderRadius: '12px',
                            padding: '10px 8px',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.8';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                        >
                          ₦{amt.toLocaleString('en-NG')}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  // Data: Show data plan selection
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {dataPlans.map((plan) => (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        style={{
                          background: selectedPlan === plan.id ? COLORS.primary : (isDarkMode ? '#374151' : COLORS.light),
                          border: selectedPlan === plan.id ? `2px solid ${COLORS.primary}` : (isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB'),
                          borderRadius: '12px',
                          padding: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedPlan !== plan.id) {
                            e.currentTarget.style.borderColor = COLORS.primary;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedPlan !== plan.id) {
                            e.currentTarget.style.borderColor = isDarkMode ? '#4B5563' : '#E5E7EB';
                          }
                        }}
                      >
                        <div className="fw-bold mb-1" style={{ 
                          color: selectedPlan === plan.id ? 'white' : (isDarkMode ? '#F3F4F6' : COLORS.darkText),
                          fontSize: '1rem'
                        }}>
                          {plan.name}
                        </div>
                        <div style={{ 
                          color: selectedPlan === plan.id ? 'white' : COLORS.lightText,
                          fontSize: '0.85rem',
                          marginBottom: '8px'
                        }}>
                          {plan.data}
                        </div>
                        <div className="fw-semibold" style={{ 
                          color: selectedPlan === plan.id ? 'white' : COLORS.primary,
                          fontSize: '0.95rem'
                        }}>
                          ₦{plan.price.toLocaleString('en-NG')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    Confirm
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-lg-6">
          {type === 'airtime' && (
            <>
              <h5 className="fw-bold mb-3" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                Quick Amounts
              </h5>
              <div className="row g-3 mb-4">
                {[100, 500, 1000, 2000].map((quickAmount) => (
                  <div key={quickAmount} className="col-6">
                    <button
                      onClick={() => setAmount(quickAmount.toString())}
                      style={{
                        background: isDarkMode ? '#1F2937' : COLORS.card,
                        border: isDarkMode ? '1px solid #374151' : 'none',
                        borderRadius: '12px',
                        padding: '20px',
                        width: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = isDarkMode ? 'none' : '0 8px 16px rgba(0,0,0,0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)';
                      }}
                    >
                      <p className="fw-bold mb-0" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                        {formatCurrency(quickAmount)}
                      </p>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {type === 'airtime' && (
            <div
              style={{
                background: isDarkMode ? '#1F2937' : COLORS.light,
                borderRadius: '16px',
                padding: '20px',
                border: isDarkMode ? '1px solid #374151' : 'none'
              }}
            >
              <h6 className="fw-bold mb-2" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                💡 Tip
              </h6>
              <p className="small mb-0" style={{ color: COLORS.lightText }}>
                Airtime and data are credited instantly. All purchases are secure and encrypted.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Purchase History */}
      {history.length > 0 && (
        <div>
          <h5 className="fw-bold mb-3" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
            Recent Purchases
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
                    <th style={{ color: COLORS.lightText, fontSize: '0.875rem', fontWeight: 'semibold', padding: '16px' }}>Type</th>
                    <th style={{ color: COLORS.lightText, fontSize: '0.875rem', fontWeight: 'semibold', padding: '16px' }}>Phone</th>
                    <th style={{ color: COLORS.lightText, fontSize: '0.875rem', fontWeight: 'semibold', padding: '16px' }}>Plan / Amount</th>
                    <th style={{ color: COLORS.lightText, fontSize: '0.875rem', fontWeight: 'semibold', padding: '16px' }}>Price</th>
                    <th style={{ color: COLORS.lightText, fontSize: '0.875rem', fontWeight: 'semibold', padding: '16px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((tx, idx) => (
                    <tr key={idx} style={{ borderBottom: idx < history.length - 1 ? (isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB') : 'none' }}>
                      <td style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText, padding: '16px' }}>
                        <span style={{ background: tx.type === 'airtime' ? COLORS.primary : COLORS.warning, color: 'white', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {tx.type === 'airtime' ? '📱 Airtime' : '📡 Data'}
                        </span>
                      </td>
                      <td style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText, padding: '16px', fontWeight: '500' }}>{tx.phone}</td>
                      <td style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText, padding: '16px', fontWeight: '500' }}>
                        {tx.type === 'data' ? tx.plan : 'Airtime'}
                      </td>
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

export default AirtimeData;
