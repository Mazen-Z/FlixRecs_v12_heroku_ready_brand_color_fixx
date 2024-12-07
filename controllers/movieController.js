// movieController.js (Backend controller)
const Movie = require('../models/movie');
const fetchMovieData = require('./movieData');

const addMovie = async (req, res) => {
  const { title } = req.body;
  try {
    // Step 1: Check if movie exists in DB already
    let movie = await Movie.findOne({ title });
    if (!movie) {
      // Step 2: If movie doesn't exist, fetch from TMDB
      const movieData = await fetchMovieData(title);

      // Step 3: Create a new movie document
      movie = new Movie({
        title: movieData.title,
        plot: movieData.plot,
        cast: movieData.cast,
        tmdbId: movieData.tmdbId,
        reviews: [], // Initialize with an empty reviews array
        aggregateRating: 0, // Initialize aggregate rating
      });

      await movie.save(); // Save movie to DB
    }

    res.json(movie); // Send back movie data
  } catch (err) {
    console.error('Error adding movie:', err);
    res.status(500).json({ message: 'Error adding movie' });
  }
};
