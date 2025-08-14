import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BottomNav from '../components/BottomNav';

const Cards = () => {
  // Handle card request (virtual/physical)
  const handleRequestCard = async () => {
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      // This should call your backend endpoint for requesting a card
  await axios.post('https://full-bank-app.onrender.com/api/opay/cards/request', { type: cardType }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(`Requested a ${cardType} card successfully!`);
      setShowRequest(false);
      // Optionally refresh cards list
    } catch {
      setMessage('Failed to request card (backend route missing or not implemented)');
    }
  };
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Card request modal state
  const [showRequest, setShowRequest] = useState(false);
  const [cardType, setCardType] = useState('virtual');

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fallback for missing backend route
  const res = await axios.get('https://full-bank-app.onrender.com/api/opay/cards', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCards(res.data.cards || []);
      } catch (err) {
        setMessage('Failed to fetch cards (backend route missing or not implemented)');
        setCards([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  const handleBlock = async (type, status) => {
    setMessage('');
    try {
      const token = localStorage.getItem('token');
  await axios.post('https://full-bank-app.onrender.com/api/opay/cards/block', { type, status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCards(cards.map(card => card.type === type ? { ...card, status } : card));
      setMessage(`Card ${status === 'blocked' ? 'blocked' : 'unblocked'} successfully`);
    } catch {
      setMessage('Failed to update card status');
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <div className="container py-4">
        <h3 className="mb-4 text-success">My Cards</h3>
        {message && <div className="alert alert-info">{message}</div>}
        {/* Card Request UI */}
        <div className="mb-4">
          <button className="btn btn-primary" onClick={() => setShowRequest(true)}>Request New Card</button>
          {showRequest && (
            <div className="card p-3 mt-2">
              <label>Choose Card Type:</label>
              <select className="form-select my-2" value={cardType} onChange={e => setCardType(e.target.value)}>
                <option value="virtual">Virtual Card</option>
                <option value="physical">Physical Card</option>
              </select>
              <button className="btn btn-success w-100" onClick={handleRequestCard}>Submit Request</button>
              <button className="btn btn-link w-100 mt-2" onClick={() => setShowRequest(false)}>Cancel</button>
            </div>
          )}
        </div>
        {loading ? (
          <div className="text-center py-5">
            <span className="spinner-border text-success" />
          </div>
        ) : (
          cards.length === 0 ? (
            <div className="text-center py-5 text-muted">No cards found</div>
          ) : (
            cards.map(card => (
              <div className="card shadow-sm mb-3" style={{ borderRadius: '1.5rem' }} key={card.type}>
                <div className="card-body text-center">
                  <h5>{card.type === 'virtual' ? 'Virtual Card' : 'Physical Card'}</h5>
                  <p>**** **** **** {card.last4}</p>
                  <span className={`badge ${card.status === 'active' ? 'bg-success' : 'bg-danger'} mb-2`}>
                    {card.status === 'active' ? 'Active' : 'Blocked'}
                  </span>
                  <div className="d-flex justify-content-center gap-2">
                    <button className="btn btn-outline-success" disabled={card.status === 'active'} onClick={() => handleBlock(card.type, 'active')}>Unblock</button>
                    <button className="btn btn-outline-danger" disabled={card.status === 'blocked'} onClick={() => handleBlock(card.type, 'blocked')}>Block</button>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>
      <BottomNav active="cards" />
    </div>
  );
};

export default Cards;
