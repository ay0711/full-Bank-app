import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';
// Profile content will be inlined below
import { useAppContext } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Me = () => {
  // Advanced settings state (fix ReferenceError)
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [privacy, setPrivacy] = useState({ hideBalance: false, hideAccountNumber: false });
  const [privacyMsg, setPrivacyMsg] = useState('');
  const [showSessions, setShowSessions] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionsMsg, setSessionsMsg] = useState('');
  const [showDownload, setShowDownload] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');
  const [showTheme, setShowTheme] = useState(false);
  const [theme, setTheme] = useState({ accent: '#00C853', fontSize: 16 });
  const [themeMsg, setThemeMsg] = useState('');
  const [showSupport, setShowSupport] = useState(false);
  const [supportMsg, setSupportMsg] = useState('');
  const [showDevices, setShowDevices] = useState(false);
  const [devices, setDevices] = useState([]);
  const [devicesMsg, setDevicesMsg] = useState('');
  const [showLimits, setShowLimits] = useState(false);
  const [limits, setLimits] = useState({ daily: 0, weekly: 0 });
  const [limitsMsg, setLimitsMsg] = useState('');
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [accessibility, setAccessibility] = useState({ highContrast: false, textSize: 16 });
  const [accessibilityMsg, setAccessibilityMsg] = useState('');
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false);
  const [kycStatus, setKycStatus] = useState('unverified');
  const [securityMessage, setSecurityMessage] = useState('');
  const { user, logout, setUser } = useAppContext();
  // Modal state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ firstName: '', lastName: '', email: '' });
  const [editProfileMsg, setEditProfileMsg] = useState('');
  const [changePasswordData, setChangePasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [changePasswordMsg, setChangePasswordMsg] = useState('');
  // Notification Preferences
  const [showNotifPrefs, setShowNotifPrefs] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({ email: true, sms: false, push: true });
  const [notifMsg, setNotifMsg] = useState('');
  // 2FA
  const [show2FA, setShow2FA] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(user && user.twoFA && typeof user.twoFA.enabled === 'boolean' ? user.twoFA.enabled : false);
  const [twoFASecret, setTwoFASecret] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFAMsg, setTwoFAMsg] = useState('');
  // App Settings
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [appSettings, setAppSettings] = useState({ darkMode: false, language: 'en', quickLogin: false });
  const [appSettingsMsg, setAppSettingsMsg] = useState('');
  // KYC
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycFile, setKycFile] = useState(null);
  const [kycMsg, setKycMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleFingerprintToggle = async () => {
    setFingerprintEnabled(!fingerprintEnabled);
    setSecurityMessage(fingerprintEnabled ? 'Fingerprint disabled' : 'Fingerprint enabled');
    // Call backend to enable/disable fingerprint (stub)
  };

  const handleKycUpload = async () => {
    setKycStatus('pending');
    setSecurityMessage('KYC submitted, pending verification');
    // Call backend to upload KYC (stub)
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="min-vh-100 bg-light">
      <div className="container py-4">
        <div className="d-flex justify-content-end mb-3">
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt me-2"></i>Log Out
          </button>
        </div>
        <h3 className="mb-4 text-success">Me</h3>
  {/* Modern Profile Card */}
        {user ? (
          <div className="card shadow-lg border-0 mb-4 bg-white rounded-5 p-4 position-relative modern-profile-card">
            <div className="card-body text-center p-0">
              {/* Profile Image Upload */}
              <div className="mb-3 d-flex flex-column align-items-center justify-content-center position-relative">
                <img
                  src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.firstName||'') + ' ' + (user.lastName||''))}&background=random&size=128`}
                  alt="Profile"
                  className="rounded-circle border border-3 border-success shadow"
                  style={{ width: 110, height: 110, objectFit: 'cover', background: '#f8f9fa' }}
                />
                <label htmlFor="profile-upload" className="btn btn-sm btn-success rounded-circle position-absolute" style={{ right: 'calc(50% - 55px)', bottom: 0, zIndex: 2, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #00C85333' }}>
                  <i className="fas fa-camera text-white"></i>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new window.FileReader();
                        reader.onloadend = async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const res = await fetch('https://full-bank-app.onrender.com/api/auth/profile-image', {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ image: reader.result })
                            });
                            const data = await res.json();
                            if (data.profileImage) {
                              user.profileImage = data.profileImage;
                              localStorage.setItem('user', JSON.stringify(user));
                            }
                          } catch {}
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
              <h4 className="mt-2 mb-0 fw-bold">{user.firstName || ''} {user.lastName || ''}</h4>
              <div className="text-muted mb-2">Acct: <span className="fw-semibold">{user.accountNumber || ''}</span></div>
              <div className="mb-3">
                <span className="badge bg-success bg-gradient px-3 py-2 fs-6 shadow">{user.email}</span>
              </div>
              <hr className="my-4" />
              {/* Settings Section */}
              <div className="text-start mb-4">
                <h5 className="fw-bold mb-3">Settings</h5>
                <button className="btn btn-outline-primary rounded-pill mb-2 w-100 text-start" onClick={() => {
                  setEditProfileData({
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.email || ''
                  });
                  setEditProfileMsg('');
                  setShowEditProfile(true);
                }}><i className="fas fa-user-cog me-2"></i>Edit Profile</button>
                <button className="btn btn-outline-secondary rounded-pill mb-2 w-100 text-start" onClick={() => {
                  setChangePasswordData({ oldPassword: '', newPassword: '' });
                  setChangePasswordMsg('');
                  setShowChangePassword(true);
                }}><i className="fas fa-lock me-2"></i>Change Password</button>
        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Profile</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEditProfile(false)}></button>
                </div>
                <form onSubmit={async e => {
                  e.preventDefault();
                  setEditProfileMsg('');
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch('https://full-bank-app.onrender.com/api/auth/profile', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify(editProfileData)
                    });
                    const data = await res.json();
                    if (data.user) {
                      setUser(data.user);
                      setEditProfileMsg('Profile updated!');
                      setTimeout(() => setShowEditProfile(false), 1000);
                    } else {
                      setEditProfileMsg(data.message || 'Update failed');
                    }
                  } catch {
                    setEditProfileMsg('Update failed');
                  }
                }}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">First Name</label>
                      <input className="form-control" value={editProfileData.firstName} onChange={e => setEditProfileData(d => ({ ...d, firstName: e.target.value }))} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Last Name</label>
                      <input className="form-control" value={editProfileData.lastName} onChange={e => setEditProfileData(d => ({ ...d, lastName: e.target.value }))} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input className="form-control" type="email" value={editProfileData.email} onChange={e => setEditProfileData(d => ({ ...d, email: e.target.value }))} required />
                    </div>
                    {editProfileMsg && <div className="alert alert-info">{editProfileMsg}</div>}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditProfile(false)}>Cancel</button>
                    <button type="submit" className="btn btn-success">Save</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Change Password</h5>
                  <button type="button" className="btn-close" onClick={() => setShowChangePassword(false)}></button>
                </div>
                <form onSubmit={async e => {
                  e.preventDefault();
                  setChangePasswordMsg('');
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch('https://full-bank-app.onrender.com/api/auth/change-password', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify(changePasswordData)
                    });
                    const data = await res.json();
                    if (data.success) {
                      setChangePasswordMsg('Password changed!');
                      setTimeout(() => setShowChangePassword(false), 1000);
                    } else {
                      setChangePasswordMsg(data.message || 'Change failed');
                    }
                  } catch {
                    setChangePasswordMsg('Change failed');
                  }
                }}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Old Password</label>
                      <input className="form-control" type="password" value={changePasswordData.oldPassword} onChange={e => setChangePasswordData(d => ({ ...d, oldPassword: e.target.value }))} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <input className="form-control" type="password" value={changePasswordData.newPassword} onChange={e => setChangePasswordData(d => ({ ...d, newPassword: e.target.value }))} required />
                    </div>
                    {changePasswordMsg && <div className="alert alert-info">{changePasswordMsg}</div>}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowChangePassword(false)}>Cancel</button>
                    <button type="submit" className="btn btn-success">Change</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
                <button className="btn btn-outline-info rounded-pill mb-2 w-100 text-start" onClick={async () => {
                  setNotifMsg('');
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch('https://full-bank-app.onrender.com/api/auth/notification-prefs', {
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.prefs) setNotifPrefs(data.prefs);
                  } catch {}
                  setShowNotifPrefs(true);
                }}><i className="fas fa-bell me-2"></i>Notification Preferences</button>
                <button className="btn btn-outline-warning rounded-pill mb-2 w-100 text-start" onClick={() => setShow2FA(true)}><i className="fas fa-shield-alt me-2"></i>Security & 2FA</button>
        {/* Notification Preferences Modal */}
        {showNotifPrefs && (
          <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Notification Preferences</h5>
                  <button type="button" className="btn-close" onClick={() => setShowNotifPrefs(false)}></button>
                </div>
                <form onSubmit={async e => {
                  e.preventDefault();
                  setNotifMsg('');
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch('https://full-bank-app.onrender.com/api/auth/notification-prefs', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify(notifPrefs)
                    });
                    const data = await res.json();
                    if (data.success) {
                      setNotifMsg('Preferences updated!');
                      setTimeout(() => setShowNotifPrefs(false), 1000);
                    } else {
                      setNotifMsg(data.message || 'Update failed');
                    }
                  } catch {
                    setNotifMsg('Update failed');
                  }
                }}>
                  <div className="modal-body">
                    <div className="form-check mb-2">
                      <input className="form-check-input" type="checkbox" id="notifEmail" checked={notifPrefs.email} onChange={e => setNotifPrefs(p => ({ ...p, email: e.target.checked }))} />
                      <label className="form-check-label" htmlFor="notifEmail">Email Notifications</label>
                    </div>
                    <div className="form-check mb-2">
                      <input className="form-check-input" type="checkbox" id="notifSMS" checked={notifPrefs.sms} onChange={e => setNotifPrefs(p => ({ ...p, sms: e.target.checked }))} />
                      <label className="form-check-label" htmlFor="notifSMS">SMS Notifications</label>
                    </div>
                    <div className="form-check mb-2">
                      <input className="form-check-input" type="checkbox" id="notifPush" checked={notifPrefs.push} onChange={e => setNotifPrefs(p => ({ ...p, push: e.target.checked }))} />
                      <label className="form-check-label" htmlFor="notifPush">Push Notifications</label>
                    </div>
                    {notifMsg && <div className="alert alert-info mt-2">{notifMsg}</div>}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowNotifPrefs(false)}>Cancel</button>
                    <button type="submit" className="btn btn-success">Save</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 2FA Modal */}
        {show2FA && (
          <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Security & 2FA</h5>
                  <button type="button" className="btn-close" onClick={() => setShow2FA(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="2faSwitch" checked={twoFAEnabled} onChange={async e => {
                      setTwoFAMsg('');
                      try {
                        const token = localStorage.getItem('token');
                        if (e.target.checked) {
                          // Enable 2FA
                          const res = await fetch('https://full-bank-app.onrender.com/api/opay/2fa/enable', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          const data = await res.json();
                          if (data.secret) {
                            setTwoFASecret(data.secret);
                            setTwoFAEnabled(true);
                            setTwoFAMsg('2FA enabled. Enter the code sent to your email.');
                          }
                        } else {
                          // Disable 2FA
                          await fetch('https://full-bank-app.onrender.com/api/opay/2fa/disable', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          setTwoFAEnabled(false);
                          setTwoFASecret('');
                          setTwoFAMsg('2FA disabled.');
                        }
                      } catch { setTwoFAMsg('2FA update failed'); }
                    }} />
                    <label className="form-check-label" htmlFor="2faSwitch">Enable Two-Factor Authentication (2FA)</label>
                  </div>
                  {twoFAEnabled && (
                    <div className="mb-3">
                      <label className="form-label">Enter 2FA Code</label>
                      <input className="form-control" value={twoFACode} onChange={e => setTwoFACode(e.target.value)} />
                      <button className="btn btn-success mt-2" onClick={async () => {
                        setTwoFAMsg('');
                        try {
                          const token = localStorage.getItem('token');
                          const res = await fetch('https://full-bank-app.onrender.com/api/opay/2fa/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ code: twoFACode })
                          });
                          const data = await res.json();
                          if (data.success) setTwoFAMsg('2FA verified!');
                          else setTwoFAMsg(data.message || 'Invalid code');
                        } catch { setTwoFAMsg('Verification failed'); }
                      }}>Verify</button>
                    </div>
                  )}
                  {twoFAMsg && <div className="alert alert-info mt-2">{twoFAMsg}</div>}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShow2FA(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
                <button className="btn btn-outline-dark rounded-pill mb-2 w-100 text-start" onClick={async () => {
                  setAppSettingsMsg('');
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch('https://full-bank-app.onrender.com/api/auth/app-settings', {
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.settings) setAppSettings(data.settings);
                  } catch {}
                  setShowAppSettings(true);
                }}><i className="fas fa-cog me-2"></i>App Settings</button>
                <button className="btn btn-outline-dark rounded-pill mb-2 w-100 text-start" onClick={() => setShowPrivacy(true)}><i className="fas fa-user-secret me-2"></i>Account Privacy</button>
                <button className="btn btn-outline-dark rounded-pill mb-2 w-100 text-start" onClick={async () => {
                  setSessionsMsg('');
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch('https://full-bank-app.onrender.com/api/auth/sessions', {
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.sessions) setSessions(data.sessions);
                  } catch {}
                  setShowSessions(true);
                }}><i className="fas fa-desktop me-2"></i>Session Management</button>
                <button className="btn btn-outline-dark rounded-pill mb-2 w-100 text-start" onClick={() => setShowDownload(true)}><i className="fas fa-download me-2"></i>Download My Data</button>
                <button className="btn btn-outline-danger rounded-pill mb-2 w-100 text-start" onClick={() => setShowDelete(true)}><i className="fas fa-user-times me-2"></i>Delete Account</button>
                <button className="btn btn-outline-dark rounded-pill mb-2 w-100 text-start" onClick={() => setShowTheme(true)}><i className="fas fa-palette me-2"></i>Theme Customization</button>
                <button className="btn btn-outline-dark rounded-pill mb-2 w-100 text-start" onClick={() => setShowSupport(true)}><i className="fas fa-headset me-2"></i>Contact Support</button>
                <button className="btn btn-outline-dark rounded-pill mb-2 w-100 text-start" onClick={async () => {
                  setDevicesMsg('');
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch('https://full-bank-app.onrender.com/api/auth/devices', {
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.devices) setDevices(data.devices);
                  } catch {}
                  setShowDevices(true);
                }}><i className="fas fa-link me-2"></i>Linked Devices</button>
                <button className="btn btn-outline-dark rounded-pill mb-2 w-100 text-start" onClick={() => setShowLimits(true)}><i className="fas fa-sliders-h me-2"></i>Transaction Limits</button>
                <button className="btn btn-outline-dark rounded-pill mb-2 w-100 text-start" onClick={() => setShowAccessibility(true)}><i className="fas fa-universal-access me-2"></i>Accessibility</button>

        {/* Account Privacy Modal */}
        {showPrivacy && (
          <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Account Privacy</h5><button type="button" className="btn-close" onClick={() => setShowPrivacy(false)}></button></div>
              <form onSubmit={async e => {
                e.preventDefault(); setPrivacyMsg('');
                try {
                  const token = localStorage.getItem('token');
                  const res = await fetch('https://full-bank-app.onrender.com/api/auth/privacy', {
                    method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(privacy)
                  });
                  const data = await res.json();
                  if (data.success) { setPrivacyMsg('Privacy updated!'); setTimeout(() => setShowPrivacy(false), 1000); }
                  else setPrivacyMsg(data.message || 'Update failed');
                } catch { setPrivacyMsg('Update failed'); }
              }}>
                <div className="modal-body">
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" id="hideBalance" checked={privacy.hideBalance} onChange={e => setPrivacy(p => ({ ...p, hideBalance: e.target.checked }))} />
                    <label className="form-check-label" htmlFor="hideBalance">Hide Balance</label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" id="hideAccountNumber" checked={privacy.hideAccountNumber} onChange={e => setPrivacy(p => ({ ...p, hideAccountNumber: e.target.checked }))} />
                    <label className="form-check-label" htmlFor="hideAccountNumber">Hide Account Number</label>
                  </div>
                  {privacyMsg && <div className="alert alert-info mt-2">{privacyMsg}</div>}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowPrivacy(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success">Save</button>
                </div>
              </form>
            </div></div>
          </div>
        )}

        {/* Session Management Modal */}
        {showSessions && (
          <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Session Management</h5><button type="button" className="btn-close" onClick={() => setShowSessions(false)}></button></div>
              <div className="modal-body">
                <ul className="list-group mb-2">
                  {sessions.map((s, i) => (
                    <li className="list-group-item d-flex justify-content-between align-items-center" key={i}>
                      <span>{s.device || 'Device'} - {s.location || 'Unknown'} {s.current && <span className="badge bg-success ms-2">Current</span>}</span>
                      {!s.current && <button className="btn btn-sm btn-danger" onClick={async () => {
                        setSessionsMsg('');
                        try {
                          const token = localStorage.getItem('token');
                          await fetch(`https://full-bank-app.onrender.com/api/auth/sessions/${s.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                          setSessions(sessions.filter((_, idx) => idx !== i));
                        } catch { setSessionsMsg('Failed to revoke'); }
                      }}>Revoke</button>}
                    </li>
                  ))}
                </ul>
                {sessionsMsg && <div className="alert alert-info mt-2">{sessionsMsg}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSessions(false)}>Close</button>
              </div>
            </div></div>
          </div>
        )}

        {/* Download Data Modal */}
        {showDownload && (
          <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Download My Data</h5><button type="button" className="btn-close" onClick={() => setShowDownload(false)}></button></div>
              <div className="modal-body">
                <button className="btn btn-success w-100" onClick={async () => {
                  setDownloadMsg('');
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch('https://full-bank-app.onrender.com/api/auth/download', { headers: { 'Authorization': `Bearer ${token}` } });
                    if (res.ok) {
                      const blob = await res.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = 'my-bank-data.zip';
                      document.body.appendChild(a); a.click(); a.remove();
                      setDownloadMsg('Download started!');
                    } else setDownloadMsg('Download failed');
                  } catch { setDownloadMsg('Download failed'); }
                }}>Download All Data</button>
                {downloadMsg && <div className="alert alert-info mt-2">{downloadMsg}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDownload(false)}>Close</button>
              </div>
            </div></div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDelete && (
          <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Delete Account</h5><button type="button" className="btn-close" onClick={() => setShowDelete(false)}></button></div>
              <div className="modal-body">
                <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                <button className="btn btn-danger w-100" onClick={async () => {
                  setDeleteMsg('');
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch('https://full-bank-app.onrender.com/api/auth/delete', { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                    if (res.ok) {
                      setDeleteMsg('Account deleted. Logging out...');
                      setTimeout(() => handleLogout(), 1500);
                    } else setDeleteMsg('Delete failed');
                  } catch { setDeleteMsg('Delete failed'); }
                }}>Delete My Account</button>
                {deleteMsg && <div className="alert alert-info mt-2">{deleteMsg}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button>
              </div>
            </div></div>
          </div>
        )}

        {/* Theme Customization Modal */}
        {showTheme && (
          <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Theme Customization</h5><button type="button" className="btn-close" onClick={() => setShowTheme(false)}></button></div>
              <form onSubmit={async e => {
                e.preventDefault(); setThemeMsg('');
                try {
                  const token = localStorage.getItem('token');
                  const res = await fetch('https://full-bank-app.onrender.com/api/auth/theme', {
                    method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(theme)
                  });
                  const data = await res.json();
                  if (data.success) { setThemeMsg('Theme updated!'); setTimeout(() => setShowTheme(false), 1000); }
                  else setThemeMsg(data.message || 'Update failed');
                } catch { setThemeMsg('Update failed'); }
              }}>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">Accent Color</label>
                    <input className="form-control form-control-color" type="color" value={theme.accent} onChange={e => setTheme(t => ({ ...t, accent: e.target.value }))} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Font Size</label>
                    <input className="form-control" type="number" min={12} max={32} value={theme.fontSize} onChange={e => setTheme(t => ({ ...t, fontSize: Number(e.target.value) }))} />
                  </div>
                  {themeMsg && <div className="alert alert-info mt-2">{themeMsg}</div>}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTheme(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success">Save</button>
                </div>
              </form>
            </div></div>
          </div>
        )}

        {/* Contact Support Modal */}
        {showSupport && (
          <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Contact Support</h5><button type="button" className="btn-close" onClick={() => setShowSupport(false)}></button></div>
              <form onSubmit={async e => {
                e.preventDefault(); setSupportMsg('');
                try {
                  const token = localStorage.getItem('token');
                  const res = await fetch('https://full-bank-app.onrender.com/api/support', {
                    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ message: supportMsg })
                  });
                  const data = await res.json();
                  if (data.success) { setSupportMsg('Support request sent!'); setTimeout(() => setShowSupport(false), 1000); }
                  else setSupportMsg(data.message || 'Failed to send');
                } catch { setSupportMsg('Failed to send'); }
              }}>
                <div className="modal-body">
                  <textarea className="form-control" rows={4} placeholder="Describe your issue..." value={supportMsg} onChange={e => setSupportMsg(e.target.value)} required />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowSupport(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success">Send</button>
                </div>
              </form>
            </div></div>
          </div>
        )}

        {/* Linked Devices Modal */}
        {showDevices && (
          <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Linked Devices</h5><button type="button" className="btn-close" onClick={() => setShowDevices(false)}></button></div>
              <div className="modal-body">
                <ul className="list-group mb-2">
                  {devices.map((d, i) => (
                    <li className="list-group-item d-flex justify-content-between align-items-center" key={i}>
                      <span>{d.name || 'Device'} - {d.lastActive || 'Unknown'}</span>
                      <button className="btn btn-sm btn-danger" onClick={async () => {
                        setDevicesMsg('');
                        try {
                          const token = localStorage.getItem('token');
                          await fetch(`https://full-bank-app.onrender.com/api/auth/devices/${d.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                          setDevices(devices.filter((_, idx) => idx !== i));
                        } catch { setDevicesMsg('Failed to remove'); }
                      }}>Remove</button>
                    </li>
                  ))}
                </ul>
                {devicesMsg && <div className="alert alert-info mt-2">{devicesMsg}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDevices(false)}>Close</button>
              </div>
            </div></div>
          </div>
        )}

        {/* Transaction Limits Modal */}
        {showLimits && (
          <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Transaction Limits</h5><button type="button" className="btn-close" onClick={() => setShowLimits(false)}></button></div>
              <form onSubmit={async e => {
                e.preventDefault(); setLimitsMsg('');
                try {
                  const token = localStorage.getItem('token');
                  const res = await fetch('https://full-bank-app.onrender.com/api/auth/limits', {
                    method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(limits)
                  });
                  const data = await res.json();
                  if (data.success) { setLimitsMsg('Limits updated!'); setTimeout(() => setShowLimits(false), 1000); }
                  else setLimitsMsg(data.message || 'Update failed');
                } catch { setLimitsMsg('Update failed'); }
              }}>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">Daily Limit</label>
                    <input className="form-control" type="number" min={0} value={limits.daily} onChange={e => setLimits(l => ({ ...l, daily: Number(e.target.value) }))} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Weekly Limit</label>
                    <input className="form-control" type="number" min={0} value={limits.weekly} onChange={e => setLimits(l => ({ ...l, weekly: Number(e.target.value) }))} />
                  </div>
                  {limitsMsg && <div className="alert alert-info mt-2">{limitsMsg}</div>}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowLimits(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success">Save</button>
                </div>
              </form>
            </div></div>
          </div>
        )}

        {/* Accessibility Modal */}
        {showAccessibility && (
          <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Accessibility</h5><button type="button" className="btn-close" onClick={() => setShowAccessibility(false)}></button></div>
              <form onSubmit={async e => {
                e.preventDefault(); setAccessibilityMsg('');
                try {
                  const token = localStorage.getItem('token');
                  const res = await fetch('https://full-bank-app.onrender.com/api/auth/accessibility', {
                    method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(accessibility)
                  });
                  const data = await res.json();
                  if (data.success) { setAccessibilityMsg('Accessibility updated!'); setTimeout(() => setShowAccessibility(false), 1000); }
                  else setAccessibilityMsg(data.message || 'Update failed');
                } catch { setAccessibilityMsg('Update failed'); }
              }}>
                <div className="modal-body">
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" id="highContrast" checked={accessibility.highContrast} onChange={e => setAccessibility(a => ({ ...a, highContrast: e.target.checked }))} />
                    <label className="form-check-label" htmlFor="highContrast">High Contrast</label>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Text Size</label>
                    <input className="form-control" type="number" min={12} max={32} value={accessibility.textSize} onChange={e => setAccessibility(a => ({ ...a, textSize: Number(e.target.value) }))} />
                  </div>
                  {accessibilityMsg && <div className="alert alert-info mt-2">{accessibilityMsg}</div>}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAccessibility(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success">Save</button>
                </div>
              </form>
            </div></div>
          </div>
        )}
              </div>
              <hr className="my-4" />
              {/* Security Section */}
              <div className="text-start mb-4">
                <h5 className="fw-bold mb-3">Security & Fingerprint</h5>
                <div className="form-check form-switch mb-3">
                  <input className="form-check-input" type="checkbox" id="fingerprintSwitch" checked={fingerprintEnabled} onChange={handleFingerprintToggle} />
                  <label className="form-check-label" htmlFor="fingerprintSwitch">Enable Fingerprint Sign-in</label>
                </div>
                {securityMessage && <div className="alert alert-info mt-2">{securityMessage}</div>}
              </div>
              <hr className="my-4" />
              {/* KYC Section */}
              <div className="text-start mb-4">
                <h5 className="fw-bold mb-3">KYC Verification</h5>
                <p>Status: <strong>{kycStatus}</strong></p>
                <button className="btn btn-outline-success rounded-pill mb-2 w-100 text-start" onClick={() => setShowKycModal(true)}><i className="fas fa-id-card me-2"></i>Upload ID</button>
        {/* App Settings Modal */}
        {showAppSettings && (
          <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">App Settings</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAppSettings(false)}></button>
                </div>
                <form onSubmit={async e => {
                  e.preventDefault();
                  setAppSettingsMsg('');
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch('https://full-bank-app.onrender.com/api/auth/app-settings', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify(appSettings)
                    });
                    const data = await res.json();
                    if (data.success) {
                      setAppSettingsMsg('Settings updated!');
                      setTimeout(() => setShowAppSettings(false), 1000);
                    } else {
                      setAppSettingsMsg(data.message || 'Update failed');
                    }
                  } catch {
                    setAppSettingsMsg('Update failed');
                  }
                }}>
                  <div className="modal-body">
                    <div className="form-check mb-2">
                      <input className="form-check-input" type="checkbox" id="darkMode" checked={appSettings.darkMode} onChange={e => setAppSettings(s => ({ ...s, darkMode: e.target.checked }))} />
                      <label className="form-check-label" htmlFor="darkMode">Dark Mode</label>
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Language</label>
                      <select className="form-select" value={appSettings.language} onChange={e => setAppSettings(s => ({ ...s, language: e.target.value }))}>
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                    <div className="form-check mb-2">
                      <input className="form-check-input" type="checkbox" id="quickLogin" checked={appSettings.quickLogin} onChange={e => setAppSettings(s => ({ ...s, quickLogin: e.target.checked }))} />
                      <label className="form-check-label" htmlFor="quickLogin">Enable Quick Login</label>
                    </div>
                    {appSettingsMsg && <div className="alert alert-info mt-2">{appSettingsMsg}</div>}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAppSettings(false)}>Cancel</button>
                    <button type="submit" className="btn btn-success">Save</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* KYC Modal */}
        {showKycModal && (
          <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">KYC Verification</h5>
                  <button type="button" className="btn-close" onClick={() => setShowKycModal(false)}></button>
                </div>
                <form onSubmit={async e => {
                  e.preventDefault();
                  setKycMsg('');
                  if (!kycFile) { setKycMsg('Please select a file'); return; }
                  try {
                    const token = localStorage.getItem('token');
                    const formData = new FormData();
                    formData.append('kyc', kycFile);
                    const res = await fetch('https://full-bank-app.onrender.com/api/opay/kyc', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}` },
                      body: formData
                    });
                    const data = await res.json();
                    if (data.success) {
                      setKycMsg('KYC uploaded! Pending verification.');
                      setTimeout(() => setShowKycModal(false), 1000);
                      setKycStatus('pending');
                    } else {
                      setKycMsg(data.message || 'Upload failed');
                    }
                  } catch {
                    setKycMsg('Upload failed');
                  }
                }}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Upload ID Document</label>
                      <input className="form-control" type="file" accept="image/*,application/pdf" onChange={e => setKycFile(e.target.files[0])} />
                    </div>
                    {kycMsg && <div className="alert alert-info mt-2">{kycMsg}</div>}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowKycModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-success">Upload</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
              </div>
            </div>
          </div>
        ) : <div className="text-center py-5"><div className="spinner-border" /></div>}
  {/* No duplicate cards below! */}
      </div>
      <BottomNav />
    </div>
  );
};

export default Me;
