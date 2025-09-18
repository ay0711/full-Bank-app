import { useState, useEffect } from 'react';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Signup from './Pages/Signup';
import Signin from './Pages/Signin';
import Dashboard from './Pages/DashboardNew';
import Transfer from './Pages/Transfer';
import Transactions from './Pages/Transactions';
import Profile from './Pages/Profile';
import FundAccount from './Pages/FundAccount';
import Withdraw from './Pages/Withdraw';
import BillPayments from './Pages/BillPayments';
import Savings from './Pages/Savings';
import Loans from './Pages/Loans';
import Me from './Pages/Me';
import Finances from './Pages/Finances';
import Cards from './Pages/Cards';
import AirtimeData from './Pages/AirtimeData';
import Notification from './Pages/Notification';
import Support from './Pages/Support';
import AnimatedSplash from './components/AnimatedSplash';
import SloganSplash from './components/SloganSplash';
import './App.css';

function AppWrapper() {
  return (
    <AppProvider>
      <Router>
        <App />
      </Router>
    </AppProvider>
  );
}

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log(`SW registered: ${reg}`);
          console.log(reg);
        })
        .catch(regError => {
          console.log(`SW registration failed: ${regError}`);
          console.log(regError);
        })
    }
  }, [])
  const location = useLocation();
  const [showSplash, setShowSplash] = React.useState(false);
  const [splashKey, setSplashKey] = React.useState(0);
  React.useEffect(() => {
    setShowSplash(true);
    setSplashKey(prev => prev + 1);
    const timer = setTimeout(() => setShowSplash(false), 1200);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="App">
      <AnimatedSplash show={showSplash} key={splashKey} />
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transfer" element={<Transfer />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/fund-account" element={<FundAccount />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/bill-payments" element={<BillPayments />} />
        <Route path="/savings" element={<Savings />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/me" element={<Me />} />
        <Route path="/finances" element={<Finances />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/airtime-data" element={<AirtimeData />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/support" element={<Support />} />
      </Routes>
    </div>
  );
}
export default AppWrapper;


// Removed duplicate default export
