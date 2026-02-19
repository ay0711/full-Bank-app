const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    accountNumber: {
        type: String,
        unique: true,
        required: true
    },
    accountBalance: {
        type: Number,
        default: 0
    },
    accountType: {
        type: String,
        enum: ['Standard', 'Premium', 'Business'],
        default: 'Standard'
    },
    profileImage: {
        type: String,
        default: ''
    },
    notificationPrefs: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true }
    },
    privacy: {
        hideBalance: { type: Boolean, default: false },
        hideAccountNumber: { type: Boolean, default: false }
    },
    theme: {
        accent: { type: String, default: '#00C853' },
        fontSize: { type: Number, default: 16 }
    },
    limits: {
        daily: { type: Number, default: 0 },
        weekly: { type: Number, default: 0 }
    },
    accessibility: {
        highContrast: { type: Boolean, default: false },
        textSize: { type: Number, default: 16 }
    },
    appSettings: {
        darkMode: { type: Boolean, default: false },
        language: { type: String, default: 'en' },
        quickLogin: { type: Boolean, default: false }
    },
    kyc: {
        status: { type: String, default: 'unverified' },
        idImage: { type: String, default: '' }
    },
    transactions: [{
        type: {
            type: String,
            enum: ['credit', 'debit'],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        recipientAccountNumber: String,
        senderAccountNumber: String
    }],
    savings: [{
        name: { type: String, required: true },
        goal: { type: Number, required: true },
        current: { type: Number, default: 0 },
        dueDate: { type: Date },
        category: { type: String, default: 'Personal' },
        createdAt: { type: Date, default: Date.now }
    }],
    cards: [{
        type: { type: String, enum: ['Virtual', 'Physical', 'virtual', 'physical'], required: true },
        last4: { type: String, required: true },
        balance: { type: Number, default: 0 },
        status: { type: String, enum: ['Active', 'Blocked', 'active', 'blocked'], default: 'Active' },
        issuer: { type: String, default: 'Mastercard' },
        expiry: { type: String },
        color: { type: String, default: '#4F46E5' },
        createdAt: { type: Date, default: Date.now }
    }],
        notifications: [{
            message: String,
            read: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
        }],
        supportRequests: [{
            subject: String,
            message: String,
            status: { type: String, enum: ['open', 'closed'], default: 'open' },
            createdAt: { type: Date, default: Date.now }
        }],
        twoFA: {
            enabled: { type: Boolean, default: false },
            secret: { type: String, default: '' }
        },
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
