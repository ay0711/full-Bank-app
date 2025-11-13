
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const User = require('../models/User');

// Cards endpoints
router.get('/cards', authenticateToken, asyncHandler(async (req, res) => {
  const user = req.user;
  res.json({ cards: user.cards || [] });
}));

router.post('/cards/request', authenticateToken, asyncHandler(async (req, res) => {
  const user = req.user;
  const { type } = req.body;
  const last4 = Math.floor(1000 + Math.random() * 9000).toString();
  const card = { type, last4, status: 'active', createdAt: new Date() };
  user.cards.push(card);
  await user.save();
  res.json({ message: `Requested a ${type} card`, card });
}));

router.post('/cards/block', authenticateToken, asyncHandler(async (req, res) => {
  const user = req.user;
  const { type, status } = req.body;
  const card = user.cards.find(c => c.type === type);
  if (card) {
    card.status = status;
    await user.save();
    return res.json({ message: 'Card status updated', status });
  }
  res.status(404).json({ message: 'Card not found' });
}));

// Airtime/Data endpoints
router.post('/airtime', authenticateToken, asyncHandler(async (req, res) => {
  // Simulate airtime purchase and add transaction
  const user = req.user;
  const { amount, phone } = req.body;
  user.transactions.push({ type: 'debit', amount, description: `Airtime for ${phone}` });
  await user.save();
  res.json({ message: 'Airtime purchased', amount, phone });
}));

router.post('/data', authenticateToken, asyncHandler(async (req, res) => {
  // Simulate data purchase and add transaction
  const user = req.user;
  const { amount, phone } = req.body;
  user.transactions.push({ type: 'debit', amount, description: `Data for ${phone}` });
  await user.save();
  res.json({ message: 'Data purchased', amount, phone });
}));

// Fingerprint endpoints
router.post('/fingerprint/enable', authenticateToken, asyncHandler(async (req, res) => {
  const user = req.user;
  user.fingerprintEnabled = true;
  await user.save();
  res.json({ message: 'Fingerprint enabled' });
}));

router.post('/fingerprint/verify', asyncHandler(async (req, res) => {
  // In a real app, verify fingerprint credential
  const user = await User.findOne({ email: req.body.email });
  if (user && user.fingerprintEnabled) {
    return res.json({ message: 'Fingerprint verified', user: { email: user.email } });
  }
  res.status(401).json({ message: 'Fingerprint not enabled or user not found' });
}));
// 2FA endpoints
router.post('/2fa/enable', authenticateToken, asyncHandler(async (req, res) => {
  const user = req.user;
  user.twoFA.enabled = true;
  user.twoFA.secret = Math.floor(100000 + Math.random() * 900000).toString(); // Simulate secret
  await user.save();
  res.json({ message: '2FA enabled', secret: user.twoFA.secret });
}));

router.post('/2fa/disable', authenticateToken, asyncHandler(async (req, res) => {
  const user = req.user;
  user.twoFA.enabled = false;
  user.twoFA.secret = '';
  await user.save();
  res.json({ message: '2FA disabled' });
}));

router.post('/2fa/verify', authenticateToken, asyncHandler(async (req, res) => {
  const user = req.user;
  const { code } = req.body;
  if (user.twoFA.enabled && user.twoFA.secret === code) {
    return res.json({ message: '2FA verified' });
  }
  res.status(401).json({ message: 'Invalid 2FA code' });
}));

module.exports = router;
