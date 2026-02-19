// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://full-bank-app.onrender.com';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_URL}/api/auth/login`,
  REGISTER: `${API_URL}/api/auth/register`,
  FORGOT_PASSWORD: `${API_URL}/api/auth/forgot-password`,
  USER: (accountNumber) => `${API_URL}/api/auth/user/${accountNumber}`,
  PROFILE_IMAGE: `${API_URL}/api/auth/profile-image`,
  HEALTH: `${API_URL}/api/auth/health`,
  
  // Banking endpoints
  DASHBOARD: `${API_URL}/api/banking/dashboard`,
  TRANSFER: `${API_URL}/api/banking/transfer`,
  TRANSACTIONS: `${API_URL}/api/banking/transactions`,
  RECIPIENTS: `${API_URL}/api/banking/recipients`,
  FUND: `${API_URL}/api/banking/fund`,
  WITHDRAW: `${API_URL}/api/banking/withdraw`,
  
  // Bills endpoints
  AIRTIME: `${API_URL}/api/bills/airtime`,
  DATA: `${API_URL}/api/bills/data`,
  
  // OPay endpoints
  OPAY_DEPOSIT: `${API_URL}/api/opay/deposit`,
};

export default API_URL;
