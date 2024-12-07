
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Your user model
const path = require('path'); //needed to re-setting password re-reouting
const bcrypt = require('bcryptjs');


module.exports = sendEmail;
module.exports = router;

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





router.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
  
    try {
        const user = await User.findOne({ email });
  
        if (!user) {
            return res.status(404).json({ message: 'No user found with this email address' });
        }
  
        // Create a reset token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  
        // Send the email with the reset link
        const resetUrl = `http://localhost:5001/password/reset-password/${token}`;
  
  
        await sendEmail(email, 'Password Reset Request', `To reset your password, click the following link: ${resetUrl}`);
  
        res.status(200).json({ message: 'Password reset email sent!' });
    } catch (error) {
        console.error('Error processing reset password request:', error);
        res.status(500).json({ message: 'Error sending password reset email' });
    }
  });






//route to  bring a user to the reset password page
router.get('/reset-password/:token', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public','html','reset-password.html'));
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









  
  //route which verifys a user's token if good, they will be able to change their password.
  router.post('/api/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
  
    try {
        // Verify token and decode it
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
        // Find the user by ID from the decoded token
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
  
        // Hash the new password before saving
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        user.password = hashedPassword;
  
        // Reset login attempts after successful password change
        user.loginAttempts = 0;
  
        await user.save();
  
        // Send success response
        res.status(200).json({ message: 'Password successfully updated head! Head back to the log in page to sign in !' });
    } catch (error) {
        // Handle specific JWT errors
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(400).json({ message: 'Token has expired' });
        }
  
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({ message: 'Invalid token' });
        }
  
        // Log other errors and send a general response
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'An error occurred while resetting password' });
    }
  });
  
  
  
  router.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
  
    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
        // Find the user by the decoded user ID
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
  
        // Update the user's password
        user.password = bcrypt.hashSync(newPassword, 10);
        await user.save();
  
        res.status(200).json({ message: 'Password successfully updated, head back to the hompage to log in!' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(400).json({ message: 'Invalid or expired token' });
    }
  });
  
  
  
   // sendEmail function
   async function sendEmail(to, subject, text) {
    const transporter = nodemailer.createTransport({
        service: 'outlook', // Use Outlook 
        auth: {
            user: process.env.EMAIL_USER, // Your email address
            pass: process.env.EMAIL_PASS  // Your email password
        }
    });
  
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    };
  
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email: ', error);
        throw new Error('Email sending failed');
    }
  }

  



