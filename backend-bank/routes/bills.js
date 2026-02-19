const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Get bill payment history
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Get bill payment transactions
        const billTransactions = user.transactions.filter(tx => 
            tx.type === 'debit' && 
            (tx.description?.includes('Bill payment') || 
             tx.description?.includes('electricity') ||
             tx.description?.includes('water') ||
             tx.description?.includes('internet'))
        );
        
        res.json({ 
            history: billTransactions,
            success: true
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Pay bills
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { category, provider, amount, phone } = req.body;
        
        // Validate inputs
        if (!category || !provider || !amount) {
            return res.status(400).json({ message: 'Category, provider, and amount are required' });
        }
        
        const billAmount = parseFloat(amount);
        
        if (billAmount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }
        
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check sufficient balance
        if (user.accountBalance < billAmount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }
        
        // Deduct amount
        user.accountBalance -= billAmount;
        
        // Add transaction record
        const description = `Bill payment - ${category} (${provider})${phone ? ` - ${phone}` : ''}`;
        user.transactions.push({
            type: 'debit',
            amount: billAmount,
            description: description,
            category: category,
            provider: provider,
            date: new Date()
        });
        
        await user.save();
        
        res.json({
            message: 'Bill payment successful',
            newBalance: user.accountBalance,
            transaction: user.transactions[user.transactions.length - 1]
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
