import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const transferValidationSchema = Yup.object({
    recipientAccountNumber: Yup.string()
      .required('Recipient account number is required')
      .matches(/^\d{10}$/, 'Account number must be 10 digits'),
    amount: Yup.number()
      .positive('Amount must be positive')
      .required('Amount is required')
      .min(1, 'Minimum transfer amount is ₦1'),
    description: Yup.string()
      .required('Description is required')
      .max(100, 'Description must be less than 100 characters')
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/signin');
      return;
    }

    setUser(JSON.parse(userData));
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5555/api/banking/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data.user);
      setTransactions(response.data.user.transactions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/signin');
      }
    }
  };

  const handleTransfer = async (values, { resetForm }) => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5959/api/banking/transfer', {
        recipientAccountNumber: values.recipientAccountNumber,
        amount: parseFloat(values.amount),
        description: values.description
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Transfer completed successfully!');
      setUser(prev => ({ ...prev, accountBalance: response.data.newBalance }));
      setShowTransferModal(false);
      resetForm();
      fetchDashboardData(); // Refresh transactions
      
    } catch (error) {
      setMessage(error.response?.data?.message || 'Transfer failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
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

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand">
            <i className="fas fa-university me-2"></i>
            SecureBank
          </span>
          <div className="navbar-nav ms-auto">
            <span className="navbar-text me-3">
              Welcome, {user.firstName} {user.lastName}
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt me-1"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {message && (
          <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
            {message}
            <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
          </div>
        )}

        {/* Account Overview */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="fas fa-wallet me-2"></i>
                  Account Balance
                </h5>
                <h2 className="mb-0">{formatCurrency(user.accountBalance)}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="fas fa-credit-card me-2"></i>
                  Account Number
                </h5>
                <h4 className="mb-0">{user.accountNumber}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-info text-white">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="fas fa-exchange-alt me-2"></i>
                  Total Transactions
                </h5>
                <h2 className="mb-0">{transactions.length}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Quick Actions</h5>
                <div className="d-flex gap-2 flex-wrap">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setShowTransferModal(true)}
                  >
                    <i className="fas fa-paper-plane me-2"></i>
                    Transfer Money
                  </button>
                  <button 
                    className="btn btn-outline-primary" 
                    onClick={fetchDashboardData}
                  >
                    <i className="fas fa-sync-alt me-2"></i>
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-history me-2"></i>
                  Transaction History
                </h5>
              </div>
              <div className="card-body">
                {transactions.length === 0 ? (
                  <p className="text-center text-muted">No transactions yet</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Description</th>
                          <th>Amount</th>
                          <th>Account</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction, index) => (
                          <tr key={index}>
                            <td>{formatDate(transaction.date)}</td>
                            <td>
                              <span className={`badge ${transaction.type === 'credit' ? 'bg-success' : 'bg-danger'}`}>
                                {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                              </span>
                            </td>
                            <td>{transaction.description}</td>
                            <td className={transaction.type === 'credit' ? 'text-success' : 'text-danger'}>
                              {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </td>
                            <td>
                              {transaction.type === 'credit' 
                                ? transaction.senderAccountNumber 
                                : transaction.recipientAccountNumber
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Transfer Money</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowTransferModal(false)}
                ></button>
              </div>
              <Formik
                initialValues={{
                  recipientAccountNumber: '',
                  amount: '',
                  description: ''
                }}
                validationSchema={transferValidationSchema}
                onSubmit={handleTransfer}
              >
                {({ isValid, dirty }) => (
                  <Form>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label htmlFor="recipientAccountNumber" className="form-label">
                          Recipient Account Number
                        </label>
                        <Field
                          type="text"
                          name="recipientAccountNumber"
                          className="form-control"
                          placeholder="Enter 10-digit account number"
                          maxLength="10"
                        />
                        <ErrorMessage name="recipientAccountNumber" component="div" className="text-danger small mt-1" />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="amount" className="form-label">Amount (₦)</label>
                        <Field
                          type="number"
                          name="amount"
                          className="form-control"
                          placeholder="Enter amount"
                          min="1"
                          max={user.accountBalance}
                        />
                        <ErrorMessage name="amount" component="div" className="text-danger small mt-1" />
                        <small className="text-muted">
                          Available balance: {formatCurrency(user.accountBalance)}
                        </small>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="description" className="form-label">Description</label>
                        <Field
                          type="text"
                          name="description"
                          className="form-control"
                          placeholder="Enter transfer description"
                          maxLength="100"
                        />
                        <ErrorMessage name="description" component="div" className="text-danger small mt-1" />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setShowTransferModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!isValid || !dirty || isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Processing...
                          </>
                        ) : (
                          'Transfer'
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;