const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { sendTransactionEmail } = require('../utils/emailService');

// Helper function to categorize transactions
function categorizeTransaction(description) {
    const desc = description.toLowerCase();
    if (desc.includes('food') || desc.includes('restaurant') || desc.includes('dining')) return 'Food & Dining';
    if (desc.includes('shop') || desc.includes('store') || desc.includes('purchase')) return 'Shopping';
    if (desc.includes('transport') || desc.includes('uber') || desc.includes('taxi') || desc.includes('fuel')) return 'Transportation';
    if (desc.includes('bill') || desc.includes('utility') || desc.includes('electricity') || desc.includes('water')) return 'Bills & Utilities';
    if (desc.includes('entertainment') || desc.includes('movie') || desc.includes('game')) return 'Entertainment';
    if (desc.includes('health') || desc.includes('hospital') || desc.includes('medical')) return 'Healthcare';
    if (desc.includes('education') || desc.includes('school') || desc.includes('course')) return 'Education';
    if (desc.includes('transfer')) return 'Transfer';
    if (desc.includes('loan')) return 'Loan';
    if (desc.includes('withdraw')) return 'Withdrawal';
    return 'Others';
}

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
            category: 'Transfer',
            date: new Date()
        };

        const recipientTransaction = {
            type: 'credit',
            amount: amount,
            description: description || `Transfer from ${sender.firstName} ${sender.lastName}`,
            senderAccountNumber: sender.accountNumber,
            category: 'Transfer',
            date: new Date()
        };

        sender.transactions.push(senderTransaction);
        recipient.transactions.push(recipientTransaction);

        // Add notifications for both users
        if (!sender.notifications) sender.notifications = [];
        if (!recipient.notifications) recipient.notifications = [];
        
        sender.notifications.push({
            message: `Transfer of ₦${amount.toLocaleString('en-NG')} sent to ${recipient.firstName} ${recipient.lastName}`,
            read: false,
            createdAt: new Date()
        });

        recipient.notifications.push({
            message: `Received ₦${amount.toLocaleString('en-NG')} from ${sender.firstName} ${sender.lastName}`,
            read: false,
            createdAt: new Date()
        });

        sender.markModified('notifications');
        recipient.markModified('notifications');

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

        // Add notification
        if (!user.notifications) user.notifications = [];
        user.notifications.push({
            message: `Account funded with ₦${amount.toLocaleString('en-NG')} via ${paymentMethod}`,
            read: false,
            createdAt: new Date()
        });
        user.markModified('notifications');
        
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

        // Add notification
        if (!user.notifications) user.notifications = [];
        user.notifications.push({
            message: `Withdrawn ₦${amount.toLocaleString('en-NG')} via ${withdrawalType || 'ATM'}`,
            read: false,
            createdAt: new Date()
        });
        user.markModified('notifications');
        
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
        const user = await User.findById(req.user._id);
        
        // Calculate credit info
        const creditScore = user?.creditScore || 500;
        const loanLimit = user?.loanLimit || 50000;
        
        // Check for active loans
        const activeLoans = user?.loanApplications?.filter(loan => 
            loan.status === 'pending' || 
            (loan.status === 'approved' && loan.totalRepaid < loan.amount) ||
            loan.status === 'partial-repayment'
        ) || [];
        
        // Return default loan offerings
        const loans = [
            { id: 1, name: 'Personal Loan', minAmount: 50000, maxAmount: Math.min(500000, loanLimit), interestRate: 12, duration: 24, status: 'available' },
            { id: 2, name: 'Business Loan', minAmount: 100000, maxAmount: Math.min(5000000, loanLimit), interestRate: 10, duration: 36, status: 'available' },
            { id: 3, name: 'Auto Loan', minAmount: 200000, maxAmount: Math.min(3000000, loanLimit), interestRate: 8, duration: 60, status: 'available' },
            { id: 4, name: 'Education Loan', minAmount: 50000, maxAmount: Math.min(2000000, loanLimit), interestRate: 9, duration: 48, status: 'available' }
        ];
        
        res.json({ 
            loans,
            creditScore,
            loanLimit,
            hasActiveLoan: activeLoans.length > 0,
            activeLoansCount: activeLoans.length
        });
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

        // Check for active loans (pending or approved but not fully repaid)
        const activeLoans = user.loanApplications.filter(loan => 
            loan.status === 'pending' || 
            (loan.status === 'approved' && loan.totalRepaid < loan.amount) ||
            loan.status === 'partial-repayment'
        );

        if (activeLoans.length > 0) {
            return res.status(400).json({ 
                message: 'You have an active loan. Please repay your existing loan before applying for a new one.',
                activeLoans: activeLoans.length
            });
        }

        // Calculate credit score if not set
        if (!user.creditScore) {
            user.creditScore = 500; // Default starting score
        }

        // Calculate loan limit based on credit score, account balance, and transaction history
        const baseLimit = 50000;
        const balanceFactor = Math.min(user.accountBalance * 0.5, 500000); // Max 50% of balance, capped at 500k
        const scoreFactor = ((user.creditScore - 300) / 550) * 500000; // Score contributes up to 500k
        const calculatedLimit = Math.floor(baseLimit + balanceFactor + scoreFactor);
        
        user.loanLimit = Math.min(calculatedLimit, 5000000); // Cap at 5M

        // Check if requested amount exceeds loan limit
        if (amount > user.loanLimit) {
            return res.status(400).json({ 
                message: `Loan amount exceeds your limit of ₦${user.loanLimit.toLocaleString('en-NG')}. Your credit score: ${user.creditScore}/850`,
                loanLimit: user.loanLimit,
                creditScore: user.creditScore,
                requestedAmount: amount
            });
        }

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

        res.status(201).json({ 
            message: 'Loan application submitted successfully',
            application,
            creditScore: user.creditScore,
            loanLimit: user.loanLimit
        });
    } catch (error) {
        console.error('Loan application error:', error);
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
        let { amount } = req.body;
        const { applicationId } = req.params;

        // Convert amount to number and validate
        amount = Number(amount);
        if (!amount || isNaN(amount) || amount <= 0) {
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

        // Allow repayment for approved and partially repaid loans
        if (application.status !== 'approved' && application.status !== 'partial-repayment') {
            return res.status(400).json({ message: 'Only approved or partially repaid loans can be repaid' });
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
            amount: amount,
            date: new Date(),
            remainingBalance: Math.max(0, application.amount - (application.totalRepaid || 0) - amount)
        };

        application.repayments.push(repayment);
        application.totalRepaid = (application.totalRepaid || 0) + amount;

        // Update status if fully repaid
        if (application.totalRepaid >= application.amount) {
            application.status = 'repaid';
            
            // Increase credit score on successful loan repayment
            const currentScore = user.creditScore || 500;
            const scoreIncrease = Math.min(20, Math.floor(application.amount / 10000)); // Up to 20 points based on loan size
            user.creditScore = Math.min(850, currentScore + scoreIncrease);
            
            // Recalculate loan limit
            const baseLimit = 50000;
            const balanceFactor = Math.min(user.accountBalance * 0.5, 500000);
            const scoreFactor = ((user.creditScore - 300) / 550) * 500000;
            user.loanLimit = Math.min(Math.floor(baseLimit + balanceFactor + scoreFactor), 5000000);
        } else if (application.totalRepaid > 0) {
            // Mark as partial repayment if not fully repaid
            application.status = 'partial-repayment';
        }

        console.log(`✅ Loan repayment processed:`, {
            loanName: application.loanName,
            amount,
            totalRepaid: application.totalRepaid,
            loanAmount: application.amount,
            newStatus: application.status,
            remainingBalance: application.amount - application.totalRepaid
        });

        // Mark array as modified for Mongoose
        user.markModified('loanApplications');

        // Record transaction if transactions array exists
        if (!user.transactions) user.transactions = [];
        user.transactions.push({
            type: 'debit',
            amount: amount,
            category: 'Loan',
            date: new Date(),
            description: `Repayment for ${application.loanName} loan`
        });

        // Add notification
        if (!user.notifications) user.notifications = [];
        try {
            const statusMsg = application.status === 'repaid' ? 'fully repaid' : 'partial payment made';
            const formattedAmount = typeof amount === 'number' ? amount.toLocaleString('en-NG') : amount;
            user.notifications.push({
                message: `Loan repayment of ₦${formattedAmount} processed for ${application.loanName} (${statusMsg})`,
                read: false,
                createdAt: new Date()
            });
            user.markModified('notifications');
        } catch (notifError) {
            console.warn('Notification error:', notifError);
            // Continue saving even if notification fails
        }

        await user.save();

        res.status(200).json({
            message: 'Loan repayment processed successfully',
            application,
            newBalance: user.accountBalance
        });
    } catch (error) {
        console.error('Loan repayment error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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

        // If approved, add loan amount to user balance and create transaction
        if (status === 'approved') {
            // Add loan amount to user's account balance
            user.accountBalance += application.amount;

            // Add transaction record
            if (!user.transactions) user.transactions = [];
            user.transactions.push({
                type: 'credit',
                category: 'Loan',
                amount: application.amount,
                description: `${application.loanName} loan disbursement`,
                date: new Date()
            });

            // Add notification
            if (!user.notifications) user.notifications = [];
            user.notifications.push({
                message: `Your ${application.loanName} loan of ₦${application.amount.toLocaleString()} has been approved and credited to your account!`,
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
        user.markModified('transactions');

        await user.save();

        res.status(200).json({
            message: `Loan application ${status} successfully`,
            application,
            newBalance: user.accountBalance
        });
    } catch (error) {
        console.error('Loan approval error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
