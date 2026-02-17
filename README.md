# Full Bank App

A full-stack banking application built with React and Node.js/Express, featuring comprehensive banking functionalities including user authentication, transfers, transactions, bill payments, and more.

## 🌟 Features

### User Features
- 🔐 **User Authentication** - Secure signup and signin with JWT
- 💰 **Account Management** - View balance and account details
- 💸 **Money Transfer** - Send money to other users
- 📊 **Transaction History** - Track all your transactions
- 💳 **Virtual Cards** - Manage virtual debit/credit cards
- 📱 **Airtime & Data** - Purchase airtime and data bundles
- 💵 **Bill Payments** - Pay various bills directly from the app
- 🏦 **Fund Account** - Add money to your account
- 💼 **Savings** - Create and manage savings goals
- 🎯 **Loans** - Apply for and manage loans
- 🔔 **Notifications** - Stay updated with account activities
- 👤 **Profile Management** - Update your personal information
- 💬 **Support** - Get help when needed

### Technical Features
- Progressive Web App (PWA) support
- Responsive design for mobile and desktop
- Secure API with JWT authentication
- MongoDB database integration
- CORS-enabled backend

## 🛠️ Tech Stack

### Frontend
- **React** 19.1.1 - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Formik** - Form management
- **Yup** - Form validation
- **React Icons** - Icon library
- **Vite PWA Plugin** - Progressive Web App support

### Backend
- **Node.js** - Runtime environment
- **Express** 5.1.0 - Web framework
- **MongoDB/Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

## 📋 Prerequisites

Before running this application, make sure you have:
- Node.js (v14 or higher)
- npm or yarn
- MongoDB instance (local or cloud)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/ay0711/full-Bank-app.git
cd full-Bank-app
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend-bank
npm install
```

#### Configure Environment Variables
Create a `.env` file in the `backend-bank` directory with the following variables:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5555
JWT_SECRET=your_jwt_secret_key
```

#### Start the Backend Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5555`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd bank-front
npm install
```

#### Start the Development Server
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🏗️ Project Structure

```
full-Bank-app/
├── backend-bank/           # Backend application
│   ├── middleware/        # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   │   ├── auth.js      # Authentication routes
│   │   ├── banking.js   # Banking operations routes
│   │   └── opay.js      # Payment integration routes
│   ├── utils/           # Utility functions
│   ├── index.js         # Entry point
│   └── package.json     # Backend dependencies
│
└── bank-front/            # Frontend application
    ├── public/           # Static assets
    ├── src/
    │   ├── Pages/       # Page components
    │   ├── components/  # Reusable components
    │   ├── context/     # React context
    │   ├── assets/      # Images and assets
    │   ├── App.jsx      # Main app component
    │   └── main.jsx     # Entry point
    ├── vite.config.js   # Vite configuration
    └── package.json     # Frontend dependencies
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - User login

### Banking Operations
- `GET /api/banking/account` - Get account details
- `POST /api/banking/transfer` - Transfer money
- `GET /api/banking/transactions` - Get transaction history
- `POST /api/banking/fund` - Fund account
- `POST /api/banking/withdraw` - Withdraw money

### Payment Services
- `POST /api/opay/airtime` - Purchase airtime
- `POST /api/opay/data` - Purchase data
- `POST /api/opay/bills` - Pay bills

## 📦 Build for Production

### Frontend
```bash
cd bank-front
npm run build
```

The build output will be in the `dist` folder.

### Backend
The backend can be deployed as-is. Make sure to set the appropriate environment variables on your hosting platform.

## 🌐 Deployment

### Frontend
The frontend is configured for deployment on Vercel with proper routing setup.

### Backend
The backend can be deployed on any Node.js hosting platform (Heroku, Railway, Render, etc.). Update the CORS configuration in `index.js` to include your production frontend URL.

## 🔒 Security

- Passwords are hashed using bcryptjs
- JWT tokens are used for authentication
- Environment variables protect sensitive data
- CORS is configured to allow only specified origins

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC

## 👨‍💻 Author

ay0711

## 🐛 Issues

If you encounter any issues or have suggestions, please file an issue on the GitHub repository.

---

**Note**: This is a demonstration/learning project. For production use, additional security measures and testing should be implemented.
