import React, { useState } from 'react';
import PageLayout, { COLORS } from '../components/PageLayout';
import { useAppContext } from '../context/AppContext';

const Support = () => {
  const [tickets, setTickets] = useState([
    { id: 'TKT001', subject: 'Card Not Working', status: 'Resolved', date: '2024-01-15', priority: 'High' },
    { id: 'TKT002', subject: 'Withdrawal Failed', status: 'In Progress', date: '2024-01-20', priority: 'Critical' },
    { id: 'TKT003', subject: 'Password Reset', status: 'Resolved', date: '2024-01-10', priority: 'Low' }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'General', message: '', priority: 'Normal' });
  const { isDarkMode } = useAppContext();

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (newTicket.subject && newTicket.message) {
      setTickets([{
        id: `TKT${String(tickets.length + 1).padStart(3, '0')}`,
        subject: newTicket.subject,
        status: 'Open',
        date: new Date().toISOString().split('T')[0],
        priority: newTicket.priority
      }, ...tickets]);
      setNewTicket({ subject: '', category: 'General', message: '', priority: 'Normal' });
      setShowForm(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return COLORS.success;
      case 'In Progress': return '#F59E0B';
      case 'Open': return COLORS.primary;
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return COLORS.danger;
      case 'High': return '#F97316';
      case 'Normal': return COLORS.primary;
      default: return '#6B7280';
    }
  };

  return (
    <PageLayout pageTitle="Support Center" pageSubtitle="Get help and track your support tickets">
      {/* Quick Help Section */}
      <div className="row g-4 mb-5">
        <div className="col-md-6 col-lg-3">
          <button
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: isDarkMode ? '1px solid #374151' : 'none',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = isDarkMode ? 'none' : '0 8px 16px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)';
            }}
            aria-label="View FAQ"
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }} aria-hidden="true">📚</div>
            <h6 className="fw-semibold" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              FAQ
            </h6>
            <p className="small mb-0" style={{ color: COLORS.lightText }}>
              Find answers to common questions
            </p>
          </button>
        </div>

        <div className="col-md-6 col-lg-3">
          <button
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: isDarkMode ? '1px solid #374151' : 'none',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = isDarkMode ? 'none' : '0 8px 16px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)';
            }}
            aria-label="Start live chat with support team"
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }} aria-hidden="true">💬</div>
            <h6 className="fw-semibold" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              Live Chat
            </h6>
            <p className="small mb-0" style={{ color: COLORS.lightText }}>
              Chat with our support team
            </p>
          </button>
        </div>

        <div className="col-md-6 col-lg-3">
          <a
            href="mailto:support@bank.com"
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: isDarkMode ? '1px solid #374151' : 'none',
              display: 'block',
              textDecoration: 'none'
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
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }} aria-hidden="true">📧</div>
            <h6 className="fw-semibold" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              Email Support
            </h6>
            <p className="small mb-0" style={{ color: COLORS.lightText }}>
              support@bank.com
            </p>
          </a>
        </div>

        <div className="col-md-6 col-lg-3">
          <a
            href="tel:+2341234567890"
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: isDarkMode ? '1px solid #374151' : 'none',
              display: 'block',
              textDecoration: 'none'
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
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }} aria-hidden="true">📞</div>
            <h6 className="fw-semibold" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              Call Us
            </h6>
            <p className="small mb-0" style={{ color: COLORS.lightText }}>
              +234 123 456 7890
            </p>
          </a>
        </div>
      </div>

      {/* New Ticket Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn fw-semibold"
          style={{
            background: COLORS.primary,
            color: 'white',
            borderRadius: '12px',
            border: 'none',
            padding: '12px 24px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#3730A3';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = COLORS.primary;
          }}
          aria-expanded={showForm}
          aria-controls="support-form"
        >
          <i className="fas fa-plus me-2"></i>{showForm ? 'Cancel' : 'Create New Ticket'}
        </button>
      </div>

      {/* New Ticket Form */}
      {showForm && (
        <div
          id="support-form"
          style={{
            background: isDarkMode ? '#1F2937' : COLORS.card,
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '32px',
            boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
            border: isDarkMode ? '1px solid #374151' : 'none'
          }}
          role="region"
          aria-label="Create a new support ticket"
        >
          <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
            Create a Support Ticket
          </h5>

          <form onSubmit={handleSubmitTicket}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="ticket-subject" className="small fw-semibold mb-2 d-block" style={{ color: COLORS.lightText }}>Subject *</label>
                <input
                  id="ticket-subject"
                  type="text"
                  className="form-control"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  required
                  aria-required="true"
                  style={{
                    background: isDarkMode ? '#374151' : COLORS.light,
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    color: isDarkMode ? '#F3F4F6' : COLORS.darkText
                  }}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="ticket-category" className="small fw-semibold mb-2 d-block" style={{ color: COLORS.lightText }}>Category</label>
                <select
                  id="ticket-category"
                  className="form-control"
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  style={{
                    background: isDarkMode ? '#374151' : COLORS.light,
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    color: isDarkMode ? '#F3F4F6' : COLORS.darkText
                  }}
                >
                  <option>General</option>
                  <option>Payment Issue</option>
                  <option>Card</option>
                  <option>Transfer</option>
                  <option>Technical</option>
                  <option>Security</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="small fw-semibold mb-2" style={{ color: COLORS.lightText }}>Priority</label>
              <div className="d-flex gap-2">
                {['Normal', 'High', 'Critical'].map((p) => (
                  <label key={p} style={{ cursor: 'pointer' }} className="mb-0">
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      checked={newTicket.priority === p}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                      className="me-2"
                    />
                    <span style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="small fw-semibold mb-2" style={{ color: COLORS.lightText }}>Message</label>
              <textarea
                className="form-control"
                value={newTicket.message}
                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                placeholder="Describe your issue in detail"
                rows="5"
                required
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                  borderRadius: '12px',
                  color: isDarkMode ? '#F3F4F6' : COLORS.darkText
                }}
              />
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn flex-grow-1 fw-semibold"
                style={{
                  background: COLORS.success,
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none'
                }}
              >
                Submit Ticket
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
          </form>
        </div>
      )}

      {/* Support Tickets */}
      <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
        Your Support Tickets
      </h5>

      {tickets.length === 0 ? (
        <div
          style={{
            background: isDarkMode ? '#1F2937' : COLORS.card,
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            border: isDarkMode ? '1px solid #374151' : 'none'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎫</div>
          <p style={{ color: COLORS.lightText }}>No support tickets yet</p>
          <p className="small" style={{ color: COLORS.lightText }}>
            Create a ticket to get help with any issues
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="col-lg-6">
              <div
                style={{
                  background: isDarkMode ? '#1F2937' : COLORS.card,
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                  border: isDarkMode ? '1px solid #374151' : 'none'
                }}
              >
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6 className="fw-bold mb-2" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                      {ticket.subject}
                    </h6>
                    <p className="small mb-0" style={{ color: COLORS.lightText }}>
                      Ticket ID: {ticket.id}
                    </p>
                  </div>
                  <span
                    className="small fw-semibold"
                    style={{
                      background: getStatusColor(ticket.status),
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {ticket.status}
                  </span>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <p className="small mb-1" style={{ color: COLORS.lightText }}>Created</p>
                    <p className="small fw-semibold mb-0" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                      {ticket.date}
                    </p>
                  </div>
                  <div className="col-6">
                    <p className="small mb-1" style={{ color: COLORS.lightText }}>Priority</p>
                    <p className="small fw-semibold mb-0">
                      <span
                        style={{
                          background: getPriorityColor(ticket.priority),
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        {ticket.priority}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  className="btn w-100 btn-sm"
                  style={{
                    background: isDarkMode ? '#374151' : COLORS.light,
                    color: isDarkMode ? '#D1D5DB' : COLORS.darkText,
                    borderRadius: '12px',
                    border: 'none'
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default Support;
