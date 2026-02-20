// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://full-bank-app.onrender.com';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_URL}/api/auth/login`,
  REGISTER: `${API_URL}/api/auth/register`,
  FORGOT_PASSWORD: `${API_URL}/api/auth/forgot-password`,
  USER: (accountNumber) => `${API_URL}/api/auth/user/${accountNumber}`,
  PROFILE_IMAGE: `${API_URL}/api/auth/profile-image`,
  PROFILE: `${API_URL}/api/auth/profile`,
  VERIFY_PHONE: `${API_URL}/api/auth/verify-phone`,
  CONFIRM_PHONE_VERIFICATION: `${API_URL}/api/auth/confirm-phone-verification`,
  NOTIFICATIONS: `${API_URL}/api/auth/notification`,
  HEALTH: `${API_URL}/api/auth/health`,
  UPGRADE_ACCOUNT: `${API_URL}/api/auth/upgrade-account`,
  
  // Banking endpoints
  DASHBOARD: `${API_URL}/api/banking/dashboard`,
  TRANSFER: `${API_URL}/api/banking/transfer`,
  TRANSACTIONS: `${API_URL}/api/banking/transactions`,
  RECIPIENTS: `${API_URL}/api/banking/recipients`,
  FUND: `${API_URL}/api/banking/fund`,
  WITHDRAW: `${API_URL}/api/banking/withdraw`,
  LOANS: `${API_URL}/api/banking/loans`,
  LOAN_APPLY: `${API_URL}/api/banking/loans/apply`,
  LOAN_REPAY: (applicationId) => `${API_URL}/api/banking/loans/${applicationId}/repay`,
  LOAN_APPROVE: (applicationId) => `${API_URL}/api/banking/loans/${applicationId}/approve`,
  CARDS: `${API_URL}/api/banking/cards`,
  CARDS_REQUEST: `${API_URL}/api/banking/cards/request`,
  CARDS_BLOCK: (cardId) => `${API_URL}/api/banking/cards/${cardId}/block`,
  CARDS_UNBLOCK: (cardId) => `${API_URL}/api/banking/cards/${cardId}/unblock`,
  CARDS_DELETE: (cardId) => `${API_URL}/api/banking/cards/${cardId}`,
  
  // Bills endpoints
  AIRTIME: `${API_URL}/api/bills/airtime`,
  DATA: `${API_URL}/api/bills/data`,
  
  // OPay endpoints
  OPAY_DEPOSIT: `${API_URL}/api/opay/deposit`,
};

export default API_URL;
