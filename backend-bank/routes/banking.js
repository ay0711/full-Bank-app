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
                accountType: user.accountType,
                transactions: user.transactions,
                cards: user.cards,
                loanApplications: user.loanApplications,
                airtimeHistory: user.airtimeHistory,
                dataHistory: user.dataHistory,
                notifications: user.notifications,
                settings: user.settings
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

        // Log request for debugging
        console.log('Transfer request:', { recipientAccountNumber, amount, description, senderId });

        // Validate required fields
        if (!recipientAccountNumber || !amount) {
            return res.status(400).json({ message: 'Recipient account number and amount are required' });
        }

        // Validate amount
        if (amount <= 0) {
            return res.status(400).json({ message: 'Transfer amount must be greater than 0' });
        }

        // Find sender
        const sender = await User.findById(senderId);
        if (!sender) {
            return res.status(404).json({ message: 'Sender not found' });
        }

        // Check transaction limits based on account type
        const accountType = sender.accountType || 'Standard';
        const transactionLimits = {
            'Standard': { daily: 100000, monthly: 500000 },
            'Premium': { daily: 500000, monthly: 5000000 },
            'Business': { daily: Infinity, monthly: Infinity }
        };
        
        const limits = transactionLimits[accountType];
        
        // Check daily limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTransactions = sender.transactions.filter(tx => {
            const txDate = new Date(tx.date);
            txDate.setHours(0, 0, 0, 0);
            return tx.type === 'debit' && txDate.getTime() === today.getTime();
        });
        const todayTotal = todayTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        
        if (todayTotal + amount > limits.daily) {
            return res.status(400).json({ 
                message: `Daily transaction limit exceeded. Your ${accountType} account has a daily limit of ₦${limits.daily.toLocaleString('en-NG')}. You've used ₦${todayTotal.toLocaleString('en-NG')} today.`,
                limit: limits.daily,
                used: todayTotal,
                accountType: accountType
            });
        }
        
        // Check monthly limit
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        const monthTransactions = sender.transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return tx.type === 'debit' && txDate >= thisMonth;
        });
        const monthTotal = monthTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        
        if (monthTotal + amount > limits.monthly) {
            return res.status(400).json({ 
                message: `Monthly transaction limit exceeded. Your ${accountType} account has a monthly limit of ₦${limits.monthly.toLocaleString('en-NG')}. You've used ₦${monthTotal.toLocaleString('en-NG')} this month.`,
                limit: limits.monthly,
                used: monthTotal,
                accountType: accountType
            });
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

        // Respond immediately, then send emails in the background
        res.status(200).json({
            message: 'Transfer successful',
            newBalance: sender.accountBalance,
            transaction: senderTransaction
        });

        setImmediate(async () => {
            try {
                await sendTransactionEmail(
                    sender.email,
                    `${sender.firstName} ${sender.lastName}`,
                    'debit',
                    amount,
                    senderTransaction.description,
                    sender.accountBalance
                );
                await sendTransactionEmail(
                    recipient.email,
                    `${recipient.firstName} ${recipient.lastName}`,
                    'credit',
                    amount,
                    recipientTransaction.description,
                    recipient.accountBalance
                );
            } catch (err) {
                console.warn('Transfer email send failed:', err.message);
            }
        });

    } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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

