const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Action = require('../models/Action');
const User = require('../models/User');
const Badge = require('../models/Badge');
const mongoose = require('mongoose');


router.get('/my-actions', auth, async (req, res) => {
    try {
      const userId = req.user._id;
  
      // Find all actions where the user field matches the current user
      const actions = await Action.find({ user: userId }).sort({ date: -1 }); // optional: sort by latest
  
      res.json(actions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  