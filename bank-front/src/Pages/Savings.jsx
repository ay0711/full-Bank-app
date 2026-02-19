import React, { useState, useEffect } from 'react';
import PageLayout, { COLORS } from '../components/PageLayout';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';

const Savings = () => {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', goal: '', dueDate: '' });
  const { isDarkMode } = useAppContext();

  useEffect(() => {
    fetchSavings();
  }, []);

  const fetchSavings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://full-bank-app.onrender.com/api/banking/savings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavings(response.data.savings || []);
    } catch (error) {
      console.error('Error fetching savings:', error);
      // Keep empty array if no data
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return '₦' + amount.toLocaleString('en-NG');
  };

  const handleCreateGoal = async () => {
    if (newGoal.name && newGoal.goal) {
      try {
        const token = localStorage.getItem('token');
        await axios.post('https://full-bank-app.onrender.com/api/banking/savings', 
          {
            name: newGoal.name,
            goal: parseInt(newGoal.goal),
            dueDate: newGoal.dueDate,
            category: 'Personal'
          }, 
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setNewGoal({ name: '', goal: '', dueDate: '' });
        setShowModal(false);
        fetchSavings(); // Refresh list
      } catch (error) {
        console.error('Error creating savings goal:', error);
      }
    }
  };

  const getProgressPercentage = (current, goal) => {
    return Math.round((current / goal) * 100);
  };

  return (
    <PageLayout pageTitle="Savings & Goals" pageSubtitle="Create and track your savings goals">
      {/* Create Goal Button */}
      <div className="mb-5">
        <button
          onClick={() => setShowModal(true)}
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
        >
          <i className="fas fa-plus me-2"></i>Create New Goal
        </button>
      </div>

      {/* Create Goal Modal */}
      {showModal && (
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
              Create Savings Goal
            </h5>
            <button
              onClick={() => setShowModal(false)}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="small fw-semibold mb-2" style={{ color: COLORS.lightText }}>Goal Name</label>
              <input
                type="text"
                className="form-control"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                placeholder="E.g., House Down Payment"
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                  borderRadius: '12px',
                  color: isDarkMode ? '#F3F4F6' : COLORS.darkText
                }}
              />
            </div>

            <div className="col-md-6">
              <label className="small fw-semibold mb-2" style={{ color: COLORS.lightText }}>Target Amount</label>
              <input
                type="number"
                className="form-control"
                value={newGoal.goal}
                onChange={(e) => setNewGoal({ ...newGoal, goal: e.target.value })}
                placeholder="0.00"
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                  borderRadius: '12px',
                  color: isDarkMode ? '#F3F4F6' : COLORS.darkText
                }}
              />
            </div>

            <div className="col-md-6">
              <label className="small fw-semibold mb-2" style={{ color: COLORS.lightText }}>Target Date</label>
              <input
                type="date"
                className="form-control"
                value={newGoal.dueDate}
                onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                  borderRadius: '12px',
                  color: isDarkMode ? '#F3F4F6' : COLORS.darkText
                }}
              />
            </div>

            <div className="col-md-6 d-flex gap-2 align-items-flex-end">
              <button
                onClick={handleCreateGoal}
                className="btn w-100 fw-semibold"
                style={{
                  background: COLORS.success,
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none'
                }}
              >
                Create Goal
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="btn w-100 fw-semibold"
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
        </div>
      )}

      {/* Savings Goals List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: COLORS.primary }} />
          <p className="mt-3" style={{ color: COLORS.lightText }}>Loading savings goals...</p>
        </div>
      ) : (
        <div className="row g-4">
          {savings.length === 0 ? (
            <div className="col-12 text-center py-5">
              <i className="fas fa-piggy-bank fa-3x mb-3" style={{ color: COLORS.lightText }}></i>
              <h5 style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>No savings goals yet</h5>
              <p className="small" style={{ color: COLORS.lightText }}>Create your first savings goal to get started</p>
            </div>
          ) : (
            savings.map((goal) => {
              const percentage = getProgressPercentage(goal.current || 0, goal.goal);
              return (
                <div key={goal.id || goal._id} className="col-lg-6">
                  <div
                    style={{
                      background: isDarkMode ? '#1F2937' : COLORS.card,
                      borderRadius: '16px',
                      padding: '28px',
                      boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                      border: isDarkMode ? '1px solid #374151' : 'none',
                      transition: 'all 0.3s ease'
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
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="fw-bold mb-1" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                          {goal.name}
                        </h5>
                        <span className="small" style={{ background: COLORS.primary, color: 'white', padding: '4px 12px', borderRadius: '999px' }}>
                          {goal.category}
                        </span>
                      </div>
                  <div style={{ fontSize: '2rem' }}>🎯</div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div
                    style={{
                      width: '100%',
                      height: '12px',
                      borderRadius: '999px',
                      background: isDarkMode ? '#374151' : COLORS.light,
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: COLORS.success,
                        transition: 'width 0.3s ease'
                      }}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between mt-2 small">
                    <span style={{ color: COLORS.lightText }}>Progress</span>
                    <span style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText, fontWeight: 'bold' }}>
                      {percentage}%
                    </span>
                  </div>
                </div>

                {/* Amount Info */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="small" style={{ color: COLORS.lightText }}>Saved</div>
                    <div className="fw-semibold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                      {formatCurrency(goal.current)}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="small" style={{ color: COLORS.lightText }}>Target</div>
                    <div className="fw-semibold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                      {formatCurrency(goal.goal)}
                    </div>
                  </div>
                </div>

                {/* Due Date */}
                <div className="small" style={{ color: COLORS.lightText }}>
                  <i className="fas fa-calendar me-2"></i>Due: {goal.dueDate}
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2 mt-4">
                  <button
                    className="btn flex-grow-1"
                    style={{
                      background: COLORS.primary,
                      color: 'white',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '0.875rem'
                    }}
                  >
                    Add Funds
                  </button>
                  <button
                    className="btn flex-grow-1"
                    style={{
                      background: isDarkMode ? '#374151' : COLORS.light,
                      color: isDarkMode ? '#D1D5DB' : COLORS.darkText,
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '0.875rem'
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
            );
          })
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default Savings;