// Get recent transfer recipients
router.get('/recipients', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('transactions');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const debitTransfers = user.transactions
            .filter(tx => tx.type === 'debit' && tx.recipientAccountNumber)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        const seen = new Set();
        const recentAccounts = [];
        for (const tx of debitTransfers) {
            if (!seen.has(tx.recipientAccountNumber)) {
                seen.add(tx.recipientAccountNumber);
                recentAccounts.push(tx.recipientAccountNumber);
            }
            if (recentAccounts.length >= 10) {
                break;
            }
        }

        if (recentAccounts.length === 0) {
            return res.status(200).json({ recipients: [] });
        }

        const recipientsData = await User.find({
            accountNumber: { $in: recentAccounts }
        }).select('firstName lastName accountNumber').lean();

        const recipientMap = new Map(
            recipientsData.map(rec => [rec.accountNumber, rec])
        );

        const recipients = recentAccounts
            .slice(0, 5)
            .map(accountNumber => {
                const rec = recipientMap.get(accountNumber);
                return {
                    accountNumber,
                    name: rec ? `${rec.firstName} ${rec.lastName}` : accountNumber
                };
            });

        res.status(200).json({ recipients });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Fund account
router.post('/fund', authenticateToken, async (req, res) => {
    try {
        const { amount, paymentMethod } = req.body;
        
        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }
        
        if (amount < 100) {
            return res.status(400).json({ message: 'Minimum funding amount is ₦100' });
        }
        
        if (amount > 10000000) {
            return res.status(400).json({ message: 'Maximum funding amount is ₦10,000,000' });
        }
        
        if (!paymentMethod) {
            return res.status(400).json({ message: 'Payment method is required' });
        }
        
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Add amount to balance
        user.accountBalance += amount;
        
        // Add transaction record
        user.transactions.push({
            type: 'credit',
            amount: amount,
            description: `Account funded via ${paymentMethod}`,
            date: new Date()
        });
        
        await user.save();
        
        res.json({
            message: 'Account funded successfully',
            newBalance: user.accountBalance,
            transaction: user.transactions[user.transactions.length - 1]
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Withdraw funds
router.post('/withdraw', authenticateToken, async (req, res) => {
    try {
        const { amount, withdrawalType } = req.body;
        
        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }
        
        if (amount < 1000) {
            return res.status(400).json({ message: 'Minimum withdrawal is ₦1,000' });
        }
        
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check sufficient balance
        if (user.accountBalance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }
        
        // Deduct amount from balance
        user.accountBalance -= amount;
        
        // Add transaction record
        user.transactions.push({
            type: 'debit',
            amount: amount,
            description: `Withdrawal via ${withdrawalType || 'ATM'}`,
            date: new Date()
        });
        
        await user.save();
        
        res.json({
            message: 'Withdrawal successful',
            newBalance: user.accountBalance,
            transaction: user.transactions[user.transactions.length - 1]
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get savings goals
router.get('/savings', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('savings');
        res.json({ savings: user.savings || [] });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create savings goal
router.post('/savings', authenticateToken, async (req, res) => {
    try {
        const { name, goal, dueDate, category } = req.body;
        const user = await User.findById(req.user._id);
        
        if (!user.savings) user.savings = [];
        
        user.savings.push({
            name,
            goal,
            current: 0,
            dueDate,
            category: category || 'Personal'
        });
        
        await user.save();
        res.json({ message: 'Savings goal created', savings: user.savings });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get available loans
router.get('/loans', authenticateToken, async (req, res) => {
    try {
        // Return default loan offerings
        const loans = [
            { id: 1, name: 'Personal Loan', minAmount: 50000, maxAmount: 500000, interestRate: 12, duration: 24, status: 'available' },
            { id: 2, name: 'Business Loan', minAmount: 100000, maxAmount: 5000000, interestRate: 10, duration: 36, status: 'available' },
            { id: 3, name: 'Auto Loan', minAmount: 200000, maxAmount: 3000000, interestRate: 8, duration: 60, status: 'available' },
            { id: 4, name: 'Education Loan', minAmount: 50000, maxAmount: 2000000, interestRate: 9, duration: 48, status: 'available' }
        ];
        res.json({ loans });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Apply for a loan
router.post('/loans/apply', authenticateToken, async (req, res) => {
    try {
        const { loanId, amount, duration, reason } = req.body;
        if (!loanId || !amount || !duration) {
            return res.status(400).json({ message: 'Loan, amount, and duration are required' });
        }

        const loans = [
            { id: 1, name: 'Personal Loan', minAmount: 50000, maxAmount: 500000, interestRate: 12, duration: 24, status: 'available' },
            { id: 2, name: 'Business Loan', minAmount: 100000, maxAmount: 5000000, interestRate: 10, duration: 36, status: 'available' },
            { id: 3, name: 'Auto Loan', minAmount: 200000, maxAmount: 3000000, interestRate: 8, duration: 60, status: 'available' },
            { id: 4, name: 'Education Loan', minAmount: 50000, maxAmount: 2000000, interestRate: 9, duration: 48, status: 'available' }
        ];

        const selectedLoan = loans.find(l => l.id === Number(loanId));
        if (!selectedLoan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        if (amount < selectedLoan.minAmount || amount > selectedLoan.maxAmount) {
            return res.status(400).json({ message: 'Amount is out of allowed range' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.loanApplications) user.loanApplications = [];

        const application = {
            loanId: selectedLoan.id,
            loanName: selectedLoan.name,
            amount: Number(amount),
            duration: Number(duration),
            interestRate: selectedLoan.interestRate,
            reason: reason || ''
        };

        user.loanApplications.push(application);
        user.markModified('loanApplications');
        await user.save();

        res.status(201).json({ message: 'Loan application submitted', application });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get user cards
router.get('/cards', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('cards');
        res.json({ cards: user.cards || [] });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Request new card
router.post('/cards/request', authenticateToken, async (req, res) => {
    try {
        const { type } = req.body;
        const user = await User.findById(req.user._id);
        
        if (!user.cards) user.cards = [];
        
        const newCard = {
            type: type === 'virtual' ? 'Virtual' : 'Physical',
            last4: Math.floor(1000 + Math.random() * 9000).toString(),
            balance: 0,
            status: 'Active',
            issuer: type === 'virtual' ? 'Mastercard' : 'Visa',
            expiry: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${new Date().getFullYear() + 3 - 2000}`,
            color: type === 'virtual' ? '#4F46E5' : '#1434CB'
        };
        
        user.cards.push(newCard);
        await user.save();
        
        res.json({ message: 'Card request submitted', cards: user.cards });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Block card
router.patch('/cards/:id/block', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const card = user.cards.id(req.params.id);
        
        if (!card) return res.status(404).json({ message: 'Card not found' });
        
        card.status = 'Blocked';
        await user.save();
        
        res.json({ message: 'Card blocked', card });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Unblock card
router.patch('/cards/:id/unblock', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const card = user.cards.id(req.params.id);
        
        if (!card) return res.status(404).json({ message: 'Card not found' });
        
        card.status = 'Active';
        await user.save();
        
        res.json({ message: 'Card unblocked', card });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete card
router.delete('/cards/:id', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.cards) {
            return res.status(404).json({ message: 'Card not found' });
        }

        const beforeCount = user.cards.length;
        const idParam = req.params.id;
        user.cards = user.cards.filter(card => {
            const idMatch = card._id?.toString() === idParam;
            const last4Match = card.last4 === idParam;
            return !idMatch && !last4Match;
        });

        if (user.cards.length === beforeCount) {
            return res.status(404).json({ message: 'Card not found' });
        }

        await user.save();

        res.json({ message: 'Card deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Repay loan
router.post('/loans/:applicationId/repay', authenticateToken, async (req, res) => {
    try {
        const { amount } = req.body;
        const { applicationId } = req.params;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Valid repayment amount is required' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.loanApplications || user.loanApplications.length === 0) {
            return res.status(404).json({ message: 'No loan applications found' });
        }

        const applicationIndex = user.loanApplications.findIndex(
            app => app._id?.toString() === applicationId
        );

        if (applicationIndex === -1) {
            return res.status(404).json({ message: 'Loan application not found' });
        }

        const application = user.loanApplications[applicationIndex];

        if (application.status !== 'approved') {
            return res.status(400).json({ message: 'Only approved loans can be repaid' });
        }

        if (user.accountBalance < amount) {
            return res.status(400).json({ message: 'Insufficient balance for repayment' });
        }

        // Initialize repayments array if not exists
        if (!application.repayments) {
            application.repayments = [];
        }

        // Deduct amount from account
        user.accountBalance -= amount;

        // Record repayment
        const repayment = {
            amount: Number(amount),
            date: new Date(),
            remainingBalance: Math.max(0, application.amount - (application.totalRepaid || 0) - amount)
        };

        application.repayments.push(repayment);
        application.totalRepaid = (application.totalRepaid || 0) + amount;

        // Update status if fully repaid
        if (application.totalRepaid >= application.amount) {
            application.status = 'repaid';
        } else if (application.totalRepaid > 0) {
            // Mark as partial repayment if not fully repaid
            application.status = 'partial-repayment';
        }

        // Mark array as modified for Mongoose
        user.markModified('loanApplications');

        // Record transaction if transactions array exists
        if (!user.transactions) user.transactions = [];
        user.transactions.push({
            type: 'Loan Repayment',
            amount: amount,
            date: new Date(),
            description: `Repayment for ${application.loanName} loan`,
            status: 'completed'
        });

        await user.save();

        res.status(200).json({
            message: 'Loan repayment processed successfully',
            application,
            newBalance: user.accountBalance
        });
    } catch (error) {
        console.error('Loan repayment error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Approve/Reject loan application (admin or auto-approval)
router.post('/loans/:applicationId/approve', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const { applicationId } = req.params;

        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Valid status is required (approved or rejected)' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.loanApplications || user.loanApplications.length === 0) {
            return res.status(404).json({ message: 'No loan applications found' });
        }

        const applicationIndex = user.loanApplications.findIndex(
            app => app._id?.toString() === applicationId
        );

        if (applicationIndex === -1) {
            return res.status(404).json({ message: 'Loan application not found' });
        }

        const application = user.loanApplications[applicationIndex];

        // Update status
        application.status = status;
        application.approvedAt = new Date();

        // If approved, add notification
        if (status === 'approved') {
            if (!user.notifications) user.notifications = [];
            user.notifications.push({
                message: `Your ${application.loanName} loan application for ₦${application.amount.toLocaleString()} has been approved!`,
                read: false,
                createdAt: new Date()
            });
        }

        // If rejected, add notification
        if (status === 'rejected') {
            if (!user.notifications) user.notifications = [];
            user.notifications.push({
                message: `Your ${application.loanName} loan application has been rejected.`,
                read: false,
                createdAt: new Date()
            });
        }

        // Mark array as modified for Mongoose
        user.markModified('loanApplications');
        user.markModified('notifications');

        await user.save();

        res.status(200).json({
            message: `Loan application ${status} successfully`,
            application
        });
    } catch (error) {
        console.error('Loan approval error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
