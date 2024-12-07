const path = require('path'); //needed to re-setting password re-reouting
const express = require('express');
const router = express.Router(); // Initialize the router
const mongoose = require('mongoose');

const User = require('./models/User');  // Your user model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const Movie = require('./models/movie'); // Ensure this import is at the top of your file
const VisitCount = require('./models/VisitCount'); // Adjust path if needed
const  login_routes = require('./routes/login_routes');     // log-in-related routes intilization
const  password_resets_routes = require('./routes/password_resets_routes');// password reset related routes intilization
const  registration_routes = require('./routes/registration_routes');     // registration related routes intilization
const  review_page_routes = require('./routes/review_page_routes');     // reviewpage-related routes intilization
const dashboard_routes  = require('./routes/dashboard_routes'); // dashboard -related routes intilization





require('dotenv').config(); // This loads environment variables from .env


//loads TMDB_API_KEY via .env
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const app = express();

module.exports = { TMDB_API_KEY };

app.get('/api/config', (req, res) => {
  res.json({ TMDB_API_KEY });
});







// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html', 'index.html'));
});




// Enable CORS for all origins (you can modify it to restrict specific domains)
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// MongoDB URI (Use environment variable for sensitive information)
const mongoURI = process.env.MONGO_URI; // Access your MongoDB URI securely

// Connect to MongoDB using the URI
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));



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

module.exports = { authenticateJWT }; // Export the middleware
module.exports = router;
//routes for specific paths (api routes are included within some of them)
app.use('/dashboard', dashboard_routes); // Movie review-related routes /
app.use('/login', login_routes);     // log-in-related routes//
app.use('/password',password_resets_routes);// password reset related routes
app.use('/register', registration_routes);     // registration related routes
app.use('/review',review_page_routes);     // reviewpage-related routes







// Route to increment visit count and return the updated count
app.get('/api/increment-visit', async (req, res) => {
  try {
      // Find the visit count entry in the database (assuming one document in the collection)
      let visitRecord = await VisitCount.findOne();

      if (!visitRecord) {
          // If no record exists, create a new one
          visitRecord = new VisitCount({ count: 1 });
          await visitRecord.save();
      } else {
          // Increment the count
          visitRecord.count += 1;
          await visitRecord.save();
      }

      // Return the updated visit count
      res.json({ visitCount: visitRecord.count });
  } catch (error) {
      console.error('Error incrementing visit count:', error);
      res.status(500).json({ error: 'Failed to increment visit count' });
  }
});







// Add a default value for a new attribute to all existing users
async function addNewAttributeToUsers() {
  //remember to always update schema beforehand!
try {
  await User.updateMany({}, { $set: { reviewPosts: null} }); // Add new attribute
  console.log('Successfully added  attribute to all users');
} catch (error) {
  console.error('Error updating users:', error);
}
}


//addNewAttributeToUsers();

// Remove  attribute to all existing users

async function deleteAttributeFromUsers() {
//remember to always update schema afterwards!
try {
  await User.updateMany({}, { $unset: { username: "" } }); // Completely remove 'username' field from all users
  console.log('Successfully removed "username" attribute from all users');
} catch (error) {
  console.error('Error removing attribute from users:', error);
}
}

//deleteAttributeFromUsers()




// Start the server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});