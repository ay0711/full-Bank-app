const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

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
        res.json({ message: 'Profile image updated', profileImage: user.profileImage });
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

const generateAccountNumber = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
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
router.post('/Signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
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

module.exports = router;
