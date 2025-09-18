const express = require('express')
const app = express ()
require('dotenv').config()
const cors = require('cors')
app.use(cors({
    origin: [
        'https://full-bank-app.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    credentials: true
}))
const mongoURI = process.env.MONGO_URI
const port = process.env.PORT || 5555
const mongoose = require('mongoose')
app.use(express.json());
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/auth');
const bankingRoutes = require('./routes/banking');
const opayRoutes = require('./routes/opay');


app.use('/api/auth', authRoutes);
app.use('/api/banking', bankingRoutes);
app.use('/api/opay', opayRoutes);

mongoose.connect(mongoURI)
    .then(() => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });


app.get('/', (req, res) => {
    res.json({ message: 'SecureBank API is running!' });
});

// Health check endpoint for backend wake-up detection
app.get('/api/auth/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        message: 'Backend is healthy and running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
})