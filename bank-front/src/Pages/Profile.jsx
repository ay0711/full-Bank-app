import React, { useState, useEffect } from 'react';
import PageLayout, { COLORS } from '../components/PageLayout';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser, isDarkMode } = useAppContext();
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [showImageModal, setShowImageModal] = useState(false);
  const [kycStatus, setKycStatus] = useState(user?.kyc?.status || 'unverified');
  const [message, setMessage] = useState('');
  const [kycFile, setKycFile] = useState(null);

  useEffect(() => {
    setProfileImage(user?.profileImage || '');
  }, [user]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setProfileImage(reader.result);
        try {
          const token = localStorage.getItem('token');
          const res = await axios.put(
            'https://full-bank-app.onrender.com/api/auth/profile-image',
            { image: reader.result },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setUser({ ...user, profileImage: res.data.profileImage });
          setMessage('Profile image updated!');
          setShowImageModal(false);
          setTimeout(() => setMessage(''), 3000);
        } catch {
          setMessage('Failed to update image');
          setTimeout(() => setMessage(''), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKYCUpload = async () => {
    if (!kycFile) return;
    try {
      const token = localStorage.getItem('token');
      const reader = new FileReader();
      reader.onloadend = async () => {
        await axios.put(
          'https://full-bank-app.onrender.com/api/auth/kyc',
          { idImage: reader.result },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setKycStatus('pending');
        setMessage('KYC document submitted! Pending verification.');
        setKycFile(null);
        setTimeout(() => setMessage(''), 3000);
      };
      reader.readAsDataURL(kycFile);
    } catch {
      setMessage('Failed to upload KYC document');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const generateAvatar = (name) => {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
    return `https://ui-avatars.com/api/?name=${initials}&background=random&size=128`;
  };

  return (
    <PageLayout pageTitle="My Profile" pageSubtitle="Manage your account and personal information">
      {/* Success/Error Message */}
      {message && (
        <div
          style={{
            background: message.includes('successfully') || message.includes('updated') || message.includes('submitted')
              ? COLORS.success
              : COLORS.danger,
            color: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}
        >
          {message}
        </div>
      )}

      <div className="row g-4 mb-5">
        {/* Profile Overview Card */}
        <div className="col-lg-4">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '28px',
              border: isDarkMode ? '1px solid #374151' : 'none',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}
          >
            {/* Profile Image */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
              <img
                src={profileImage || generateAvatar(`${user?.firstName} ${user?.lastName}`)}
                alt="Profile"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `3px solid ${COLORS.primary}`
                }}
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
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="fas fa-camera" style={{ color: 'white', fontSize: '16px' }}></i>
              </button>
            </div>

            {/* Profile Info */}
            <h5 className="fw-bold mb-2" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              {user?.firstName} {user?.lastName}
            </h5>
            <p className="small mb-3" style={{ color: COLORS.lightText }}>
              {user?.email}
            </p>

            {/* Account Number & Type */}
            <div
              style={{
                background: isDarkMode ? '#374151' : COLORS.light,
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px'
              }}
            >
              <p className="small mb-2" style={{ color: COLORS.lightText }}>
                Account Number
              </p>
              <p className="fw-bold mb-0" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                {user?.accountNumber}
              </p>
            </div>

            {/* Account Status Badge */}
            <div
              style={{
                background: COLORS.success,
                color: 'white',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}
            >
              <i className="fas fa-check me-2"></i>
              Active Account
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="col-lg-8">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '28px',
              border: isDarkMode ? '1px solid #374151' : 'none',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              marginBottom: '20px'
            }}
          >
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              Account Information
            </h5>

            <div className="row g-3">
              <div className="col-md-6">
                <p className="small mb-2" style={{ color: COLORS.lightText }}>
                  First Name
                </p>
                <p className="fw-bold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                  {user?.firstName}
                </p>
              </div>
              <div className="col-md-6">
                <p className="small mb-2" style={{ color: COLORS.lightText }}>
                  Last Name
                </p>
                <p className="fw-bold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                  {user?.lastName}
                </p>
              </div>
              <div className="col-md-6">
                <p className="small mb-2" style={{ color: COLORS.lightText }}>
                  Email Address
                </p>
                <p className="fw-bold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                  {user?.email}
                </p>
              </div>
              <div className="col-md-6">
                <p className="small mb-2" style={{ color: COLORS.lightText }}>
                  Phone Number
                </p>
                <p className="fw-bold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                  {user?.phoneNumber && user.phoneVerified ? (
                    <span>
                      {user.phoneNumber}
                      <i className="fas fa-check-circle" style={{ color: COLORS.success, marginLeft: '8px' }}></i>
                    </span>
                  ) : user?.phoneNumber ? (
                    <span>
                      {user.phoneNumber}
                      <span style={{ color: COLORS.warning, fontSize: '0.875rem', marginLeft: '8px' }}>(Unverified)</span>
                    </span>
                  ) : (
                    'Not provided'
                  )}
                </p>
              </div>
              <div className="col-md-6">
                <p className="small mb-2" style={{ color: COLORS.lightText }}>
                  Account Type
                </p>
                <p className="fw-bold" style={{ color: isDarkMode ? '#D1D5DB' : COLORS.darkText }}>
                  {user?.accountType || 'Standard'}
                </p>
              </div>
              <div className="col-md-6">
                <p className="small mb-2" style={{ color: COLORS.lightText }}>
                  Account Status
                </p>
                <p
                  className="fw-bold"
                  style={{
                    color: COLORS.success
                  }}
                >
                  Active
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/me')}
              className="btn w-100 mt-4"
              style={{
                background: COLORS.primary,
                color: 'white',
                borderRadius: '12px',
                border: 'none',
                padding: '12px'
              }}
            >
              <i className="fas fa-edit me-2"></i>
              Edit Profile
            </button>
          </div>

          {/* KYC Verification */}
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '28px',
              border: isDarkMode ? '1px solid #374151' : 'none',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              KYC Verification
            </h5>

            <div
              style={{
                background: isDarkMode ? '#374151' : COLORS.light,
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px'
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="small mb-1" style={{ color: COLORS.lightText }}>
                    Verification Status
                  </p>
                  <p
                    className="fw-bold"
                    style={{
                      color:
                        kycStatus === 'verified'
                          ? COLORS.success
                          : kycStatus === 'pending'
                            ? COLORS.warning
                            : COLORS.danger
                    }}
                  >
                    {kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
                  </p>
                </div>
                <div style={{ fontSize: '1.75rem' }}>
                  {kycStatus === 'verified' ? '✅' : kycStatus === 'pending' ? '⏳' : '⚠️'}
                </div>
              </div>
            </div>

            {kycStatus === 'unverified' && (
              <>
                <p className="small mb-3" style={{ color: COLORS.lightText }}>
                  Upload a valid ID document (Passport, Driver's License, or National ID) to complete KYC verification.
                </p>
                <div className="mb-3">
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => setKycFile(e.target.files[0])}
                    style={{
                      background: isDarkMode ? '#374151' : COLORS.light,
                      border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                      borderRadius: '12px',
                      color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                      padding: '12px 16px'
                    }}
                  />
                </div>
                <button
                  onClick={handleKYCUpload}
                  disabled={!kycFile}
                  className="btn w-100"
                  style={{
                    background: COLORS.primary,
                    color: 'white',
                    borderRadius: '12px',
                    border: 'none',
                    padding: '12px',
                    opacity: !kycFile ? 0.6 : 1,
                    cursor: !kycFile ? 'not-allowed' : 'pointer'
                  }}
                >
                  <i className="fas fa-upload me-2"></i>
                  Submit ID Document
                </button>
              </>
            )}

            {kycStatus === 'pending' && (
              <div
                style={{
                  background: COLORS.warning + '20',
                  border: `1px solid ${COLORS.warning}`,
                  borderRadius: '12px',
                  padding: '16px'
                }}
              >
                <p className="small mb-0" style={{ color: COLORS.warning }}>
                  <i className="fas fa-hourglass me-2"></i>
                  Your KYC document is under review. This typically takes 1-2 business days.
                </p>
              </div>
            )}

            {kycStatus === 'verified' && (
              <div
                style={{
                  background: COLORS.success + '20',
                  border: `1px solid ${COLORS.success}`,
                  borderRadius: '12px',
                  padding: '16px'
                }}
              >
                <p className="small mb-0" style={{ color: COLORS.success }}>
                  <i className="fas fa-check me-2"></i>
                  Your KYC verification is complete! You have full access to all features.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-4">
        <div className="col-md-6">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '24px',
              border: isDarkMode ? '1px solid #374151' : 'none',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => navigate('/me')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              if (!isDarkMode) e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              if (!isDarkMode) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}
          >
            <h6 className="fw-bold mb-2" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              <i className="fas fa-cog me-2" style={{ color: COLORS.primary }}></i>
              Settings
            </h6>
            <p className="small mb-0" style={{ color: COLORS.lightText }}>
              Manage your account settings and preferences
            </p>
          </div>
        </div>
        <div className="col-md-6">
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '24px',
              border: isDarkMode ? '1px solid #374151' : 'none',
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => navigate('/support')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              if (!isDarkMode) e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              if (!isDarkMode) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}
          >
            <h6 className="fw-bold mb-2" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              <i className="fas fa-headset me-2" style={{ color: COLORS.primary }}></i>
              Support
            </h6>
            <p className="small mb-0" style={{ color: COLORS.lightText }}>
              Contact our support team for help
            </p>
          </div>
        </div>
      </div>

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
            zIndex: 1000
          }}
          onClick={() => setShowImageModal(false)}
        >
          <div
            style={{
              background: isDarkMode ? '#1F2937' : COLORS.card,
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '400px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : COLORS.darkText }}>
              Update Profile Image
            </h5>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-control"
              style={{
                background: isDarkMode ? '#374151' : COLORS.light,
                border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                borderRadius: '12px',
                color: isDarkMode ? '#F3F4F6' : COLORS.darkText,
                padding: '12px 16px'
              }}
            />
            <div className="d-flex gap-2 mt-4">
              <button
                className="btn w-100"
                onClick={() => setShowImageModal(false)}
                style={{
                  background: isDarkMode ? '#374151' : COLORS.light,
                  color: isDarkMode ? '#D1D5DB' : COLORS.darkText,
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Profile;
