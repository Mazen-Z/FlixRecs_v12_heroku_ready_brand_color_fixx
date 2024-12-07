//////////////////////////    LOGIN ROUTES //////////////////////////////////////


const express = require('express');
const router = express.Router();
const User = require('../models/User');  // Your user model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// JWT Authentication Middleware
function authenticateJWT(req, res, next) {
  // Get token from Authorization header, ensuring it’s in the 'Bearer <token>' format
  const token = req.header('Authorization')?.split(' ')[1]; 

  // If no token is provided, send a 403 response
  if (!token) {
    return res.status(403).json({ success: false, error: 'Access denied. No token provided.' });
  }

  // Verify the JWT token
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    // If there’s an error in token verification, send a 403 response
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid token.' });
    }

    // Attach the decoded user object to the request for use in the next middleware or route handler
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  });
}







// User login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }
  
      // Check if the account is locked
      if (user.loginAttempts >= 10) {
        // Trigger password reset email
        await sendPasswordResetEmail(user.email);
  
        return res.status(403).json({
          success: false,
          error: 'Account locked. A password reset link has been sent to your email.',
        });
      }
  
      // Compare the provided password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        // Increment login attempts
        user.loginAttempts = (user.loginAttempts || 0) + 1;
        await user.save();
  
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }
  
      // Reset login attempts on successful login
      user.loginAttempts = 0;
      await user.save();
  
      // Generate a JWT token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '1h' }
      );
  
      // Respond with success, token, and user details (including firstName)
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          // You can add more fields if necessary
        },
      });
  
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });
  
  
  
  async function sendPasswordResetEmail(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
  
    // Generate the reset token
  
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  
  
    // Send the email with the reset link
    const resetUrl = `http://localhost:5001/password/reset-password/${token}`;
  
    // Create the email transporter
    const transporter = nodemailer.createTransport({
      service: 'outlook', // Example for Gmail. Replace with your email service provider
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
      },
    });
  
    // Compose the email
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender email address
      to: email, // Recipient email address
      subject: 'Password Reset Request Flix Recs',
      text: `You have reached the maximum login attempts. Use the following link to reset your password: ${resetUrl}`,
      html: `<p>You have reached the maximum login attempts.</p>
             <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`, // Optional HTML content
    };
  
    // Send the email
    await transporter.sendMail(mailOptions);
  
    console.log(`Password reset email sent to ${email}`);
  }










  module.exports = router;
