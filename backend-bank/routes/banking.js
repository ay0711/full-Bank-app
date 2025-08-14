const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { sendTransactionEmail } = require('../utils/emailService');

// Get user dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json({
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                accountNumber: user.accountNumber,
                accountBalance: user.accountBalance,
                transactions: user.transactions
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Transfer money
router.post('/transfer', authenticateToken, async (req, res) => {
    try {
        const { recipientAccountNumber, amount, description } = req.body;
        const senderId = req.user._id;

        // Validate amount
        if (amount <= 0) {
            return res.status(400).json({ message: 'Transfer amount must be greater than 0' });
        }

        // Find sender
        const sender = await User.findById(senderId);
        if (!sender) {
            return res.status(404).json({ message: 'Sender not found' });
        }

        // Check if sender has sufficient balance
        if (sender.accountBalance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Find recipient
        const recipient = await User.findOne({ accountNumber: recipientAccountNumber });
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient account not found' });
        }

        // Check if sender is not transferring to themselves
        if (sender.accountNumber === recipientAccountNumber) {
            return res.status(400).json({ message: 'Cannot transfer to your own account' });
        }

        // Perform transfer
        sender.accountBalance -= amount;
        recipient.accountBalance += amount;

        // Add transaction records
        const senderTransaction = {
            type: 'debit',
            amount: amount,
            description: description || `Transfer to ${recipient.firstName} ${recipient.lastName}`,
            recipientAccountNumber: recipientAccountNumber,
            date: new Date()
        };

        const recipientTransaction = {
            type: 'credit',
            amount: amount,
            description: description || `Transfer from ${sender.firstName} ${sender.lastName}`,
            senderAccountNumber: sender.accountNumber,
            date: new Date()
        };

        sender.transactions.push(senderTransaction);
        recipient.transactions.push(recipientTransaction);

        // Save both users
        await sender.save();
        await recipient.save();

        // Send transaction emails
        try {
            await sendTransactionEmail(sender.email, `${sender.firstName} ${sender.lastName}`, 'debit', amount, senderTransaction.description, sender.accountBalance);
            await sendTransactionEmail(recipient.email, `${recipient.firstName} ${recipient.lastName}`, 'credit', amount, recipientTransaction.description, recipient.accountBalance);
        } catch (err) {
            // Email errors are silent
        }

        res.status(200).json({
            message: 'Transfer successful',
            newBalance: sender.accountBalance,
            transaction: senderTransaction
        });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get transactions
router.get('/transactions', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('transactions');
        const sortedTransactions = user.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.status(200).json({
            transactions: sortedTransactions
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
