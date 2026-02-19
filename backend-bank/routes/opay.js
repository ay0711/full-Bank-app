
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');

// Cards endpoints
router.get('/cards', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ cards: user.cards || [] });
});

router.post('/cards/request', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user._id);
  const { type } = req.body;
  const last4 = Math.floor(1000 + Math.random() * 9000).toString();
  const card = { type, last4, status: 'active', createdAt: new Date() };
  user.cards.push(card);
  await user.save();
  res.json({ message: `Requested a ${type} card`, card });
});

router.post('/cards/block', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user._id);
  const { type, status } = req.body;
  const card = user.cards.find(c => c.type === type);
  if (card) {
    card.status = status;
    await user.save();
    return res.json({ message: 'Card status updated', status });
  }
  res.status(404).json({ message: 'Card not found' });
});

// Airtime/Data endpoints
router.post('/airtime', authenticateToken, async (req, res) => {
  // Simulate airtime purchase and add transaction
  const user = await User.findById(req.user._id);
  const { amount, phone } = req.body;
  user.transactions.push({
    type: 'debit',
    amount,
    description: `Airtime for ${phone}`,
    date: new Date()
  });
  await user.save();
  res.json({ message: 'Airtime purchased', amount, phone });
});

router.get('/airtime', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user._id).select('transactions');
  const history = (user.transactions || [])
    .filter(tx => tx.type === 'debit' && typeof tx.description === 'string' && tx.description.startsWith('Airtime for '))
    .map(tx => ({
      type: 'airtime',
      amount: tx.amount,
      phone: tx.description.replace('Airtime for ', ''),
      date: tx.date || tx.createdAt || new Date().toISOString()
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ history });
});

router.post('/data', authenticateToken, async (req, res) => {
  // Simulate data purchase and add transaction
  const user = await User.findById(req.user._id);
  const { amount, phone } = req.body;
  user.transactions.push({
    type: 'debit',
    amount,
    description: `Data for ${phone}`,
    date: new Date()
  });
  await user.save();
  res.json({ message: 'Data purchased', amount, phone });
});

router.get('/data', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user._id).select('transactions');
  const history = (user.transactions || [])
    .filter(tx => tx.type === 'debit' && typeof tx.description === 'string' && tx.description.startsWith('Data for '))
    .map(tx => ({
      type: 'data',
      amount: tx.amount,
      phone: tx.description.replace('Data for ', ''),
      date: tx.date || tx.createdAt || new Date().toISOString()
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ history });
});

// Fingerprint endpoints
router.post('/fingerprint/enable', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.fingerprintEnabled = true;
  await user.save();
  res.json({ message: 'Fingerprint enabled' });
});

router.post('/fingerprint/verify', async (req, res) => {
  // In a real app, verify fingerprint credential
  const user = await User.findOne({ email: req.body.email });
  if (user && user.fingerprintEnabled) {
    return res.json({ message: 'Fingerprint verified', user: { email: user.email } });
  }
  res.status(401).json({ message: 'Fingerprint not enabled or user not found' });
});

// Notifications endpoints
router.get('/notifications', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ notifications: user.notifications || [] });
});

router.post('/notifications', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user._id);
  const { message } = req.body;
  user.notifications.push({ message });
  await user.save();
  res.json({ message: 'Notification added' });
});

router.post('/notifications/read', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user._id);
  const { index } = req.body;
  if (user.notifications[index]) {
    user.notifications[index].read = true;
    await user.save();
    return res.json({ message: 'Notification marked as read' });
  }
  res.status(404).json({ message: 'Notification not found' });
});

// Support endpoints
router.get('/support', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ supportRequests: user.supportRequests || [] });
});

router.post('/support', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user._id);
  const { subject, message } = req.body;
  user.supportRequests.push({ subject, message });
  await user.save();
  res.json({ message: 'Support request submitted' });
});

router.post('/support/close', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user._id);
  const { index } = req.body;
  if (user.supportRequests[index]) {
    user.supportRequests[index].status = 'closed';
    await user.save();
    return res.json({ message: 'Support request closed' });
  }
  res.status(404).json({ message: 'Support request not found' });
});

// 2FA endpoints
router.post('/2fa/enable', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.twoFA.enabled = true;
  user.twoFA.secret = Math.floor(100000 + Math.random() * 900000).toString(); // Simulate secret
  await user.save();
  res.json({ message: '2FA enabled', secret: user.twoFA.secret });
});

router.post('/2fa/disable', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.twoFA.enabled = false;
  user.twoFA.secret = '';
  await user.save();
  res.json({ message: '2FA disabled' });
});

router.post('/2fa/verify', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user._id);
  const { code } = req.body;
  if (user.twoFA.enabled && user.twoFA.secret === code) {
    return res.json({ message: '2FA verified' });
  }
  res.status(401).json({ message: 'Invalid 2FA code' });
});

module.exports = router;
