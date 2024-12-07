const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Movie = require('../models/movie'); // Ensure this import is at the top of your file
const User = require('../models/User');  // Your user model


const TMDB_API_KEY = '16e4e4574bcc6f330c994c49b3fc18e4';
const BASE_URL = 'https://api.themoviedb.org/3';




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

const axios = require('axios'); // Import axios for making API requests

// Route to handle searching for a movie
router.get('/api/searchMovie', async (req, res) => {
  const { title, tmdbId } = req.query;

  if (!title && !tmdbId) {
    return res.status(400).json({ message: 'No search parameters provided.' });
  }

  try {
    let movie;
    
    // First try to find the movie in MongoDB by title or tmdbId
    if (title) {
      const sanitizedTitle = title.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&'); // Sanitize the title
      movie = await Movie.findOne({ 
        $or: [
          { title: { $regex: new RegExp(`^${sanitizedTitle}$`, 'i') } },
          { tmdbId }
        ]
      });
    } else if (tmdbId) {
      movie = await Movie.findOne({ tmdbId });
    }

    // If the movie is not found in MongoDB, search on TMDB
    if (!movie && title) {
      const searchResponse = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`);
      const searchData = await searchResponse.json();

      if (!searchData.results || searchData.results.length === 0) {
        return res.status(404).json({ message: 'No movies found for the given title.' });
      }

      const movieData = searchData.results[0]; // Take the first result

      // Check if the movie exists in the database by TMDB ID
      movie = await Movie.findOne({ tmdbId: movieData.id });

      if (!movie) {
        // Fetch movie details from TMDB
        const detailsResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieData.id}?api_key=${TMDB_API_KEY}&append_to_response=credits`);
        const detailsData = await detailsResponse.json();

        const cast = detailsData.credits?.cast?.slice(0, 10).map(actor => actor.name) || [];

        // Create and save a new movie entry
        const movieDetails = {
          title: movieData.title,
          plot: movieData.overview || 'No plot available.',
          cast, // Top 10 cast
          tmdbId: movieData.id,
          reviews: [],
          aggregateRating: 0,
        };

        movie = new Movie(movieDetails);
        await movie.save();
        console.log(`New movie created: ${movieData.title}`);
      } else {
        console.log(`Movie already exists in database by TMDB ID: ${movieData.title}`);
      }
    }

    // Return the movie data
    res.json({ movies: [movie] });
  } catch (err) {
    console.error('Error fetching movie:', err);
    res.status(500).json({ message: 'Error fetching movie data' });
  }
});

router.get('/api/getMovieById', async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'No movie ID provided.' });
  }

  try {
    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    res.json(movie);
  } catch (err) {
    console.error('Error fetching movie:', err);
    res.status(500).json({ message: 'Error fetching movie data.' });
  }
});






router.post('/api/addReview', authenticateJWT, async (req, res) => {
  const { movieId, userId, content, rating } = req.body;

  // Validate input fields
  if (!movieId || !userId || !content || rating == null) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  try {
    // Ensure movieId and userId are strings
    const movieIdStr = String(movieId);
    const userIdStr = String(userId);

    // Ensure rating is an integer
    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
      return res.status(400).json({ success: false, message: 'Invalid rating value. Must be between 1 and 10.' });
    }

    // Find the movie by its ID
    const movie = await Movie.findById(movieIdStr);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    // Fetch the username from the users collection based on the userId (_id)
    const user = await User.findById(userIdStr);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Construct the review object
    const newReview = {
      movieId: movieIdStr,
      userId: userIdStr,
      userName: user.username, // Store the username, not the ID
      content,
      rating: ratingNum, // Ensure rating is an integer
      timestamp: new Date().toISOString(),
      upvote: 0, // Default upvotes to 0
      downvote: 0, // Default downvotes to 0
    };

    // Add the new review to the movie's reviews array
    movie.reviews = movie.reviews || []; // Initialize the reviews array if it's not defined
    movie.reviews.push(newReview);

    // Save the updated movie document
    await movie.save();

    // Now push the full review object into the reviewPosts array in the User collection
    user.reviewPosts = user.reviewPosts || []; // Initialize reviewPosts array if not defined
    user.reviewPosts.push(newReview); // Store the full review object
    await user.save();

    res.status(200).json({ success: true, message: 'Review added successfully.' });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ success: false, message: 'Error adding review.' });
  }
});



const { ObjectId } = mongoose.Types;

router.delete('/api/deleteReview', authenticateJWT, async (req, res) => {
  const { reviewId, movieId } = req.body;
  const userId = req.user?.id; // Extract from token

  if (!reviewId || !movieId || !userId) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  try {
      // Convert IDs to ObjectId
      const movieIdObj = new ObjectId(movieId);
      const reviewIdObj = new ObjectId(reviewId);
      const userIdObj = new ObjectId(userId);

      // Fetch the movie document
      const movie = await Movie.findById(movieIdObj);
      if (!movie) {
          return res.status(404).json({ success: false, message: 'Movie not found.' });
      }

      // Locate the review in the movie's reviews array
      const review = movie.reviews.find((r) => r._id.equals(reviewIdObj));
      if (!review || !new ObjectId(review.userId).equals(userIdObj)) {
          console.log("Review userId:", review?.userId);
          console.log("Current userId:", userId);
          return res.status(403).json({ success: false, message: 'Unauthorized to delete this review.' });
      }

      // Remove the review from the movie's reviews array
      movie.reviews = movie.reviews.filter((r) => !r._id.equals(reviewIdObj));
      await movie.save();

      // Match and delete the review in the user's reviewPosts by comparing attributes
      const result = await User.updateOne(
          { _id: userIdObj },
          {
              $pull: {
                  reviewPosts: {
                      movieId: movieIdObj.toString(),
                      content: review.content,
                      rating: review.rating, // Include all identifying attributes to ensure a match
                  },
              },
          }
      );

      // Check if the review was actually removed
      if (result.modifiedCount === 0) {
          console.log("Review details:", review);
          return res.status(404).json({ success: false, message: 'Review not found in user profile.' });
      }

      res.status(200).json({ success: true, message: 'Review deleted successfully from both collections.' });
  } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ success: false, message: 'Error deleting review.' });
  }
});


module.exports = router;

