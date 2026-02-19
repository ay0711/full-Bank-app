# Bank Frontend

This is the React frontend for the Full Bank app. It provides authentication, dashboard analytics, transfers, transactions, and account management screens.

## Requirements

- Node.js 18 or later
- Backend API running or deployed

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a .env file:

   ```bash
   VITE_API_URL=https://full-bank-app.onrender.com
   ```

   For local backend:

   ```bash
   VITE_API_URL=http://localhost:5555
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

## Key Features

- Sign up, sign in, and password recovery
- Dashboard with analytics and quick transfer
- Transfer money between accounts
- Transaction history and details
- Bills, airtime, and data flows
- User profile and settings

## Project Structure

- src/Pages: main pages (Dashboard, Transfer, Transactions, etc.)
- src/components: reusable UI components
- src/utils: API helpers and utilities

## Notes

- The API base URL is controlled by VITE_API_URL in .env
- The .env file is ignored by git; use .env.example as a template
