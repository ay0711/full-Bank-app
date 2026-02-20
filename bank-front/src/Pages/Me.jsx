import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout, { COLORS } from '../components/PageLayout';
import { useAppContext } from '../context/AppContext';
import ConfirmModal from '../components/ConfirmModal';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/api';

const Me = () => {
  const navigate = useNavigate();
  const { user, setUser, isDarkMode, logout, settings, updateSettings } = useAppContext();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [uploading, setUploading] = useState(false);
  const [phoneOTP, setPhoneOTP] = useState('');
  const [phoneVerificationLoading, setPhoneVerificationLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [pendingUpgrade, setPendingUpgrade] = useState(null);
  
  // Settings state from context
  const [language, setLanguage] = useState(settings.language);
  const [currency, setCurrency] = useState(settings.currency);
  const [displayDensity, setDisplayDensity] = useState(settings.displayDensity);
  const [themePreference, setThemePreference] = useState(settings.themePreference);
  const [sessionTimeout, setSessionTimeout] = useState(settings.sessionTimeout);
  const [hideBalance, setHideBalance] = useState(false);
  const [hideAccountNumber, setHideAccountNumber] = useState(false);
  const [showLoginActivity, setShowLoginActivity] = useState(false);
  
  // Sync settings changes to context
  useEffect(() => {
    const newSettings = {
      ...settings,
      language,
      currency,
      displayDensity,
      themePreference,
      sessionTimeout
    };
    if (JSON.stringify(newSettings) !== JSON.stringify(settings)) {
      updateSettings(newSettings);
    }
  }, [language, currency, displayDensity, themePreference, sessionTimeout]);

  useEffect(() => {
    setProfileImage(user?.profileImage || '');
  }, [user?.profileImage]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!profileData.firstName || !profileData.lastName) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        API_ENDPOINTS.PROFILE,
        {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phoneNumber: profileData.phoneNumber
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.user) {
        setUser(response.data.user);
        setMessage('Profile updated successfully!');
        setMessageType('success');
        setShowEditProfile(false);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error updating profile. Please try again.');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleVerifyPhone = async () => {
    if (!profileData.phoneNumber) {
      setMessage('Please enter a phone number');
      setMessageType('error');
      return;
    }

    setPhoneVerificationLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        API_ENDPOINTS.VERIFY_PHONE,
        { phoneNumber: profileData.phoneNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('OTP sent to your phone number');
      setMessageType('success');
      setShowPhoneVerification(true);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to send OTP');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setPhoneVerificationLoading(false);
    }
  };

  const handleConfirmPhoneVerification = async () => {
    if (!phoneOTP) {
      setMessage('Please enter the OTP');
      setMessageType('error');
      return;
    }

    setPhoneVerificationLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        API_ENDPOINTS.CONFIRM_PHONE_VERIFICATION,
        { otp: phoneOTP },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.user) {
        setUser(response.data.user);
        setMessage('Phone number verified successfully!');
        setMessageType('success');
        setShowPhoneVerification(false);
        setPhoneOTP('');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to verify phone');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setPhoneVerificationLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      setMessageType('error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://full-bank-app.onrender.com/api/auth/change-password',
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Password changed successfully!');
      setMessageType('success');
      setShowChangePassword(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error changing password. Please try again.');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image file');
      setMessageType('error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be less than 5MB');
      setMessageType('error');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result;
        const token = localStorage.getItem('token');
        
        // Send image to backend for saving
        const response = await axios.put(
          'https://full-bank-app.onrender.com/api/auth/profile-image',
          { image: base64 },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update user context with new image from database
        if (response.data.user) {
          setUser(response.data.user);
          setProfileImage(response.data.user.profileImage);
          setMessage('Profile image updated successfully!');
          setMessageType('success');
          setShowImageModal(false);
        }
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Failed to upload image. Please try again.');
        setMessageType('error');
        setTimeout(() => setMessage(''), 3000);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <PageLayout pageTitle="Settings" pageSubtitle="Manage your profile and preferences">
      {/* Success/Error Message */}
      {message && (
        <div
          style={{
            background: messageType === 'success' ? COLORS.success : COLORS.danger,
            color: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}
        >
          {message}
        </div>
      )}

      {/* Profile Section */}
      <div className="row g-4 mb-5">
        {/* Profile Card */}
        <div className="col-lg-6">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '32px',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              border: isDarkMode ? '1px solid #374151' : 'none',
              textAlign: 'center'
            }}
          >
            {/* Profile Image with Upload Button */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
              <img
                src={profileImage || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=${COLORS.primary.substring(1)}&color=white&size=120`}
                alt="profile"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `4px solid ${COLORS.primary}`,
                  cursor: 'pointer'
                }}
                onClick={() => setShowImageModal(true)}
              />
              <button
                onClick={() => setShowImageModal(true)}
                style={{
                  position: 'absolute',
                  right: '0',
                  bottom: '0',
                  background: COLORS.primary,
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#3730A3';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = COLORS.primary;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title="Upload photo"
              >
                <i className="fas fa-camera" style={{ color: 'white', fontSize: '16px' }}></i>
              </button>
            </div>

            <h4 className="fw-bold mb-2" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              {user?.firstName} {user?.lastName}
            </h4>

            <p className="mb-1" style={{ color: COLORS.lightText, fontSize: '0.875rem' }}>
              {user?.email}
            </p>

            <div className="d-flex align-items-center gap-2 mb-4">
              <p className="mb-0" style={{ color: COLORS.lightText, fontSize: '0.875rem' }}>
                Account: {hideAccountNumber ? '****' + (user?.accountNumber || 'N/A').slice(-4) : (user?.accountNumber || 'N/A')}
              </p>
              <button
                onClick={() => setHideAccountNumber(!hideAccountNumber)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: COLORS.lightText,
                  cursor: 'pointer',
                  padding: '4px',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = COLORS.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = COLORS.lightText}
                title={hideAccountNumber ? 'Show account number' : 'Hide account number'}
              >
                <i className={`fas fa-eye${hideAccountNumber ? '-slash' : ''}`}></i>
              </button>
            </div>

            <div className="d-flex gap-2 flex-column">
              <button
                onClick={() => {
                  setProfileData({
                    firstName: user?.firstName || '',
                    lastName: user?.lastName || '',
                    email: user?.email || ''
                  });
                  setShowEditProfile(true);
                }}
                className="btn fw-semibold"
                style={{
                  background: COLORS.primary,
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  padding: '12px 24px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#3730A3'}
                onMouseLeave={(e) => e.currentTarget.style.background = COLORS.primary}
              >
                <i className="fas fa-user-edit me-2"></i>Edit Profile
              </button>

              <button
                onClick={() => {
                  setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  setShowChangePassword(true);
                }}
                className="btn fw-semibold"
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  color: isDarkMode ? '#D1D5DB' : COLORS.darkText,
                  borderRadius: '12px',
                  border: 'none',
                  padding: '12px 24px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDarkMode ? '#4B5563' : COLORS.lighter;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDarkMode ? '#374151' : COLORS.light;
                }}
              >
                <i className="fas fa-lock me-2"></i>Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="col-lg-6">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '32px',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              border: isDarkMode ? '1px solid #374151' : 'none'
            }}
          >
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              <i className="fas fa-info-circle me-2" style={{ color: COLORS.primary }}></i>
              Account Information
            </h5>

            <div className="mb-4">
              <p className="mb-1 small" style={{ color: COLORS.lightText }}>First Name</p>
              <p className="fw-bold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                {user?.firstName || 'N/A'}
              </p>
            </div>

            <div className="mb-4">
              <p className="mb-1 small" style={{ color: COLORS.lightText }}>Last Name</p>
              <p className="fw-bold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                {user?.lastName || 'N/A'}
              </p>
            </div>

            <div className="mb-4">
              <p className="mb-1 small" style={{ color: COLORS.lightText }}>Email Address</p>
              <p className="fw-bold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                {user?.email || 'N/A'}
              </p>
            </div>

            <div className="mb-4">
              <p className="mb-1 small" style={{ color: COLORS.lightText }}>Account Number</p>
              <div className="d-flex align-items-center gap-2">
                <p className="fw-bold mb-0" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                  {hideAccountNumber ? '****' + (user?.accountNumber || 'N/A').slice(-4) : (user?.accountNumber || 'N/A')}
                </p>
                <button
                  onClick={() => setHideAccountNumber(!hideAccountNumber)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: COLORS.lightText,
                    cursor: 'pointer',
                    padding: '4px',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = COLORS.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = COLORS.lightText}
                  title={hideAccountNumber ? 'Show account number' : 'Hide account number'}
                >
                  <i className={`fas fa-eye${hideAccountNumber ? '-slash' : ''}`}></i>
                </button>
              </div>
            </div>

            <div>
              <p className="mb-1 small" style={{ color: COLORS.lightText }}>Account Type</p>
              <p className="fw-bold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                {user?.accountType || 'Standard'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Upgrade Section */}
      <div className="mb-5">
        <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
          <i className="fas fa-crown me-2" style={{ color: COLORS.warning }}></i>
          Upgrade Your Account
        </h5>
        <div className="row g-4">
          {[
            {
              tier: 'Standard',
              name: 'Standard',
              icon: '⭐',
              price: '₦0',
              period: 'Forever Free',
              features: [
                'Basic account features',
                '₦100,000 daily limit',
                '₦500,000 monthly limit',
                'Email support',
                'Standard security'
              ],
              button: 'Current Plan',
              buttonColor: COLORS.primary,
              isCurrentTier: !user?.accountType || user?.accountType === 'Standard'
            },
            {
              tier: 'Premium',
              name: 'Premium',
              icon: '💎',
              price: '₦4,999',
              period: 'one-time',
              features: [
                'All Standard features',
                '₦500,000 daily limit',
                '₦5,000,000 monthly limit',
                'Priority email support',
                'Enhanced security',
                'Exclusive features'
              ],
              button: 'Upgrade Now',
              buttonColor: COLORS.success,
              isCurrentTier: user?.accountType === 'Premium'
            },
            {
              tier: 'Business',
              name: 'Business',
              icon: '👑',
              price: '₦9,999',
              period: 'one-time',
              features: [
                'All Premium features',
                'No daily limit',
                'Unlimited monthly limit',
                '24/7 dedicated support',
                'Maximum security',
                'VIP benefits',
                'Priority processing'
              ],
              button: 'Get Business',
              buttonColor: '#FFD700',
              isCurrentTier: user?.accountType === 'Business'
            }
          ].map((plan) => (
            <div key={plan.tier} className="col-lg-4">
              <div
                style={{
                  background: isDarkMode ? '#1F2937' : COLORS.card,
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                  border: plan.isCurrentTier ? `2px solid ${COLORS.success}` : (isDarkMode ? '1px solid #374151' : 'none'),
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!plan.isCurrentTier) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = isDarkMode ? 'none' : '0 8px 24px rgba(0,0,0,0.12)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!plan.isCurrentTier) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)';
                  }
                }}
              >
                {plan.isCurrentTier && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      background: COLORS.success,
                      color: 'white',
                      borderRadius: '8px',
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  >
                    ACTIVE
                  </div>
                )}

                <div style={{ fontSize: '2rem', marginBottom: '12px' }} aria-hidden="true">
                  {plan.icon}
                </div>

                <h6 className="fw-bold mb-2" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                  {plan.name}
                </h6>

                <div className="mb-4">
                  <h4 className="fw-bold mb-0" style={{ color: COLORS.primary }}>
                    {plan.price}
                  </h4>
                  <p className="small mb-0" style={{ color: COLORS.lightText }}>
                    {plan.period}
                  </p>
                </div>

                <div className="mb-4">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="d-flex align-items-start mb-2">
                      <i className="fas fa-check me-2" style={{ color: COLORS.success, marginTop: '2px', fontSize: '0.75rem' }}></i>
                      <p className="small mb-0" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  className="btn w-100 fw-semibold"
                  style={{
                    background: plan.isCurrentTier ? '#6B7280' : plan.buttonColor,
                    color: plan.buttonColor === '#FFD700' ? '#000' : 'white',
                    borderRadius: '12px',
                    border: 'none',
                    padding: '12px 24px',
                    cursor: plan.isCurrentTier ? 'default' : 'pointer',
                    opacity: plan.isCurrentTier ? 0.7 : 1,
                    transition: 'all 0.3s ease'
                  }}
                  disabled={plan.isCurrentTier}
                  onClick={async () => {
                    if (!plan.isCurrentTier) {
                      // Show upgrade confirmation modal
                      setPendingUpgrade(plan);
                      setShowUpgradeConfirm(true);
                    }
                  }}
                >
                  {plan.isCurrentTier ? 'Current Plan' : 'Upgrade'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Confirmation Modal */}
      <ConfirmModal
        show={showUpgradeConfirm}
        onClose={() => {
          setShowUpgradeConfirm(false);
          setPendingUpgrade(null);
        }}
        onConfirm={async () => {
          if (pendingUpgrade) {
            try {
              const plan = pendingUpgrade;
              const token = localStorage.getItem('token');
              const response = await axios.post(
                API_ENDPOINTS.UPGRADE_ACCOUNT,
                { accountType: plan.tier },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              // Update user context with new balance and account type
              setUser(response.data.user);
              
              // Update localStorage
              localStorage.setItem('user', JSON.stringify(response.data.user));
              
              setMessage(
                `🎉 Successfully upgraded to ${plan.name}! ₦${response.data.upgradeCost?.toLocaleString('en-NG') || plan.price} has been deducted from your balance.`
              );
              setMessageType('success');
              setTimeout(() => setMessage(''), 6000);
            } catch (error) {
              const errorMsg = error.response?.data?.message || 'Upgrade failed. Please try again.';
              setMessage(errorMsg);
              setMessageType('error');
              setTimeout(() => setMessage(''), 5000);
            }
          }
          setShowUpgradeConfirm(false);
          setPendingUpgrade(null);
        }}
        title="Upgrade Account"
        message={pendingUpgrade ? `Are you sure you want to upgrade to ${pendingUpgrade.name}?\n\nUpgrade cost: ₦${pendingUpgrade.price}\n\nThis amount will be deducted from your account balance.` : ''}
        confirmText="Upgrade Now"
        confirmColor="#10B981"
        isDarkMode={isDarkMode}
      />

      {/* Settings Options */}
      <div className="row g-4 mb-5">
        <div className="col-lg-6">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '32px',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              border: isDarkMode ? '1px solid #374151' : 'none'
            }}
          >
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              <i className="fas fa-sliders-h me-2" style={{ color: COLORS.primary }}></i>
              Preferences
            </h5>

            <div className="d-flex align-items-center justify-content-between mb-3 pb-3" style={{ borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB' }}>
              <div>
                <p className="fw-semibold mb-1" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                  Email Notifications
                </p>
                <p className="small" style={{ color: COLORS.lightText }}>Receive email updates</p>
              </div>
              <label style={{ marginBottom: 0 }}>
                <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
              </label>
            </div>

            <div className="d-flex align-items-center justify-content-between mb-3 pb-3" style={{ borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB' }}>
              <div>
                <p className="fw-semibold mb-1" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                  SMS Notifications
                </p>
                <p className="small" style={{ color: COLORS.lightText }}>Receive SMS alerts</p>
              </div>
              <label style={{ marginBottom: 0 }}>
                <input type="checkbox" style={{ cursor: 'pointer' }} />
              </label>
            </div>

            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="fw-semibold mb-1" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                  Push Notifications
                </p>
                <p className="small" style={{ color: COLORS.lightText }}>Receive push notifications</p>
              </div>
              <label style={{ marginBottom: 0 }}>
                <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
              </label>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '32px',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              border: isDarkMode ? '1px solid #374151' : 'none'
            }}
          >
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              <i className="fas fa-shield-alt me-2" style={{ color: COLORS.primary }}></i>
              Security
            </h5>

            <div className="d-flex align-items-center justify-content-between mb-3 pb-3" style={{ borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB' }}>
              <div>
                <p className="fw-semibold mb-1" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                  Two-Factor Authentication
                </p>
                <p className="small" style={{ color: COLORS.lightText }}>Enhance your security</p>
              </div>
              <label style={{ marginBottom: 0 }}>
                <input type="checkbox" style={{ cursor: 'pointer' }} />
              </label>
            </div>

            <div className="d-flex align-items-center justify-content-between mb-3 pb-3" style={{ borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB' }}>
              <div>
                <p className="fw-semibold mb-1" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                  Biometric Login
                </p>
                <p className="small" style={{ color: COLORS.lightText }}>Use fingerprint/face ID</p>
              </div>
              <label style={{ marginBottom: 0 }}>
                <input type="checkbox" style={{ cursor: 'pointer' }} />
              </label>
            </div>

            <button
              className="btn w-100 fw-semibold"
              style={{
                background: COLORS.danger,
                color: 'white',
                borderRadius: '12px',
                border: 'none',
                padding: '12px 24px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#DC2626'}
              onMouseLeave={(e) => e.currentTarget.style.background = COLORS.danger}
              onClick={() => setShowLogoutConfirm(true)}
            >
              <i className="fas fa-sign-out-alt me-2"></i>Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Language & Currency Settings */}
      <div className="row g-4 mb-5">
        <div className="col-lg-6">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '32px',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              border: isDarkMode ? '1px solid #374151' : 'none'
            }}
          >
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              <i className="fas fa-globe me-2" style={{ color: COLORS.primary }}></i>
              Language & Region
            </h5>

            <div className="mb-3 pb-3" style={{ borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB' }}>
              <label className="fw-semibold mb-2 d-block" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                Language
              </label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="form-select"
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                  color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="German">German (Deutsch)</option>
                <option value="Portuguese">Portuguese (Português)</option>
                <option value="Chinese">Chinese (中文)</option>
              </select>
            </div>

            <div>
              <label className="fw-semibold mb-2 d-block" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                Currency Display
              </label>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="form-select"
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                  color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <option value="USD">USD - US Dollar ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="GBP">GBP - British Pound (£)</option>
                <option value="NGN">NGN - Nigerian Naira (₦)</option>
                <option value="JPY">JPY - Japanese Yen (¥)</option>
                <option value="CNY">CNY - Chinese Yuan (¥)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '32px',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              border: isDarkMode ? '1px solid #374151' : 'none'
            }}
          >
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              <i className="fas fa-palette me-2" style={{ color: COLORS.primary }}></i>
              Display Settings
            </h5>

            <div className="mb-3 pb-3" style={{ borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB' }}>
              <label className="fw-semibold mb-2 d-block" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                Theme
              </label>
              <select 
                value={themePreference}
                onChange={(e) => setThemePreference(e.target.value)}
                className="form-select"
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                  color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <option value="Auto">Auto (System preference)</option>
                <option value="Light">Light</option>
                <option value="Dark">Dark</option>
              </select>
            </div>

            <div>
              <label className="fw-semibold mb-2 d-block" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                Display Density
              </label>
              <select 
                value={displayDensity}
                onChange={(e) => setDisplayDensity(e.target.value)}
                className="form-select"
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                  color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <option value="Comfortable">Comfortable</option>
                <option value="Compact">Compact</option>
                <option value="Spacious">Spacious</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Account Management */}
      <div className="row g-4 mb-5">
        <div className="col-lg-6">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '32px',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              border: isDarkMode ? '1px solid #374151' : 'none'
            }}
          >
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              <i className="fas fa-user-shield me-2" style={{ color: COLORS.primary }}></i>
              Privacy Settings
            </h5>

            <div className="text-center py-4">
              <i className="fas fa-eye" style={{ fontSize: '3rem', color: COLORS.primary, opacity: 0.3, marginBottom: '16px' }}></i>
              <p style={{ color: COLORS.lightText, fontSize: '0.875rem', marginBottom: '8px' }}>
                Use the eye icons next to your balance and account number to toggle visibility.
              </p>
              <p style={{ color: COLORS.lightText, fontSize: '0.75rem' }}>
                <i className="fas fa-info-circle me-1"></i>
                Look for the <i className="fas fa-eye mx-1"></i> icon on your dashboard and profile
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '32px',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              border: isDarkMode ? '1px solid #374151' : 'none'
            }}
          >
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              <i className="fas fa-cog me-2" style={{ color: COLORS.primary }}></i>
              Account Management
            </h5>

            <div className="mb-3 pb-3" style={{ borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB' }}>
              <label className="fw-semibold mb-2 d-block" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                Session Timeout
              </label>
              <select 
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="form-select"
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                  color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <option value="15 minutes">15 minutes</option>
                <option value="30 minutes">30 minutes</option>
                <option value="1 hour">1 hour</option>
                <option value="2 hours">2 hours</option>
                <option value="Never">Never</option>
              </select>
            </div>

            <div className="d-flex gap-2">
              <button
                onClick={() => setShowLoginActivity(true)}
                className="btn w-100 fw-semibold"
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  color: isDarkMode ? '#D1D5DB' : COLORS.darkText,
                  borderRadius: '8px',
                  border: 'none',
                  padding: '10px',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#4B5563' : '#E5E7EB'}
                onMouseLeave={(e) => e.currentTarget.style.background = isDarkMode ? '#374151' : COLORS.light}
              >
                <i className="fas fa-history me-2"></i>Login Activity
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Limits & Statements */}
      <div className="row g-4 mb-5">
        <div className="col-lg-6">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '32px',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              border: isDarkMode ? '1px solid #374151' : 'none'
            }}
          >
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              <i className="fas fa-chart-line me-2" style={{ color: COLORS.primary }}></i>
              Transaction Limits
            </h5>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ color: COLORS.lightText, fontSize: '0.875rem' }}>Daily Transfer Limit</span>
                <span className="fw-bold" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                  ${user?.accountType === 'Premium' ? '50,000' : user?.accountType === 'Business' ? '100,000' : '10,000'}
                </span>
              </div>
              <div className="progress" style={{ height: '8px', background: isDarkMode ? '#374151' : '#E5E7EB', borderRadius: '4px' }}>
                <div
                  className="progress-bar"
                  style={{
                    width: '35%',
                    background: `linear-gradient(90deg, ${COLORS.primary}, #764ba2)`,
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ color: COLORS.lightText, fontSize: '0.875rem' }}>Monthly Withdrawal Limit</span>
                <span className="fw-bold" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                  ${user?.accountType === 'Premium' ? '200,000' : user?.accountType === 'Business' ? '500,000' : '50,000'}
                </span>
              </div>
              <div className="progress" style={{ height: '8px', background: isDarkMode ? '#374151' : '#E5E7EB', borderRadius: '4px' }}>
                <div
                  className="progress-bar"
                  style={{
                    width: '62%',
                    background: `linear-gradient(90deg, #10B981, #059669)`,
                    borderRadius: '4px'
                  }}
                ></div>
              </div>
            </div>

            <p className="small mb-0" style={{ color: COLORS.lightText }}>
              <i className="fas fa-info-circle me-1"></i>
              Upgrade your account for higher limits
            </p>
          </div>
        </div>

        <div className="col-lg-6">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '32px',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              border: isDarkMode ? '1px solid #374151' : 'none'
            }}
          >
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              <i className="fas fa-file-download me-2" style={{ color: COLORS.primary }}></i>
              Statement Downloads
            </h5>

            <p className="mb-3" style={{ color: COLORS.lightText, fontSize: '0.875rem' }}>
              Download your transaction history and statements
            </p>

            <div className="d-flex flex-column gap-2">
              <button
                className="btn fw-semibold"
                style={{
                  background: COLORS.primary,
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  padding: '10px',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#3730A3'}
                onMouseLeave={(e) => e.currentTarget.style.background = COLORS.primary}
              >
                <i className="fas fa-download me-2"></i>Download This Month
              </button>

              <button
                className="btn fw-semibold"
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  color: isDarkMode ? '#D1D5DB' : COLORS.darkText,
                  borderRadius: '8px',
                  border: 'none',
                  padding: '10px',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#4B5563' : '#E5E7EB'}
                onMouseLeave={(e) => e.currentTarget.style.background = isDarkMode ? '#374151' : COLORS.light}
              >
                <i className="fas fa-calendar-alt me-2"></i>Custom Date Range
              </button>

              <button
                className="btn fw-semibold"
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  color: isDarkMode ? '#D1D5DB' : COLORS.darkText,
                  borderRadius: '8px',
                  border: 'none',
                  padding: '10px',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#4B5563' : '#E5E7EB'}
                onMouseLeave={(e) => e.currentTarget.style.background = isDarkMode ? '#374151' : COLORS.light}
              >
                <i className="fas fa-file-pdf me-2"></i>Tax Documents
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setShowEditProfile(false)}
        >
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: 'clamp(20px, 4vw, 32px)',
              maxWidth: '500px',
              width: '100%',
              border: isDarkMode ? '1px solid #374151' : 'none',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                Edit Profile
              </h5>
              <button
                onClick={() => setShowEditProfile(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: isDarkMode ? '#9CA3AF' : COLORS.lightText
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleProfileUpdate}>
              <div className="mb-3">
                <label className="form-label small fw-semibold" style={{ color: COLORS.lightText }}>
                  First Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  style={{
                    background: isDarkMode ? '#374151' : COLORS.light,
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                    borderRadius: '12px'
                  }}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold" style={{ color: COLORS.lightText }}>
                  Last Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  style={{
                    background: isDarkMode ? '#374151' : COLORS.light,
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                    borderRadius: '12px'
                  }}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold" style={{ color: COLORS.lightText }}>
                  Phone Number
                </label>
                <div className="d-flex gap-2">
                  <input
                    type="tel"
                    className="form-control flex-grow-1"
                    value={profileData.phoneNumber}
                    onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                    placeholder="+234 812 345 6789"
                    style={{
                      background: isDarkMode ? '#374151' : COLORS.light,
                      border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                      color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                      borderRadius: '12px'
                    }}
                  />
                  {profileData.phoneNumber && !user?.phoneVerified && (
                    <button
                      type="button"
                      onClick={handleVerifyPhone}
                      disabled={phoneVerificationLoading}
                      className="btn"
                      style={{
                        background: COLORS.primary,
                        color: 'white',
                        borderRadius: '12px',
                        border: 'none',
                        padding: '12px 16px',
                        whiteSpace: 'nowrap',
                        opacity: phoneVerificationLoading ? 0.6 : 1
                      }}
                    >
                      {phoneVerificationLoading ? 'Sending...' : 'Verify'}
                    </button>
                  )}
                </div>
                {user?.phoneVerified && (
                  <small style={{ color: COLORS.success }}>
                    <i className="fas fa-check-circle me-1"></i>Verified
                  </small>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold" style={{ color: COLORS.lightText }}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control"
                  value={profileData.email}
                  disabled
                  style={{
                    background: isDarkMode ? '#374151' : COLORS.light,
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    color: isDarkMode ? '#9CA3AF' : COLORS.lightText,
                    borderRadius: '12px',
                    cursor: 'not-allowed'
                  }}
                />
                <small style={{ color: COLORS.lightText }}>Email cannot be changed</small>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn flex-grow-1 fw-semibold"
                  style={{
                    background: COLORS.primary,
                    color: 'white',
                    borderRadius: '12px',
                    border: 'none',
                    padding: '12px'
                  }}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="btn flex-grow-1 fw-semibold"
                  style={{
                    background: isDarkMode ? '#374151' : COLORS.light,
                    color: isDarkMode ? '#D1D5DB' : COLORS.darkText,
                    borderRadius: '12px',
                    border: 'none',
                    padding: '12px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phone Verification Modal */}
      {showPhoneVerification && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            padding: '1rem'
          }}
          onClick={() => setShowPhoneVerification(false)}
        >
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: 'clamp(20px, 4vw, 32px)',
              maxWidth: '400px',
              width: '100%',
              border: isDarkMode ? '1px solid #374151' : 'none'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                Verify Phone Number
              </h5>
              <button
                onClick={() => setShowPhoneVerification(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: isDarkMode ? '#9CA3AF' : COLORS.lightText
                }}
              >
                ×
              </button>
            </div>

            <p className="small mb-3" style={{ color: COLORS.lightText }}>
              We've sent a verification code to <strong>{profileData.phoneNumber}</strong>
            </p>

            <div className="mb-3">
              <label className="form-label small fw-semibold" style={{ color: COLORS.lightText }}>
                Enter OTP
              </label>
              <input
                type="text"
                className="form-control"
                value={phoneOTP}
                onChange={(e) => setPhoneOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                  color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                  borderRadius: '12px',
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  letterSpacing: '8px'
                }}
              />
            </div>

            <div className="d-flex gap-2">
              <button
                onClick={handleConfirmPhoneVerification}
                disabled={phoneVerificationLoading || phoneOTP.length !== 6}
                className="btn flex-grow-1 fw-semibold"
                style={{
                  background: COLORS.primary,
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  padding: '12px',
                  opacity: phoneVerificationLoading || phoneOTP.length !== 6 ? 0.6 : 1,
                  cursor: phoneVerificationLoading || phoneOTP.length !== 6 ? 'not-allowed' : 'pointer'
                }}
              >
                {phoneVerificationLoading ? 'Verifying...' : 'Verify'}
              </button>
              <button
                type="button"
                onClick={() => setShowPhoneVerification(false)}
                className="btn flex-grow-1 fw-semibold"
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  color: isDarkMode ? '#D1D5DB' : COLORS.darkText,
                  borderRadius: '12px',
                  border: 'none',
                  padding: '12px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setShowChangePassword(false)}
        >
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: 'clamp(20px, 4vw, 32px)',
              maxWidth: '500px',
              width: '100%',
              border: isDarkMode ? '1px solid #374151' : 'none',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                Change Password
              </h5>
              <button
                onClick={() => setShowChangePassword(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: isDarkMode ? '#9CA3AF' : COLORS.lightText
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePasswordChange}>
              <div className="mb-3">
                <label className="form-label small fw-semibold" style={{ color: COLORS.lightText }}>
                  Current Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  style={{
                    background: isDarkMode ? '#374151' : COLORS.light,
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                    borderRadius: '12px'
                  }}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold" style={{ color: COLORS.lightText }}>
                  New Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  style={{
                    background: isDarkMode ? '#374151' : COLORS.light,
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                    borderRadius: '12px'
                  }}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold" style={{ color: COLORS.lightText }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  style={{
                    background: isDarkMode ? '#374151' : COLORS.light,
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                    borderRadius: '12px'
                  }}
                  required
                />
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn flex-grow-1 fw-semibold"
                  style={{
                    background: COLORS.primary,
                    color: 'white',
                    borderRadius: '12px',
                    border: 'none',
                    padding: '12px'
                  }}
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="btn flex-grow-1 fw-semibold"
                  style={{
                    background: isDarkMode ? '#374151' : COLORS.light,
                    color: isDarkMode ? '#D1D5DB' : COLORS.darkText,
                    borderRadius: '12px',
                    border: 'none',
                    padding: '12px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setShowImageModal(false)}
        >
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: 'clamp(20px, 4vw, 32px)',
              maxWidth: '500px',
              width: '100%',
              border: isDarkMode ? '1px solid #374151' : 'none',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                Upload Profile Photo
              </h5>
              <button
                onClick={() => setShowImageModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: isDarkMode ? '#9CA3AF' : COLORS.lightText
                }}
              >
                ×
              </button>
            </div>

            {profileImage && (
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <img
                  src={profileImage}
                  alt="preview"
                  style={{
                    maxWidth: '200px',
                    height: '200px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    marginBottom: '12px'
                  }}
                />
              </div>
            )}

            <div
              style={{
                border: `2px dashed ${COLORS.primary}`,
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                marginBottom: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: isDarkMode ? '#374151' : '#F9FAFB'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode ? '#4B5563' : COLORS.light;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode ? '#374151' : '#F9FAFB';
              }}
              onClick={() => document.getElementById('image-input').click()}
            >
              <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2rem', color: COLORS.primary, marginBottom: '12px', display: 'block' }}></i>
              <p className="fw-semibold mb-1" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                Click to upload or drag and drop
              </p>
              <p className="small mb-0" style={{ color: COLORS.lightText }}>
                PNG, JPG, GIF up to 5MB
              </p>
              <input
                id="image-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </div>

            <div className="d-flex gap-2">
              <button
                onClick={() => setShowImageModal(false)}
                className="btn flex-grow-1 fw-semibold"
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  color: isDarkMode ? '#D1D5DB' : COLORS.darkText,
                  borderRadius: '12px',
                  border: 'none',
                  padding: '12px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => document.getElementById('image-input').click()}
                disabled={uploading}
                className="btn flex-grow-1 fw-semibold"
                style={{
                  background: uploading ? '#9CA3AF' : COLORS.primary,
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  padding: '12px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.7 : 1
                }}
              >
                {uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" style={{ width: '16px', height: '16px' }} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload me-2"></i>
                    Choose File
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Activity Modal */}
      {showLoginActivity && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setShowLoginActivity(false)}
        >
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: 'clamp(20px, 4vw, 32px)',
              maxWidth: '600px',
              width: '100%',
              border: isDarkMode ? '1px solid #374151' : 'none',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                <i className="fas fa-history me-2" style={{ color: COLORS.primary }}></i>
                Login Activity
              </h5>
              <button
                onClick={() => setShowLoginActivity(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: isDarkMode ? '#9CA3AF' : COLORS.lightText
                }}
              >
                ×
              </button>
            </div>

            <p className="mb-4" style={{ color: COLORS.lightText, fontSize: '0.875rem' }}>
              Recent login activity and device information
            </p>

            {/* Current Session */}
            <div 
              className="mb-3 p-3"
              style={{
                background: isDarkMode ? '#374151' : COLORS.light,
                borderRadius: '12px',
                border: `2px solid ${COLORS.success}`
              }}
            >
              <div className="d-flex align-items-start gap-3">
                <div 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `${COLORS.success}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <i className="fas fa-check-circle" style={{ color: COLORS.success, fontSize: '20px' }}></i>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <p className="fw-bold mb-0" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                      Current Session
                    </p>
                    <span 
                      className="badge"
                      style={{
                        background: COLORS.success,
                        color: 'white',
                        fontSize: '0.7rem',
                        padding: '4px 8px'
                      }}
                    >
                      ACTIVE
                    </span>
                  </div>
                  <p className="mb-1 small" style={{ color: COLORS.lightText }}>
                    <i className="fas fa-laptop me-2"></i>Windows • Chrome
                  </p>
                  <p className="mb-1 small" style={{ color: COLORS.lightText }}>
                    <i className="fas fa-map-marker-alt me-2"></i>Lagos, Nigeria
                  </p>
                  <p className="mb-0 small" style={{ color: COLORS.lightText }}>
                    <i className="fas fa-clock me-2"></i>Today at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Previous Sessions */}
            {[
              { device: 'iPhone 14', location: 'Abuja, Nigeria', time: 'Yesterday at 3:45 PM', browser: 'Safari' },
              { device: 'Windows PC', location: 'Lagos, Nigeria', time: '3 days ago at 9:30 AM', browser: 'Edge' },
              { device: 'Android Phone', location: 'Port Harcourt, Nigeria', time: '1 week ago at 6:15 PM', browser: 'Chrome' }
            ].map((session, index) => (
              <div 
                key={index}
                className="mb-3 p-3"
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  borderRadius: '12px'
                }}
              >
                <div className="d-flex align-items-start gap-3">
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: isDarkMode ? '#4B5563' : '#E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <i className="fas fa-mobile-alt" style={{ color: COLORS.lightText, fontSize: '18px' }}></i>
                  </div>
                  <div className="flex-grow-1">
                    <p className="fw-semibold mb-1" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
                      {session.device}
                    </p>
                    <p className="mb-1 small" style={{ color: COLORS.lightText }}>
                      <i className="fas fa-globe me-2"></i>{session.browser}
                    </p>
                    <p className="mb-1 small" style={{ color: COLORS.lightText }}>
                      <i className="fas fa-map-marker-alt me-2"></i>{session.location}
                    </p>
                    <p className="mb-0 small" style={{ color: COLORS.lightText }}>
                      <i className="fas fa-clock me-2"></i>{session.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-4 pt-3" style={{ borderTop: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB' }}>
              <p className="small mb-2" style={{ color: COLORS.lightText }}>
                <i className="fas fa-info-circle me-2"></i>
                If you notice any suspicious activity, change your password immediately.
              </p>
              <button
                className="btn w-100 fw-semibold"
                style={{
                  background: COLORS.danger,
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  padding: '10px',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#DC2626'}
                onMouseLeave={(e) => e.currentTarget.style.background = COLORS.danger}
              >
                <i className="fas fa-times-circle me-2"></i>End All Other Sessions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        show={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => { logout(); navigate('/signin'); }}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        confirmColor="#EF4444"
        isDarkMode={isDarkMode}
      />
    </PageLayout>
  );
};

export default Me;
