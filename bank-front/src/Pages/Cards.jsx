import React, { useState, useEffect } from 'react';
import PageLayout, { COLORS } from '../components/PageLayout';
import { useAppContext } from '../context/AppContext';
import ConfirmModal from '../components/ConfirmModal';
import { formatCurrency } from '../utils/currencyConverter';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/api';

const Cards = () => {
  const [cards, setCards] = useState([]);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [cardType, setCardType] = useState('virtual');
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const { isDarkMode, user, settings } = useAppContext();
  
  // Get currency from settings
  const currency = settings?.currency || 'NGN';

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_ENDPOINTS.CARDS, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });
      setCards(response.data.cards || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  const handleRequestCard = async () => {
    if (cardType) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(API_ENDPOINTS.CARDS_REQUEST, { type: cardType }, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000
        });
        setMessage(`${cardType === 'virtual' ? 'Virtual' : 'Physical'} card request submitted successfully!`);
        setShowRequestModal(false);
        setTimeout(() => setMessage(''), 3000);
        fetchCards();
      } catch (error) {
        setMessage('Error requesting card. Please try again.');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const handleBlockCard = async (cardId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(API_ENDPOINTS.CARDS_BLOCK(cardId), {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });
      setCards(cards.map(card =>
        card._id === cardId ? { ...card, status: 'Blocked' } : card
      ));
      setMessage('Card blocked successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error blocking card. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUnblockCard = async (cardId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(API_ENDPOINTS.CARDS_UNBLOCK(cardId), {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000
      });
      setCards(cards.map(card =>
        card._id === cardId ? { ...card, status: 'Active' } : card
      ));
      setMessage('Card unblocked successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error unblocking card. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteCard = async (cardId) => {
    setCardToDelete(cardId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (cardToDelete) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(API_ENDPOINTS.CARDS_DELETE(cardToDelete), {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000
        });
        setCards(cards.filter(card => card._id !== cardToDelete));
        setCardToDelete(null);
        setMessage('Card deleted successfully');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Error deleting card. Please try again.');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const getUserFullName = () => {
    if (user) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Card User';
    }
    return 'Card User';
  };

  const getCardKey = (card, index) => {
    return card._id || card.id || card.last4 || `card-${index}`;
  };

  const getCardActionId = (card) => {
    return card._id || card.id || '';
  };

  return (
    <PageLayout pageTitle="My Cards" pageSubtitle="Manage your debit and virtual cards">
      {/* Success Message */}
      {message && (
        <div
          style={{
            background: COLORS.success,
            color: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}
        >
          {message}
        </div>
      )}

      {/* Request Card Button */}
      <div className="mb-5">
        <button
          onClick={() => setShowRequestModal(true)}
          className="btn fw-semibold"
          style={{
            background: COLORS.primary,
            color: 'white',
            borderRadius: '12px',
            border: 'none',
            padding: '12px 24px'
          }}
        >
          <i className="fas fa-plus me-2"></i>Request New Card
        </button>
      </div>

      {/* Request Card Modal */}
      {showRequestModal && (
        <div
          style={{
            background: isDarkMode ? '#1F2937' : COLORS.card,
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '32px',
            boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
            border: isDarkMode ? '1px solid #374151' : 'none'
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              Request a Card
            </h5>
            <button
              onClick={() => setShowRequestModal(false)}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>

          <div className="mb-4">
            <label className="small fw-semibold mb-3 d-block" style={{ color: COLORS.lightText }}>
              Select Card Type
            </label>
            <div className="d-flex gap-3">
              <label style={{ cursor: 'pointer', flex: 1 }}>
                <div
                  style={{
                    background: cardType === 'virtual' ? COLORS.primary : (isDarkMode ? '#374151' : COLORS.light),
                    border: cardType === 'virtual' ? `2px solid ${COLORS.primary}` : 'none',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💳</div>
                  <p
                    className="small fw-semibold mb-0"
                    style={{ color: cardType === 'virtual' ? 'white' : (isDarkMode ? '#D1D5DB' : COLORS.darkText) }}
                  >
                    Virtual Card
                  </p>
                </div>
                <input type="radio" name="cardType" value="virtual" checked={cardType === 'virtual'} onChange={(e) => setCardType(e.target.value)} style={{ display: 'none' }} />
              </label>

              <label style={{ cursor: 'pointer', flex: 1 }}>
                <div
                  style={{
                    background: cardType === 'physical' ? COLORS.primary : (isDarkMode ? '#374151' : COLORS.light),
                    border: cardType === 'physical' ? `2px solid ${COLORS.primary}` : 'none',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏦</div>
                  <p
                    className="small fw-semibold mb-0"
                    style={{ color: cardType === 'physical' ? 'white' : (isDarkMode ? '#D1D5DB' : COLORS.darkText) }}
                  >
                    Physical Card
                  </p>
                </div>
                <input type="radio" name="cardType" value="physical" checked={cardType === 'physical'} onChange={(e) => setCardType(e.target.value)} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              onClick={handleRequestCard}
              className="btn flex-grow-1 fw-semibold"
              style={{
                background: COLORS.success,
                color: 'white',
                borderRadius: '12px',
                border: 'none'
              }}
            >
              Request Card
            </button>
            <button
              onClick={() => setShowRequestModal(false)}
              className="btn flex-grow-1 fw-semibold"
              style={{
                background: isDarkMode ? '#374151' : COLORS.light,
                color: isDarkMode ? '#D1D5DB' : COLORS.darkText,
                borderRadius: '12px',
                border: 'none'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div
          style={{
            background: isDarkMode ? '#1F2937' : COLORS.card,
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            border: isDarkMode ? '1px solid #374151' : 'none'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💳</div>
          <p style={{ color: COLORS.lightText }}>You haven't requested any cards yet</p>
          <button
            onClick={() => setShowRequestModal(true)}
            className="btn fw-semibold mt-3"
            style={{
              background: COLORS.primary,
              color: 'white',
              borderRadius: '12px',
              border: 'none',
              padding: '10px 20px'
            }}
          >
            Request Your First Card
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {cards.map((card, index) => {
            const cardKey = getCardKey(card, index);
            const cardActionId = getCardActionId(card);
            return (
            <div key={cardKey} className="col-12 col-md-6 col-lg-6">
              {/* Card Display */}
              <div
                style={{
                  background: card.color,
                  backgroundImage: `linear-gradient(135deg, ${card.color} 0%, rgba(79, 70, 229, 0.8) 100%)`,
                  borderRadius: '20px',
                  padding: 'clamp(20px, 4vw, 32px)',
                  color: 'white',
                  marginBottom: '16px',
                  minHeight: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                }}
              >
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-3 mb-md-4">
                    <div>
                      <p className="small mb-2" style={{ opacity: 0.8, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Card Type</p>
                      <h6 className="fw-bold mb-0" style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)' }}>{card.type} Card</h6>
                    </div>
                    <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>{card.issuer === 'Mastercard' ? '💳' : '🏪'}</div>
                  </div>
                  <p className="mb-2" style={{ opacity: 0.8, fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}>
                    **** **** **** {card.last4}
                  </p>
                </div>

                <div className="d-flex justify-content-between align-items-end flex-wrap gap-2">
                  <div>
                    <p className="small mb-1" style={{ opacity: 0.8, fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)' }}>Card Holder</p>
                    <p className="fw-bold mb-0" style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>{getUserFullName()}</p>
                  </div>
                  <div>
                    <p className="small mb-1" style={{ opacity: 0.8, fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)' }}>Expires</p>
                    <p className="fw-bold mb-0" style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>{card.expiry}</p>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div
                style={{
                  background: isDarkMode ? '#1F2937' : COLORS.card,
                  borderRadius: '16px',
                  padding: '24px',
                  border: isDarkMode ? '1px solid #374151' : 'none',
                  boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <div className="row g-2 mb-4">
                  <div className="col-6">
                    <p className="small mb-1" style={{ color: COLORS.lightText }}>Balance</p>
                    <p className="fw-bold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                      {formatCurrency(card.balance, currency)}
                    </p>
                  </div>
                  <div className="col-6">
                    <p className="small mb-1" style={{ color: COLORS.lightText }}>Status</p>
                    <span
                      style={{
                        background: card.status === 'Active' ? COLORS.success : COLORS.danger,
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {card.status}
                    </span>
                  </div>
                </div>

                <div className="d-flex gap-2 flex-column">
                  <div className="d-flex gap-2">
                    {card.status === 'Active' && (
                      <button
                        onClick={() => handleBlockCard(cardActionId)}
                        className="btn flex-grow-1 btn-sm"
                        style={{
                          background: COLORS.danger,
                          color: 'white',
                          borderRadius: '12px',
                          border: 'none'
                        }}
                      >
                        <i className="fas fa-lock me-1"></i>Block
                      </button>
                    )}
                    {card.status === 'Blocked' && (
                      <button
                        onClick={() => handleUnblockCard(cardActionId)}
                        className="btn flex-grow-1 btn-sm"
                        style={{
                          background: COLORS.success,
                          color: 'white',
                          borderRadius: '12px',
                          border: 'none'
                        }}
                      >
                        <i className="fas fa-unlock me-1"></i>Unblock
                      </button>
                    )}
                    <button
                      className="btn flex-grow-1 btn-sm"
                      style={{
                        background: isDarkMode ? '#374151' : COLORS.light,
                        color: isDarkMode ? '#D1D5DB' : COLORS.darkText,
                        borderRadius: '12px',
                        border: 'none'
                      }}
                    >
                      <i className="fas fa-info-circle me-1"></i>Details
                    </button>
                  </div>
                  <button
                    onClick={() => handleDeleteCard(cardActionId)}
                    className="btn btn-sm w-100"
                    style={{
                      background: isDarkMode ? '#7F1D1D' : '#FEE2E2',
                      color: isDarkMode ? '#FCA5A5' : COLORS.danger,
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '0.875rem'
                    }}
                  >
                    <i className="fas fa-trash me-1"></i>Delete Card
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
      {/* Delete Card Confirmation Modal */}
      <ConfirmModal
        show={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setCardToDelete(null); }}
        onConfirm={confirmDelete}
        title="Delete Card"
        message="Are you sure you want to delete this card? This action cannot be undone."
        confirmText="Delete"
        confirmColor="#EF4444"
        isDarkMode={isDarkMode}
      />    </PageLayout>
  );
};

export default Cards;
