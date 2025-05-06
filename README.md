# GreenSteps - Eco-Habit Logger & Impact Tracker

GreenSteps is a behavior-first platform that encourages eco-friendly habits through daily logging, visual environmental impact tracking, and gamified reward systems.

## Features

- 🌱 Log daily eco-habits from a predefined list
- 📊 Track environmental impact and action history
- 🏆 Earn badges and milestone streaks
- 📈 Visualize contribution data through charts
- 🌍 See global progress across all users (anonymously)

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: MongoDB

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB database

### Environment Variables

1. Create a `.env` file in the server directory:
```
MONGODB_URI=mongodb+srv://yourusername:yourpassword@yourcluster.mongodb.net/yourdatabase
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
```

2. Create a `.env` file in the client directory:
```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=GreenSteps
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/greensteps.git
cd greensteps
```

2. Install dependencies for client, server, and root
```bash
npm run install-all
```

### Running the Application

**Development mode (runs both client and server)**
```bash
npm run dev
```

**Run server only**
```bash
npm run server
```

**Run client only**
```bash
npm run client
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login a user
- GET `/api/auth/me` - Get current user

## License

ISC 