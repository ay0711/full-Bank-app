import React from 'react';
import BottomNav from '../components/BottomNav';

const Finances = () => {
  return (
    <div className="min-vh-100 bg-light">
      <div className="container py-4">
        <h3 className="mb-4 text-success">Finances</h3>
        <div className="card shadow-sm mb-3" style={{ borderRadius: '1.5rem' }}>
          <div className="card-body">
            <h5>Savings</h5>
            <p>Balance: ₦50,000</p>
            <button className="btn btn-outline-success">View Savings</button>
          </div>
        </div>
        <div className="card shadow-sm mb-3" style={{ borderRadius: '1.5rem' }}>
          <div className="card-body">
            <h5>Loans</h5>
            <p>Active Loan: ₦10,000</p>
            <button className="btn btn-outline-success">View Loans</button>
          </div>
        </div>
      </div>
      <BottomNav active="finances" />
    </div>
  );
};

export default Finances;
