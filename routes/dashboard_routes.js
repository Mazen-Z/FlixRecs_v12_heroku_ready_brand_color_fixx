
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Your user model


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

const TMDB_API_KEY = '16e4e4574bcc6f330c994c49b3fc18e4';
const TMDB_API_URL = 'https://api.themoviedb.org/3';


router.get('/dashboard', authenticateJWT, (req, res) => {
    // Assuming `req.user` contains the authenticated user data
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
  
    // Fetch the user's data from the database (e.g., MongoDB)
    const userId = req.user.id;
    // Assuming you have a User model to fetch the user details
    User.findById(userId)
      .then(user => {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.json({ success: true, user });
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Error fetching user data' });
      });
  });
  
  
  
  // Add to Wishlist Route (POST)
  router.post('/api/wishlist', async (req, res) => {
    const { userId, movieTitle } = req.body;
  
    if (!userId || !movieTitle) {
        return res.status(400).json({ success: false, error: 'Missing userId or movieTitle' });
    }
  
    try {
        const user = await User.findById(userId);
  
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
  
        // Add movie to wishlist if not already present
        if (!user.wishlist.includes(movieTitle)) {
            user.wishlist.push(movieTitle);
            await user.save();
            return res.status(200).json({ success: true, message: 'Movie added to wishlist' });
        }
  
        return res.status(400).json({ success: false, error: 'Movie already in wishlist' });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });
  
  
  
  // Remove from Wishlist Route via. movie card
  router.delete('/api/wishlist2', async (req, res) => {
    const { userId, movieTitle } = req.body;
  
    if (!userId || !movieTitle) {
        return res.status(400).json({ success: false, error: 'Missing userId or movieTitle' });
    }
  
    try {
        const user = await User.findById(userId);
  
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
  
        // Remove movie from wishlist if present
        const movieIndex = user.wishlist.indexOf(movieTitle);
        if (movieIndex !== -1) {
            user.wishlist.splice(movieIndex, 1);
            await user.save();
            return res.status(200).json({ success: true, message: 'Movie removed from wishlist' });
        }
  
        return res.status(400).json({ success: false, error: 'Movie not in wishlist' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });
  
  
  
  // Remove from Wishlist  dashboard.
  router.delete('/api/wishlist', async (req, res) => {
    const { userId, movieTitle } = req.body;
  
    if (!userId || !movieTitle) {
        return res.status(400).json({ success: false, error: 'Missing userId or movieTitle' });
    }
  
    try {
        const user = await User.findById(userId);
  
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
  
        // Remove movie from wishlist if present
        const movieIndex = user.wishlist.indexOf(movieTitle);
        if (movieIndex !== -1) {
            user.wishlist.splice(movieIndex, 1);
            await user.save();
            return res.status(200).json({ success: true, message: 'Movie removed from wishlist' });
        }
  
        return res.status(400).json({ success: false, error: 'Movie not in wishlist' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });
  
  
  
  
  // Remove from watched movies from  dashboard.
  router.delete('/api/watched/remove', async (req, res) => {
    const { userId, movieTitle } = req.body;
  
    if (!userId || !movieTitle) {
        return res.status(400).json({ success: false, error: 'Missing userId or movieTitle' });
    }
  
    try {
        const user = await User.findById(userId);
  
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
  
        // Remove movie from wishlist if present
        const movieIndex = user.watchedMovies.indexOf(movieTitle);
        if (movieIndex !== -1) {
            user.watchedMovies.splice(movieIndex, 1);
            await user.save();
            return res.status(200).json({ success: true, message: 'Movie removed from already watched ' });
        }
  
        return res.status(400).json({ success: false, error: 'Movie not in already ' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });
  
  
  
  // Add Movie to Watched list route
  router.post('/add-movie-to-watched', async (req, res) => {
    const { title } = req.body; // Movie title sent in the request body
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from the 'Authorization' header
  
    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }
  
    try {
        // Verify JWT and extract user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const userId = decoded.id;
  
        // Find the user by ID and add the movie to their watchedMovies list
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
  
        // Ensure movie is not already in the watched list
        if (!user.watchedMovies.includes(title)) {
            user.watchedMovies.push(title);
            await user.save();  // Save the updated user document
            return res.status(200).json({ success: true, message: 'Movie added to watched list' });
        } else {
            return res.status(400).json({ success: false, error: 'Movie already in watched list' });
        }
    } catch (error) {
        console.error('Error adding movie to watched list:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });
  
  
  
  // Endpoint to remove movie from watched list and wishlist
  router.post('/remove-movie', async (req, res) => {
    const { title } = req.body;
    const { id } = req.user; // Assuming the user is authenticated and their ID is in the JWT
  
    if (!title) {
      return res.status(400).json({ success: false, error: 'Movie title is required' });
    }
  
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
  
      // Remove the movie from the watchedMovies array if it exists
      if (user.watchedMovies.includes(title)) {
        user.watchedMovies = user.watchedMovies.filter(movie => movie !== title);
      }
  
      // Remove the movie from the wishlist array if it exists
      if (user.wishlist.includes(title)) {
        user.wishlist = user.wishlist.filter(movie => movie !== title);
      }
  
      // Save the updated user data to the database
      await user.save();
  
      res.status(200).json({ success: true, message: 'Movie removed from both watched list and wishlist' });
    } catch (error) {
      console.error('Error removing movie:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });
  
  
  // Update Movie in Watched
  router.post('/update-movie-in-watched', authenticateJWT, async (req, res) => {
      const { oldTitle, newTitle } = req.body;
      const userId = req.user.id;  // User ID attached by authenticateJWT
  
      try {
          const user = await User.findById(userId);
          if (!user) {
              return res.status(404).json({ success: false, error: 'User not found' });
          }
  
          const index = user.moviesWatched.indexOf(oldTitle);
          if (index === -1) {
              return res.status(404).json({ success: false, error: 'Movie not found in watched list' });
          }
  
          // Update the movie in the watched list
          user.moviesWatched[index] = newTitle;
          await user.save();
          res.json({ success: true, message: 'Movie updated in watched list.' });
      } catch (error) {
          console.error('Error updating movie in watched:', error);
          res.status(500).json({ success: false, error: 'Internal server error' });
      }
    })
  
   
  
  //movies watched count?
  // Protect your route with the authentication middleware
  router.get('/api/getMoviesWatchedCount', authenticateJWT, async (req, res) => {
    try {
      console.log("GOOOOOOOD 2");
      
      // Ensure that req.user is properly populated by the middleware
      const userId = req.user._id; // Extract the user ID from the request (authenticated user)
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID not found in token' });
      }
  
      const user = await User.findById(userId);
  
      if (user) {
        // Fetch the length of 'moviesWatched' or correct field name
        const watchedMoviesCount = user.moviesWatched // Adjust based on actual field name
        res.json({ watchedMoviesCount });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (err) {
      console.error("Error fetching movie count:", err); // Log the error to the console for debugging
      res.status(500).json({ message: 'Error fetching movie count', error: err.message });
    }
  });
  
  module.exports = router;
  // Route to remove a movie from wishlist dashboard
  router.post('/remove-movie-from-wishlist', async (req, res) => {
    const { title } = req.body; // Get the movie title from the request body
    const token = req.headers['authorization']; // Get the token from headers
  
    // Handle the logic for removing the movie from the wishlist
    try {
      if (!token) {
        return res.status(400).json({ error: 'No authorization token provided' });
      }
  
      const decoded = jwt_decode(token.replace('Bearer ', '')); // Decode the token to get the user info
      const userId = decoded.id; // Assuming the user ID is stored in the token
  
      // Implement your logic to remove the movie for this user from the wishlist
      const movieRemoved = await removeMovieFromUserWishlist(userId, title);
  
      if (movieRemoved) {
        return res.json({ success: true });
      } else {
        return res.status(404).json({ error: 'Movie not found in wishlist' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  });
  
  
  router.get('/api/watchedMovies/status', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
  
        const movieTitle = req.query.movieTitle; // Assuming movieTitle is a query parameter
        const isInWatched = user.watchedMovies.includes(movieTitle);
  
        res.json({ isInWatched });
    } catch (error) {
        console.error('Error checking watched status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  
  // POST route to add/remove a movie from the watched list
  router.post('/api/watchedMovies', authenticateJWT, async (req, res) => {
    const { movieTitle } = req.body;
    const userId = req.user._id; // User ID from JWT
  
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const movieIndex = user.watchedMovies.indexOf(movieTitle);
  
      if (movieIndex === -1) {
        // Add the movie if not already in the watched list
        user.watchedMovies.push(movieTitle);
        await user.save();
        return res.status(200).json({ message: 'Movie added to watched list' });
      } else {
        // Remove the movie if already in the watched list
        user.watchedMovies.splice(movieIndex, 1);
        await user.save();
        return res.status(200).json({ message: 'Movie removed from watched list' });
      }
    } catch (error) {
      console.error('Error toggling watched status:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
  const fetch = require('node-fetch'); // Ensure you have node-fetch installed
  

  
  
  
  
  
  // Function to fetch the genre map from TMDB
  async function fetchGenreMap() {
    const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    if (data.genres) {
        return data.genres.reduce((map, genre) => {
            map[genre.id] = genre.name; // Map genre ID to genre name
            return map;
        }, {});
    }
    return {};
  }
  
  // Function to fetch genres for a list of movie titles
  async function getGenresFromTitles(titles) {
    const genreMap = await fetchGenreMap(); // Fetch and initialize the genre map
    const genreCount = {};
  
    for (const title of titles) {
        try {
            // Fetch movie data by title
            const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`);
            const data = await response.json();
  
            if (data.results && data.results.length > 0) {
                const movie = data.results[0]; // Take the first result
                const genreIds = movie.genre_ids || [];
  
                // Map genre IDs to names and count occurrences
                genreIds.forEach(id => {
                    const genreName = genreMap[id];
                    if (genreName) {
                        genreCount[genreName] = (genreCount[genreName] || 0) + 1;
                    }
                });
  
                console.log(`Genres for "${title}":`, genreIds.map(id => genreMap[id] || 'Unknown'));
            } else {
                console.warn(`No results found for title "${title}"`);
            }
        } catch (error) {
            console.error(`Error fetching genres for title "${title}":`, error);
        }
    }
  
    // Log the aggregated genre count for debugging purposes
    console.log('Aggregated Genre Count:', genreCount);
  
    return genreCount;
  }
  
  // Function to get the most common genre from the user's movies
  
  router.get('/api/userData/randomMovies/:userId', authenticateJWT, async (req, res) => {
    try {
      const userId = req.params.userId || req.user.id;  // Default to `req.user.id` if `userId` is not passed
  
        // Fetch the user's data (including watched and wishlist movies)
        const user = await User.findById(userId);
        if (!user || (!user.watchedMovies && !user.wishlist) || (user.watchedMovies.length === 0 && user.wishlist.length === 0)) {
            return res.status(400).json({ message: "No movies found for this user." });
        }
  
        // Combine watched and wishlist movies
        const movieTitles = [...user.watchedMovies, ...user.wishlist];
  
        // Fetch genres for all movies
        const genreCount = await getGenresFromTitles(movieTitles);
  
        // Find the most common genre
        let mostCommonGenre = '';
        let maxCount = 0;
  
        for (const [genre, count] of Object.entries(genreCount)) {
            if (count > maxCount) {
                mostCommonGenre = genre;
                maxCount = count;
            }
        }
  
        // If no common genre is found
        if (!mostCommonGenre) {
            return res.status(400).json({ message: "No common genre found for the user." });
        }
  
        // Return the most common genre to the frontend
        res.status(200).json({ mostCommonGenre });
  
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: "Error fetching user data." });
    }
  });
  
  
  
  
  // Utility function to get random movies
  function getRandomMovies(movieList, maxCount) {
    const shuffledMovies = movieList.sort(() => 0.5 - Math.random());
    return shuffledMovies.slice(0, maxCount);
  }
  
  
  // Route to get the logged-in user's data
  router.get('/api/user', authenticateJWT, async (req, res) => {
    try {
        // Use req.user.id to fetch the correct user from the database
        const user = await User.findById(req.user.id);  // Fetch the user by the ID decoded from the JWT
  
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
  
        res.json({ userId: user._id, userName: user.name });  // Send back relevant user info
  
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching user data', error: err.message });
    }
  });
  
  
  
  module.exports = router;