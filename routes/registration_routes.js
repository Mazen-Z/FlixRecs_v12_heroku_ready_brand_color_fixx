
const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../app'); // Adjust path if app.js is in the same directory
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');  // Your user model

// User registration route
router.post('/register', async (req, res) => { 
    const { firstName, lastName, username, email, password } = req.body;
  
    // Validate input
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }
  
    try {
      // Check if username or email already exists
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        const errorMessage = existingUser.email === email ? 'Email already taken' : 'Username already taken';
        return res.status(400).json({ success: false, error: errorMessage });
      }
  
      // Hash the password before saving the user
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user
      const newUser = new User({
        firstName,
        lastName,
        username, // Include username
        email,
        password: hashedPassword,
      });
  
      // Save the new user to the database
      await newUser.save();
      res.status(201).json({ success: true, message: 'User registered successfully' });
  
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: 'Error saving user' });
    }
  });
  module.exports = router;