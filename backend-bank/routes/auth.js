const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
// Get all notifications
router.get('/notification', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ notifications: user.notifications || [] });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark notification as read
router.put('/notification/:id/read', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const notification = user.notifications.id(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        notification.read = true;
        await user.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a notification
router.delete('/notification/:id', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const notification = user.notifications.id(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        notification.deleteOne();
        await user.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all support requests
router.get('/support', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ supportRequests: user.supportRequests || [] });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new support request
router.post('/support', authenticateToken, async (req, res) => {
    try {
        const { subject, message } = req.body;
        if (!subject || !message) return res.status(400).json({ message: 'Subject and message are required' });
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.supportRequests.push({ subject, message });
        await user.save();
        res.json({ success: true, supportRequests: user.supportRequests });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Close a support request
router.put('/support/:id/close', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const support = user.supportRequests.id(req.params.id);
        if (!support) return res.status(404).json({ message: 'Support request not found' });
        support.status = 'closed';
        await user.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


// Get notification preferences
router.get('/notification-prefs', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ prefs: user.notificationPrefs || { email: true, sms: false, push: true } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get privacy settings
router.get('/privacy', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ privacy: user.privacy || { hideBalance: false, hideAccountNumber: false } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get theme settings
router.get('/theme', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ theme: user.theme || { accent: '#00C853', fontSize: 16 } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get transaction limits
router.get('/limits', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ limits: user.limits || { daily: 0, weekly: 0 } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get accessibility settings
router.get('/accessibility', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ accessibility: user.accessibility || { highContrast: false, textSize: 16 } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Update app settings
router.put('/app-settings', authenticateToken, async (req, res) => {
    try {
        const { darkMode, language, quickLogin } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.appSettings = {
            darkMode: typeof darkMode === 'boolean' ? darkMode : user.appSettings.darkMode,
            language: language || user.appSettings.language,
            quickLogin: typeof quickLogin === 'boolean' ? quickLogin : user.appSettings.quickLogin
        };
        await user.save();
        res.json({ success: true, settings: user.appSettings });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Get app settings
router.get('/app-settings', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ settings: user.appSettings || { darkMode: false, language: 'en', quickLogin: false } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


// Update profile image
router.put('/profile-image', authenticateToken, async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ message: 'No image provided' });
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.profileImage = image;
        await user.save();
        res.json({ 
            message: 'Profile image updated', 
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                accountNumber: user.accountNumber,
                accountBalance: user.accountBalance,
                accountType: user.accountType,
                profileImage: user.profileImage
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update KYC info
router.put('/kyc', authenticateToken, async (req, res) => {
    try {
        const { idImage } = req.body;
        if (!idImage) return res.status(400).json({ message: 'No ID image provided' });
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.kyc.idImage = idImage;
        user.kyc.status = 'pending';
        await user.save();
        res.json({ message: 'KYC submitted', kyc: user.kyc });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/emailService');

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

const generateAccountNumber = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateRandomBalance = () => {
    return Math.floor(Math.random() * (50000 - 1000 + 1)) + 1000;
};

router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        let accountNumber;
        let isUnique = false;
        while (!isUnique) {
            accountNumber = generateAccountNumber();
            const existingAccount = await User.findOne({ accountNumber });
            if (!existingAccount) {
                isUnique = true;
            }
        }
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountNumber,
            accountBalance: generateRandomBalance()
        });

        await newUser.save();


        try {
            await sendWelcomeEmail(email, firstName, accountNumber);
        } catch (emailError) {
            // Email sending failed silently
        }
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'Server configuration error' });
        }

        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                accountNumber: newUser.accountNumber,
                accountBalance: newUser.accountBalance
            }
        });

    } catch (error) {
        
        // Handle specific MongoDB errors
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email or account number already exists' });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: validationErrors.join(', ') });
        }
        
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Sign in route
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                accountNumber: user.accountNumber,
                accountBalance: user.accountBalance
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Lookup user by account number
router.get('/user/:accountNumber', authenticateToken, async (req, res) => {
    try {
        const { accountNumber } = req.params;
        
        if (!accountNumber || accountNumber.length !== 10) {
            return res.status(400).json({ message: 'Invalid account number' });
        }

        const user = await User.findOne({ accountNumber });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                accountNumber: user.accountNumber
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get list of users (for quick transfer, limit to 10)
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const users = await User.find({ _id: { $ne: req.user._id } })
            .select('firstName lastName accountNumber accountType')
            .limit(limit);
        
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Upgrade account type
router.post('/upgrade-account', authenticateToken, async (req, res) => {
    try {
        const { accountType } = req.body;
        
        if (!['Standard', 'Premium', 'Business'].includes(accountType)) {
            return res.status(400).json({ message: 'Invalid account type' });
        }
        
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if already on this tier or higher
        const tierHierarchy = { 'Standard': 0, 'Premium': 1, 'Business': 2 };
        const currentTier = tierHierarchy[user.accountType || 'Standard'];
        const requestedTier = tierHierarchy[accountType];
        
        if (requestedTier <= currentTier) {
            return res.status(400).json({ 
                message: 'You are already on this tier or higher' 
            });
        }
        
        // Define upgrade costs
        const upgradeCosts = {
            'Premium': 4999,   // From Standard to Premium
            'Business': 9999   // From Standard/Premium to Business
        };
        
        let upgradeCost = 0;
        if (accountType === 'Premium' && user.accountType === 'Standard') {
            upgradeCost = upgradeCosts.Premium;
        } else if (accountType === 'Business') {
            // If upgrading from Standard to Business, charge Business price
            // If upgrading from Premium to Business, charge difference
            if (user.accountType === 'Standard') {
                upgradeCost = upgradeCosts.Business;
            } else if (user.accountType === 'Premium') {
                upgradeCost = upgradeCosts.Business - upgradeCosts.Premium; // 5000
            }
        }
        
        // Check if user has sufficient balance
        if (upgradeCost > 0 && user.accountBalance < upgradeCost) {
            return res.status(400).json({ 
                message: `Insufficient balance. ₦${upgradeCost.toLocaleString('en-NG')} required for upgrade.`,
                required: upgradeCost,
                current: user.accountBalance
            });
        }
        
        // Deduct upgrade cost and update account type
        if (upgradeCost > 0) {
            user.accountBalance -= upgradeCost;
            
            // Add transaction record
            user.transactions.push({
                type: 'debit',
                amount: upgradeCost,
                description: `Account upgrade to ${accountType}`,
                date: new Date()
            });
        }
        
        user.accountType = accountType;
        await user.save();
        
        res.json({ 
            message: `Account upgraded successfully to ${accountType}!`,
            upgradeCost,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                accountNumber: user.accountNumber,
                accountBalance: user.accountBalance,
                accountType: user.accountType,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Forgot password - send OTP
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email' });
        }
        
        // Generate OTP
        const otp = generateOTP();
        
        // Store OTP with 10 minute expiry
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
        });
        
        // In production, send OTP via email
        // For now, log it (REMOVE IN PRODUCTION)
        console.log(`OTP for ${email}: ${otp}`);
        
        res.json({ 
            message: 'OTP sent to your email',
            // REMOVE IN PRODUCTION - only for testing
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }
        
        // Check if OTP exists
        const storedOTP = otpStore.get(email);
        if (!storedOTP) {
            return res.status(400).json({ message: 'No OTP found. Please request a new one' });
        }
        
        // Check if OTP expired
        if (Date.now() > storedOTP.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ message: 'OTP expired. Please request a new one' });
        }
        
        // Verify OTP
        if (storedOTP.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        
        // Mark OTP as verified
        otpStore.set(email, {
            ...storedOTP,
            verified: true
        });
        
        res.json({ message: 'OTP verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        // Check if OTP was verified
        const storedOTP = otpStore.get(email);
        if (!storedOTP || !storedOTP.verified) {
            return res.status(400).json({ message: 'Please verify OTP first' });
        }
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Update password
        user.password = hashedPassword;
        await user.save();
        
        // Clear OTP
        otpStore.delete(email);
        
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update profile (firstName, lastName, phoneNumber)
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber } = req.body;
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        
        await user.save();
        
        res.json({ 
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                accountNumber: user.accountNumber,
                accountBalance: user.accountBalance,
                accountType: user.accountType,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        if (error.message.includes('Invalid phone number format')) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Verify phone number
router.post('/verify-phone', authenticateToken, async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        
        if (!phoneNumber) {
            return res.status(400).json({ message: 'Phone number is required' });
        }
        
        // Validate phone format
        const phoneRegex = /^\+?(\d{1,3})?[-.\s]?(\d{1,4})[-.\s]?(\d{1,4})[-.\s]?(\d{1,9})$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }
        
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Generate OTP for phone verification
        const otp = generateOTP();
        otpStore.set(`phone_${user._id}`, { otp, phoneNumber, expiresAt: Date.now() + 10 * 60 * 1000 });
        
        // In production, send SMS with OTP
        console.log(`Phone verification OTP for ${phoneNumber}: ${otp}`);
        
        res.json({ 
            message: 'OTP sent to phone number',
            // For development, return OTP (remove in production)
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying phone' });
    }
});

// Confirm phone verification with OTP
router.post('/confirm-phone-verification', authenticateToken, async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const otpData = otpStore.get(`phone_${user._id}`);
        
        if (!otpData) {
            return res.status(400).json({ message: 'No pending phone verification' });
        }
        
        if (otpData.expiresAt < Date.now()) {
            otpStore.delete(`phone_${user._id}`);
            return res.status(400).json({ message: 'OTP has expired' });
        }
        
        if (otpData.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        
        // Update phone and mark as verified
        user.phoneNumber = otpData.phoneNumber;
        user.phoneVerified = true;
        await user.save();
        
        otpStore.delete(`phone_${user._id}`);
        
        res.json({ 
            message: 'Phone verified successfully',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                phoneVerified: user.phoneVerified,
                accountNumber: user.accountNumber
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error confirming phone verification' });
    }
});

module.exports = router;
