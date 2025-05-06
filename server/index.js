require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB Connected');
  
  // Import badge utils only after successful MongoDB connection
  const { initializeBadges } = require('./utils/badgeUtils');
  
  // Initialize badges
  try {
    await initializeBadges();
    console.log('Badge initialization complete');
  } catch (error) {
    console.error('Failed to initialize badges:', error.message);
    // Continue app startup even if badge initialization fails
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if we can't connect to database
});

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/actions', require('./routes/actions'));

// Load additional routes
try {
  app.use('/api/badges', require('./routes/badges'));
  app.use('/api/community', require('./routes/community'));
  app.use('/api/journal', require('./routes/journal'));
  app.use('/api/progress', require('./routes/progress'));
  app.use('/api/info', require('./routes/info'));
} catch (error) {
  console.warn('Some routes could not be loaded:', error.message);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    msg: 'Server error' 
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// After app is defined, create a server
const server = http.createServer(app);

// Create Socket.IO server with CORS options
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict to your actual client origin
    methods: ['GET', 'POST']
  }
});

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join the community room to receive updates
  socket.join('community');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available globally
app.set('io', io);

// Update the listen call to use the HTTP server instead of app
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 