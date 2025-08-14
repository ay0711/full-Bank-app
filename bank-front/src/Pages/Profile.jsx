import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';


// Simple avatar generator (initials)
function generateAvatar(name) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return `https://ui-avatars.com/api/?name=${initials}&background=random&size=128`;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser, isDarkMode } = useAppContext();
  // Defensive: fallback to defaults if user fields are missing
  const [profileImage, setProfileImage] = useState(user && user.profileImage ? user.profileImage : '');
  const [showModal, setShowModal] = useState(false);
  const [fingerprintEnabled, setFingerprintEnabled] = useState(user && typeof user.fingerprintEnabled === 'boolean' ? user.fingerprintEnabled : false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(user && user.twoFA && typeof user.twoFA.enabled === 'boolean' ? user.twoFA.enabled : false);
  const [twoFASecret, setTwoFASecret] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [kycStatus, setKycStatus] = useState(user && user.kyc && user.kyc.status ? user.kyc.status : 'unverified');
  const [kycFile, setKycFile] = useState(null);
  const [profileMsg, setProfileMsg] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  const handleFingerprintToggle = async () => {
    setFingerprintEnabled(!fingerprintEnabled);
    // Persist to backend or localStorage
    const updatedUser = { ...user, fingerprintEnabled: !fingerprintEnabled };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    // Optionally: await axios.post('/api/auth/fingerprint', { enabled: !fingerprintEnabled });
  };

// Simple avatar generator (initials)
function generateAvatar(name) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return `https://ui-avatars.com/api/?name=${initials}&background=random&size=128`;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser, isDarkMode } = useAppContext();
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [showModal, setShowModal] = useState(false);

  // Persist image after refresh and fetch notifications/support
  useEffect(() => {
    setProfileImage(user?.profileImage || '');
    fetchNotifications();
    fetchSupport();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
  const res = await axios.get('https://full-bank-app.onrender.com/api/opay/notifications', { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(res.data.notifications);
    } catch {}
  };
  const fetchSupport = async () => {
    try {
      const token = localStorage.getItem('token');
  const res = await axios.get('https://full-bank-app.onrender.com/api/opay/support', { headers: { Authorization: `Bearer ${token}` } });
      setSupportRequests(res.data.supportRequests);
    } catch {}
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" />
      </div>
    );
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setProfileImage(reader.result);
        try {
          const token = localStorage.getItem('token');
          const res = await axios.put('https://full-bank-app.onrender.com/api/auth/profile-image', { image: reader.result }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser({ ...user, profileImage: res.data.profileImage });
        } catch (err) {
          // Optionally show error
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`container py-5 min-vh-100 ${isDarkMode ? 'bg-dark text-light' : 'bg-light'}`}> 
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className={`card shadow-lg border-0 mb-4 ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white'}`}> 
            <div className="card-body text-center">
              {/* Navigation Buttons */}
              <div className="mb-3 d-flex justify-content-between">
                <button className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'} rounded-pill`} onClick={() => navigate && navigate('/dashboard')}>
                  <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
                </button>
                <button className="btn btn-outline-success rounded-pill" onClick={() => navigate && navigate('/')}>Log Out</button>
              </div>
              {/* Profile Section */}
              <div className="mb-3">
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="rounded-circle border" style={{ width: 100, height: 100, objectFit: 'cover', border: '3px solid #00C853' }} />
                  ) : (
                    <img src={generateAvatar(`${user.firstName} ${user.lastName}`)} alt="Avatar" className="rounded-circle border" style={{ width: 100, height: 100, border: '3px solid #00C853' }} />
                  )}
                  <span
                    style={{ position: 'absolute', right: 0, bottom: 0, background: '#00C853', borderRadius: '50%', padding: 8, cursor: 'pointer' }}
                    onClick={() => setShowModal(true)}
                  >
                    <i className="fas fa-camera text-white"></i>
                  </span>
                </div>
                <h4 className="mt-3 mb-0">{user.firstName || ''} {user.lastName || ''}</h4>
                <small className="text-muted">{user.accountNumber || ''}</small>
              </div>

              {/* Modal for image upload */}
              {showModal && (
                <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Update Profile Image</h5>
                        <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                      </div>
                      <div className="modal-body">
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <hr />
              {/* Security Section */}
              <h5 className="mt-4">Security</h5>
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" id="fingerprintSwitch" checked={fingerprintEnabled} onChange={handleFingerprintToggle} />
                <label className="form-check-label" htmlFor="fingerprintSwitch">Enable Fingerprint Sign-in</label>
              </div>
              <div className="d-grid gap-2 mb-3">
                <button className="btn btn-outline-secondary">Change Password</button>
                {twoFAEnabled ? (
                  <>
                    <button className="btn btn-outline-danger" onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        await axios.post('https://full-bank-app.onrender.com/api/opay/2fa/disable', {}, { headers: { Authorization: `Bearer ${token}` } });
                        setTwoFAEnabled(false);
                        setTwoFASecret('');
                        setProfileMsg('2FA disabled.');
                      } catch { setProfileMsg('Failed to disable 2FA'); }
                    }}>Disable 2FA</button>
                    <input type="text" className="form-control my-2" placeholder="Enter 2FA code" value={twoFACode} onChange={e => setTwoFACode(e.target.value)} />
                    <button className="btn btn-success" onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        await axios.post('https://full-bank-app.onrender.com/api/opay/2fa/verify', { code: twoFACode }, { headers: { Authorization: `Bearer ${token}` } });
                        setProfileMsg('2FA verified!');
                      } catch { setProfileMsg('Invalid 2FA code'); }
                    }}>Verify 2FA</button>
                  </>
                ) : (
                  <button className="btn btn-outline-info" onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      const res = await axios.post('https://full-bank-app.onrender.com/api/opay/2fa/enable', {}, { headers: { Authorization: `Bearer ${token}` } });
                      setTwoFAEnabled(true);
                      setTwoFASecret(res.data.secret);
                      setProfileMsg('2FA enabled. Enter the code sent to your email.');
                    } catch { setProfileMsg('Failed to enable 2FA'); }
                  }}>Enable 2FA</button>
                )}
              </div>
              {/* Notifications Section */}
              <h5 className="mt-4">Notifications</h5>
              <div className="mb-3 text-start">
                <ul className="list-group">
                  {notifications.length === 0 ? (
                    <li className="list-group-item">No notifications yet</li>
                  ) : notifications.map((n, idx) => (
                    <li className={`list-group-item d-flex justify-content-between align-items-center ${n.read ? 'text-muted' : ''}`} key={idx}>
                      {n.message}
                      {!n.read && <button className="btn btn-sm btn-outline-success" onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          await axios.post('https://full-bank-app.onrender.com/api/opay/notifications/read', { index: idx }, { headers: { Authorization: `Bearer ${token}` } });
                          fetchNotifications();
                        } catch {}
                      }}>Mark as read</button>}
                    </li>
                  ))}
                </ul>
              </div>
              {/* KYC Section */}
              <h5 className="mt-4">KYC Verification</h5>
              <div className="mb-3">
                <p>Status: <strong>{kycStatus}</strong></p>
                <input type="file" accept="image/*" className="form-control mb-2" onChange={e => setKycFile(e.target.files[0])} />
                <button className="btn btn-outline-success" onClick={async () => {
                  if (!kycFile) return;
                  try {
                    const token = localStorage.getItem('token');
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      await axios.put('https://full-bank-app.onrender.com/api/auth/kyc', { idImage: reader.result }, { headers: { Authorization: `Bearer ${token}` } });
                      setKycStatus('pending');
                      setProfileMsg('KYC submitted!');
                    };
                    reader.readAsDataURL(kycFile);
                  } catch { setProfileMsg('Failed to upload KYC'); }
                }}>Upload ID</button>
              </div>
              {/* Other Actions */}
              <hr />
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary">Edit Profile</button>
                {/* Support section */}
                <div className="card p-3 my-2">
                  <h6>Support Request</h6>
                  <input type="text" className="form-control mb-2" placeholder="Subject" value={supportSubject} onChange={e => setSupportSubject(e.target.value)} />
                  <textarea className="form-control mb-2" placeholder="Message" value={supportMessage} onChange={e => setSupportMessage(e.target.value)} />
                  <button className="btn btn-success" onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      await axios.post('https://full-bank-app.onrender.com/api/opay/support', { subject: supportSubject, message: supportMessage }, { headers: { Authorization: `Bearer ${token}` } });
                      setSupportSubject(''); setSupportMessage('');
                      setProfileMsg('Support request submitted!');
                      fetchSupport();
                    } catch { setProfileMsg('Failed to submit support request'); }
                  }}>Submit</button>
                </div>
                <div className="card p-3 my-2">
                  <h6>My Support Requests</h6>
                  <ul className="list-group">
                    {supportRequests.length === 0 ? (
                      <li className="list-group-item">No support requests yet</li>
                    ) : supportRequests.map((s, idx) => (
                      <li className="list-group-item d-flex justify-content-between align-items-center" key={idx}>
                        <span>{s.subject}: {s.message}</span>
                        <span className={`badge ${s.status === 'open' ? 'bg-info' : 'bg-secondary'}`}>{s.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="btn btn-outline-warning">Settings</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {profileMsg && <div className="alert alert-info mt-3">{profileMsg}</div>}
    </div>
  );
};
}
export default Profile;
