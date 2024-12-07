const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  dateJoined: {
    type: Date,
    default: Date.now,
  },
  wishlist: {
    type: [String], // Array of movie titles
    default: [],
  },
  watchedMovies: { // Corrected path to 'watchedMovies'
    type: [String], // Array of movie titles
    default: [],

  },
  loginAttempts: { type: Number, default: 0 },

  forumPosts: { 
    type: [String], // Array of a users forum posts
    default: [],

  },
  reviewPosts: {
    type: [{
      movieId: { type: String, required: true },
      content: { type: String, required: true },
      rating: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now },
      upvote: {type: Number,  default: 0 },
      downvote: {type: Number,  default: 0},
    }],
    default: [],
  },
  
  movieCreationHistory: [Date],

  username: {
    type: String,
    required: true,
    unique: true
},



  admin: { type: Number, default: 0 }, // 1 for admin, 0 for regular user
});
// Prevent overwriting the model if it already exists
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;



