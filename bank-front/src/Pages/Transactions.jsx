import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, credit, debit
  const { isDarkMode } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
  const response = await axios.get('https://full-bank-app.onrender.com/api/banking/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const getTransactionIcon = (type) => {
    return type === 'credit' ? 'fas fa-arrow-down text-success' : 'fas fa-arrow-up text-danger';
  };

  if (isLoading) {
    return (
      <div className={`min-vh-100 d-flex justify-content-center align-items-center ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-vh-100 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-dark border-secondary' : 'bg-white border-light'} border-bottom sticky-top`}>
        <div className="container py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <button 
                className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'} me-3`}
                onClick={() => navigate('/dashboard')}
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <h4 className={`mb-0 ${isDarkMode ? 'text-light' : 'text-dark'}`}>Transaction History</h4>
            </div>
            <button 
              className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-primary'} btn-sm`}
              onClick={fetchTransactions}
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {/* Filter Buttons */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className={`btn ${filter === 'all' ? 'btn-primary' : (isDarkMode ? 'btn-outline-light' : 'btn-outline-primary')}`}
                onClick={() => setFilter('all')}
              >
                All Transactions
              </button>
              <button
                type="button"
                className={`btn ${filter === 'credit' ? 'btn-success' : (isDarkMode ? 'btn-outline-light' : 'btn-outline-success')}`}
                onClick={() => setFilter('credit')}
              >
                Money In
              </button>
              <button
                type="button"
                className={`btn ${filter === 'debit' ? 'btn-danger' : (isDarkMode ? 'btn-outline-light' : 'btn-outline-danger')}`}
                onClick={() => setFilter('debit')}
              >
                Money Out
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-5">
            <i className={`fas fa-receipt fa-3x mb-3 ${isDarkMode ? 'text-light' : 'text-muted'}`}></i>
            <h5 className={`${isDarkMode ? 'text-light' : 'text-muted'}`}>No transactions found</h5>
            <p className={`${isDarkMode ? 'text-light' : 'text-muted'}`}>
              {filter === 'all' ? 'You haven\'t made any transactions yet' : `No ${filter} transactions found`}
            </p>
          </div>
        ) : (
          <div className="row">
            {filteredTransactions.map((transaction, index) => (
              <div key={index} className="col-12 mb-3">
                <div className={`card ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white'} h-100`}>
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center ${isDarkMode ? 'bg-secondary' : 'bg-light'}`} style={{width: '48px', height: '48px'}}>
                          <i className={getTransactionIcon(transaction.type)}></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{transaction.description}</h6>
                        <small className={`${isDarkMode ? 'text-light' : 'text-muted'}`}>
                          {formatDate(transaction.date)}
                        </small>
                        {transaction.type === 'credit' && transaction.senderAccountNumber && (
                          <div>
                            <small className={`${isDarkMode ? 'text-light' : 'text-muted'}`}>
                              From: {transaction.senderAccountNumber}
                            </small>
                          </div>
                        )}
                        {transaction.type === 'debit' && transaction.recipientAccountNumber && (
                          <div>
                            <small className={`${isDarkMode ? 'text-light' : 'text-muted'}`}>
                              To: {transaction.recipientAccountNumber}
                            </small>
                          </div>
                        )}
                      </div>
                      <div className="text-end">
                        <div className={`fw-bold ${transaction.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                          {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                        <small className={`badge ${transaction.type === 'credit' ? 'bg-success' : 'bg-danger'}`}>
                          {transaction.type === 'credit' ? 'Received' : 'Sent'}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
