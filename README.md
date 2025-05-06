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

**Authentication:**
- JWT-based secure auth
- bcrypt for password hashing

**Hosting:**
- Vercel (Frontend)
- Render (Backend API)
- MongoDB Atlas (Database)


## 🚀 Core Features (MVP)

### ✅ 1. Daily Eco-Action Logging
- Fixed list of eco-habits:
  - Carpooling
  - Reused Container
  - Skipped Meat
  - Used Public Transport
  - No-Plastic Day
  - Others (Custom)
- Users can:
  - Check off actions once per day
  - Add optional notes
  - Logs are date-stamped and immutable

### 📊 2. Impact Calculation & Visualization
- Habits have eco-points (e.g., Skipped Meat = 2 pts)
- Display:
  - Daily/weekly points
  - Total carbon saved (mock)
  - Line chart of daily eco-points
  - Pie chart of most frequent habits

### 🏆 3. Badges & Streaks
- Auto-award:
  - Streak Badges (e.g., 7-day log streak)
  - Milestone Badges (e.g., 100 pts earned)
  - Category Hero (e.g., Used Public Transport 15 times)
- Show:
  - Active streak counter
  - Badge cabinet (locked/unlocked)
  - Animations for unlocks

### 🌍 4. Global Community View
- Total actions logged across all users
- Most common habit this week
- Top 10 users (by points, usernames/initials only)
- All stats are anonymous and read-only

### 📔 5. Impact Journal
- Timeline of past actions
- Points per day + reflection notes
- Click a date to view full breakdown

### 🎨 6. UI Enhancements
- Gamified animations (e.g., badge unlocks)
- Real-time points counter on dashboard
- Mobile-optimized design
- Eco-friendly theme (greens, earth tones)

### 🧪 Additional Notes
- All logs are immutable after submission
- Points, streaks, and badges are auto-calculated from real activity
- Global stats are securely queried and anonymized
- Dynamic and persistent data updates




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
git clone https://github.com/ProActive44/Greensteps01.git
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
cd server
npm run server
```

**Run client only**
```bash
cd client
npm run client
```