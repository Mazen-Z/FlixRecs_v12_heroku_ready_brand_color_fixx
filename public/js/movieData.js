// movieData.js (Backend file for fetching movie info)
const axios = require('axios');


const fetchMovieData = async (movieTitle) => {
  try {
    // Step 1: Search for movie by title
    const searchResponse = await axios.get(`${TMDB_API_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: movieTitle,
      },
    });

    if (searchResponse.data.results.length === 0) {
      throw new Error('Movie not found');
    }

    const movie = searchResponse.data.results[0];
    const movieId = movie.id;

    // Step 2: Fetch detailed movie data including cast and plot
    const movieDetailsResponse = await axios.get(`${TMDB_API_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: 'credits',
      },
    });

    const movieData = movieDetailsResponse.data;
    const cast = movieData.credits.cast.slice(0, 10); // Get top 10 cast members
    const plot = movieData.overview || 'No plot available';

    return {
      title: movieData.title,
      plot: plot,
      cast: cast.map(actor => actor.name), // List of cast members
      tmdbId: movieData.id,
    };
  } catch (err) {
    console.error('Error fetching movie data from TMDB:', err);
    throw err;
  }
};
