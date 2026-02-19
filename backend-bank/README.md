# Bank Backend

This is the Node.js and Express backend for the Full Bank app. It provides authentication, banking operations, bills, and account management APIs.

## Requirements

- Node.js 18 or later
- MongoDB database

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a .env file:

   ```bash
   PORT=5555
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email_address
   EMAIL_PASS=your_email_app_password
   ```

3. Start the server:

   ```bash
   node index.js
   ```

## API Overview

- Auth: /api/auth
- Banking: /api/banking
- Bills: /api/bills
- OPay: /api/opay

## Notes

- The frontend reads API base URL from VITE_API_URL
- Configure CORS origins in index.js to allow your frontend
