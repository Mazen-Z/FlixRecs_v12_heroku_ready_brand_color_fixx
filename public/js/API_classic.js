






// Global variables for speech synthesis state
let currentUtterance = null;
let isSpeaking = false;

let selectedVoice = null;

// Ensure voices are loaded and select the voice
function fetchVoices() {
  const voices = window.speechSynthesis.getVoices();
  
  // Ensure that voices are loaded
  if (voices.length === 0) {
    // Wait for voices to be loaded if they aren't already
    speechSynthesis.onvoiceschanged = function () {
      const voices = speechSynthesis.getVoices();
      selectedVoice = voices.find((voice) => voice.name === 'Google UK English Male' && voice.lang === 'en-GB');
    }}}

// Call the function to fetch voices
fetchVoices();

window.speechSynthesis.onvoiceschanged = fetchVoices;

// Helper function to create and manage speech utterance
function createUtterance(plotText, onEndCallback) {
  const utterance = new SpeechSynthesisUtterance(plotText);
  utterance.voice = selectedVoice;
  utterance.lang = "en-US";
  utterance.pitch = 1;
  utterance.rate = 1;

  // Clean up when speech ends
  utterance.onend = () => {
    isSpeaking = false;
    currentUtterance = null;
    if (onEndCallback) onEndCallback();
  };

  utterance.onerror = (error) => {
    console.error("SpeechSynthesis error:", error);
    isSpeaking = false;
    currentUtterance = null;
    if (onEndCallback) onEndCallback();
  };

  return utterance;
}

function toggleReadPlot(button, plot) {
  const synth = window.speechSynthesis;

  // Stop any ongoing speech
  if (synth.speaking || synth.paused) {
    synth.cancel();
  }

  // Handle empty or undefined plot
  if (!plot || plot.trim() === '') {
    console.error('No plot content to read.');
    return;
  }

  if (button.classList.contains('reading')) {
    // If already reading, stop
    button.classList.remove('reading');
    button.textContent = 'Read Plot';
    synth.cancel();
  } else {
    // Start reading
    button.classList.add('reading');
    button.textContent = 'Pause';

    const utterance = new SpeechSynthesisUtterance(plot);

    // Configure voice and options
    utterance.rate = 1; // Normal rate
    utterance.pitch = 1; // Normal pitch

    utterance.onend = () => {
      // Reset button state when speech ends
      button.classList.remove('reading');
      button.textContent = 'Read Plot';
    };

    utterance.onerror = (e) => {
      console.error('SpeechSynthesis error:', e);
      button.classList.remove('reading');
      button.textContent = 'Read Plot';
    };

    synth.speak(utterance);
  }
}







// Function to hide search results
function hideSearchResults() {
  const searchResults = document.getElementById('search-results');
  if (searchResults) {
    searchResults.style.display = 'none'; // Hides the search results
  }
}

// Function to hide filter results and title
async function  hideFilterResults() {
  const filterResults = document.getElementById('filtered-results');
  const filterTitle =  document.getElementById('filtered-results-title');
  if (filterResults) {
    filterResults.style.display = 'none'; // Hides the filter results
    filterTitle.style.display = 'none'; // Hides the filter results
  }
}

// Function to show the Prediction Content
function showPredictionContent() {
  const predictionContent = document.getElementById('Prediction-Content-id');
  if (predictionContent) {
    predictionContent.style.display = ''; // Default display (e.g., block or flex)
  }
}

// Function to hide the Prediction Content
function hidePredictionContent() {
  const predictionContent = document.getElementById('Prediction-Content-id');
  if (predictionContent) {
    predictionContent.style.display = 'none'; // Hides the element
  }
}



// Function to read the plot out loud
function readPlot(plotText) {
  const utterance = new SpeechSynthesisUtterance(plotText);
  window.speechSynthesis.speak(utterance);
}

function createMovieCard({ movie, cast = [], trailerUrl = null, platforms = [], truncatedPlot = '' }) {
  const movieCard = document.createElement('div');
  movieCard.classList.add('movie-card');
  
  const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'default-poster.jpg';
  
  // Insert HTML structure for the movie card with the "Watch Trailer" button and a duplicate button
  movieCard.innerHTML = `
    <img src="${posterUrl}" alt="${movie.title}" class="movie-poster">
    <div class="movie-details">
      <h3 class="movie-title">${movie.title}</h3>
      <p class="movie-release-date">${movie.release_date}</p>
      <p class="movie-plot">${truncatedPlot || movie.overview}</p>
      <div class="movie-cast">
        <strong>Cast:</strong> ${cast.join(', ')}
      </div>
      <div class="movie-platforms">
        ${platforms.length > 0 ? `<strong>Available on:</strong> ${platforms.join(', ')}` : '<p>No streaming platforms available.</p>'}
      </div>
      ${trailerUrl ? `<a href="${trailerUrl}" target="_blank">Watch Trailer</a>` : ''}
      
      <!-- Duplicate of the Watch Trailer Button -->
      <button class="duplicate-button">Duplicate Watch Trailer Button</button>
    </div>
  `;

  // Check the movie card's HTML structure to confirm if the button is added
  console.log('Movie Card HTML:', movieCard.innerHTML);

  // Add event listener to the duplicate button for testing
  const duplicateButton = movieCard.querySelector('.duplicate-button');
  if (duplicateButton) {
    duplicateButton.addEventListener('click', () => {
      console.log('Duplicate button clicked for movie:', movie.title);
    });
  }

  return movieCard;
}


document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.getElementById('splash-screen').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
  }, 3000);
});

function toggleDropdown() {
  const dropdown = document.getElementById('genre-dropdown');
  const moviesButton = document.getElementById('movies-button');

  if (dropdown.style.display === 'flex') {
    dropdown.style.display = 'none';
  } else {
    dropdown.style.display = 'flex';

    const rect = moviesButton.getBoundingClientRect();
    dropdown.style.top = `${rect.bottom}px`;
    dropdown.style.left = `${rect.left}px`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('genre-dropdown');
    const menuItem = document.querySelector('#movies-button');

    if (!menuItem || !dropdown) return; // Check if elements exist

    if (!menuItem.contains(event.target) && !dropdown.contains(event.target)) {
      dropdown.style.display = 'none';
    }
  });
});


async function fetchMovies(url, containerId) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    const container = document.getElementById(containerId);

    // Clear previous results
    container.innerHTML = '';

    // Set the container to display movies horizontally
    container.style.display = 'flex';
    container.style.flexWrap = 'nowrap'; // Prevent wrapping
    container.style.overflowX = 'auto'; // Enable horizontal scroll
    container.style.padding = '10px'; // Optional padding for aesthetic

    // Populate the movie cards
    data.results.forEach(async (movie) => {
      const truncatedPlot = movie.overview && movie.overview.length > 150 
        ? `${movie.overview.slice(0, 150)}...` 
        : movie.overview || 'Plot not available';

      const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title)}+trailer`;

      // Fetch the movie cast
      const cast = await getMovieCast(movie.id);

      // Fetch the platforms
      const platforms = await getStreamingPlatforms(movie.id);

      const movieCard = createMovieCard({ movie, cast, trailerUrl, platforms, truncatedPlot });

      container.appendChild(movieCard);
    });
  } catch (error) {
    console.error("Error fetching movies:", error);
  }
}

// Toggle the plot's visibility
function togglePlot(movieId, fullPlot) {
  const plotElement = document.getElementById(`plot-${movieId}`);
  const button = document.getElementById(`show-more-${movieId}`);
  
  if (plotElement.innerHTML.includes('Show More')) {
    plotElement.innerHTML = `<strong>Plot:</strong> ${fullPlot}`;
    button.textContent = 'Show Less';
  } else {
    plotElement.innerHTML = `<strong>Plot:</strong> ${fullPlot.slice(0, 150)}...`;
    button.textContent = 'Show More';
  }
}

// Open the trailer in a new tab
function openTrailer(url) {
  window.open(url, '_blank');
}

// Fetch the movie cast
async function getMovieCast(movieId) {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    const castMembers = data.cast.slice(0, 4); // Get the first 4 cast members

    let castHTML = castMembers.map(member => member.name).join(', '); // Join cast names with commas
    return castHTML || 'No cast information available.';
  } catch (error) {
    console.error("Error fetching movie cast:", error);
    return 'No cast information available.';
  }
}

// Fetch streaming platforms for a movie
async function getStreamingPlatforms(movieId) {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    const platforms = data.results?.US?.flatrate || [];
    return getPlatformNames(platforms);
  } catch (error) {
    console.error("Error fetching streaming platforms:", error);
    return "<p>No streaming platforms available.</p>";
  }
}

// Format the platform names without logos
function getPlatformNames(platforms) {
  let platformNamesHTML = '';
  if (platforms.length > 0) {
    platformNamesHTML = '<strong>Available on:</strong><span style="font-size: 14px;">';
    platforms.forEach((platform, index) => {
      platformNamesHTML += `${platform.provider_name}${index < platforms.length - 1 ? ', ' : ''}`;
    });
    platformNamesHTML += '</span>';
  } else {
    platformNamesHTML = '<p>No streaming platforms available.</p>';
  }
  return platformNamesHTML;
}





// Fetch the API key dynamically
fetch('/api/config')
    .then(response => response.json())
    .then(config => {
        const TMDB_API_KEY = config.TMDB_API_KEY; // Extract the key from the response

        // Define the TMDB API URL base
        const TMDB_API_URL = 'https://api.themoviedb.org/3';

        // Call fetchMovies with dynamic API key
        fetchMovies(`${TMDB_API_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`, 'new-streaming-movies');
        fetchMovies(`${TMDB_API_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`, 'new-in-theaters');
        fetchMovies(`${TMDB_API_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=35`, 'family-laughs');
        fetchMovies(`${TMDB_API_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`, 'top-picks');
    })
    .catch(err => console.error('Failed to fetch API config:', err));


//----------------------- SEARCH/FILTER Configurations---------------------------//
document.querySelector('.search-button').addEventListener('click', async () => {
  hidePredictionContent()
  hideFilterResults()
 
  const query = document.querySelector('.search-bar').value.trim();

  if (query) {
    hideFilterResults();

    // Fetch the API key dynamically from the backend
    fetch('/api/config')
        .then(response => response.json())
        .then(config => {
            const TMDB_API_KEY = config.TMDB_API_KEY; // Extract the key from the response
            const TMDB_API_URL = 'https://api.themoviedb.org/3'; // TMDB base URL

            // Construct the search URL with the fetched API key
            const searchUrl = `${TMDB_API_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`;
            
            // Fetch search results
            fetchMovies(searchUrl, 'search-results'); // Separate div for search results
        })
        .catch(err => console.error('Failed to fetch API config:', err));
} else {
    alert("Please enter a movie title to search.");
}
});


document.querySelector('.apply-filters-button').addEventListener('click', async () => {
  hidePredictionContent()
  const genre = document.querySelector('#genre-select').value;
  const year = document.querySelector('#year-input').value;
  const rating = document.querySelector('#rating-input').value;

  // Construct API URL with the filters
// Fetch the API key dynamically
fetch('/api/config')
.then(response => response.json())
.then(async config => {
  const TMDB_API_KEY = config.TMDB_API_KEY; // Extract the API key from the response
  const TMDB_API_URL = 'https://api.themoviedb.org/3'; // TMDB base URL

  // Construct the filter URL with optional query parameters
  let filterUrl = `${TMDB_API_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
  if (genre) filterUrl += `&with_genres=${genre}`;
  if (year) filterUrl += `&primary_release_year=${year}`;
  if (rating) filterUrl += `&vote_average.gte=${rating}`;

  // Fetch filtered results
  await fetchFilteredResults(filterUrl); // Ensure this function is called within scope

  // Hide search results when filters are applied
  const searchResults = document.getElementById('search-results');
  const searchResultsTitle = document.getElementById('search-results-title');
  const filteredResults = document.getElementById('filtered-results');
  const filteredResultsTitle = document.getElementById('filtered-results-title');

  if (searchResults) searchResults.style.display = 'none';
  if (searchResultsTitle) searchResultsTitle.style.display = 'none';
  if (filteredResults) filteredResults.style.display = 'flex';
  if (filteredResultsTitle) filteredResultsTitle.style.display = 'block';
})
.catch(err => console.error('Failed to fetch API config:', err));
});


// Filter search movie card
async function fetchFilteredResults(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    const filteredContainer = document.getElementById('filtered-results');

    // Clear previous results
    filteredContainer.innerHTML = '';

    // Populate the filtered results
    if (data.results.length > 0) {
      data.results.forEach(async (movie) => {
        const movieItem = document.createElement('div');
        movieItem.classList.add('movie-item');

        const truncatedPlot = movie.overview && movie.overview.length > 150
          ? `${movie.overview.slice(0, 150)}...`
          : movie.overview || 'Plot not available';

        const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title)}+trailer`;

        // Store the full plot text for later toggle
        const fullPlot = movie.overview || '';

        // Fetch the movie cast
        const cast = await getMovieCast(movie.id);

        // Fetch streaming platforms
        const platforms = await getStreamingPlatforms(movie.id);

        // Sanitize movie title for use as ID
        const sanitizedTitle = movie.title.replace(/\s+/g, '-').toLowerCase();

        // Check if the movie is already in the wishlist
        const isInWishlist = await checkWishlistStatus(movie.title);

        // Movie card content
        movieItem.innerHTML = `
          <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
          <div class="movie-info">
            <div class="rating-star">⭐ ${movie.vote_average.toFixed(1)}</div>
          </div>
          <h3>${movie.title}</h3>

          <div class="cast-container" style="padding-top: 10px;">
            <strong>Cast:</strong> ${cast}
          </div>

          <div class="plot-container">
            <p id="plot-${movie.id}" class="plot"><strong>Plot:</strong> ${truncatedPlot}</p>
          </div>
          ${movie.overview && movie.overview.length > 150 ? ` 
            <div class="button-container">
              <button id="show-more-${movie.id}" class="show-more">Show More</button>
              <button id="read-plot-${movie.id}" class="read-plot">Read Plot</button>
            </div>
          ` : ''}

          <div class="trailer-container">
            <button class="trailer-button" onclick="openTrailer('${trailerUrl}')">
              Watch Trailer
            </button>
          </div>

          <div class="wishlist-container" style="margin-bottom: 15px;">
            <button id="wishlist-button-${sanitizedTitle}" class="wishlist-button" 
                    style="font-size: 1.2em;" onclick="toggleWishlist('${movie.title}', '${sanitizedTitle}')">
              ${isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          <div class="platforms-container" style="border: 1px solid #ccc; padding: 10px; border-radius: 5px; overflow-y: auto;">
            ${platforms}
          </div>
        `;

        filteredContainer.appendChild(movieItem);

        // Ensure a minimum height for movie card to avoid squishing
        movieItem.style.minHeight = '350px'; // Adjust this value based on the desired minimum height for the card

        // Check and handle the wishlist button after it has been added to the DOM
        const wishlistButton = movieItem.querySelector(`#wishlist-button-${sanitizedTitle}`);
        if (wishlistButton) {
          // If the button exists, add an event listener to it
          wishlistButton.textContent = isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist';
        } else {
          console.error('Wishlist button not found for movie:', movie.title);
        }

        // Event listener for Show More button
        if (movie.overview && movie.overview.length > 150) {
          const showMoreButton = movieItem.querySelector(`#show-more-${movie.id}`);
          showMoreButton.addEventListener('click', () => togglePlot(movie.id, fullPlot));
        }

        // Event listener for Read Plot button (text-to-speech)
        const readPlotButton = movieItem.querySelector(`#read-plot-${movie.id}`);
        if (readPlotButton) {
          readPlotButton.addEventListener('click', () => toggleReadPlot(readPlotButton, fullPlot));
        }
      });
    } else {
      filteredContainer.innerHTML = '';
      alert('No results found for the selected filters.');
    }
  } catch (error) {
    console.error('Error fetching filtered results:', error);
  }
}







// main-content/regular seach movie cards
async function fetchMovies(url, containerId) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    const container = document.getElementById(containerId);

    // Clear previous results
    container.innerHTML = '';

    // Create a new container for search results if it doesn't exist
    if (!container) {
      const newContainer = document.createElement('div');
      newContainer.id = containerId; // Set the container's ID
      document.body.appendChild(newContainer);
    }

    // Logic for arranging movies side by side (carousel style)
    container.style.display = 'flex';
    container.style.flexWrap = 'nowrap'; // Prevent wrap to keep the carousel format

    // Populate the search results
    if (data.results.length > 0) {
      data.results.forEach(async (movie) => {
        const movieItem = document.createElement('div');
        movieItem.classList.add('movie-item');

        const truncatedPlot = movie.overview && movie.overview.length > 150
          ? `${movie.overview.slice(0, 150)}...`
          : movie.overview || 'Plot not available';

        const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title)}+trailer`;

        // Store the full plot text for later toggle
        const fullPlot = movie.overview || '';

        // Fetch the movie cast
        const cast = await getMovieCast(movie.id);

        // Fetch streaming platforms
        const platforms = await getStreamingPlatforms(movie.id);

        // Sanitize movie title for use as ID
        const sanitizedTitle = movie.title.replace(/\s+/g, '-').toLowerCase();

        // Check if movie is already in the wishlist
        const isInWishlist = await checkWishlistStatus(movie.title);

        // Check if movie is already watched
        const isWatched = await checkWatchedStatus(movie.title);

        // Movie card content
        movieItem.innerHTML = `
  <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
  <div class="movie-info">
    <div class="rating-star">⭐ ${movie.vote_average.toFixed(1)}</div>
  </div>
  <h3>${movie.title}</h3>

  <div class="cast-container" style="padding-top: 10px;">
    <strong>Cast:</strong> ${cast}
  </div>

  <div class="plot-container">
    <p id="plot-${movie.id}" class="plot"><strong>Plot:</strong> ${truncatedPlot}</p>
  </div>
  ${movie.overview && movie.overview.length > 150 ? `
    <div class="button-container">
      <button id="show-more-${movie.id}" class="show-more">Show More</button>
      <button id="read-plot-${movie.id}" class="read-plot">Read Plot</button>
    </div>
  ` : ''}

  <div class="trailer-container" style="margin-bottom: 10px;">
    <button class="trailer-button" onclick="openTrailer('${trailerUrl}')">
      Watch Trailer
    </button>
  </div>

  <div class="wishlist-container" style="margin-bottom: 15px;">
    <button id="wishlist-button-${sanitizedTitle}" class="wishlist-button" 
            style="font-size: 1.2em;" onclick="toggleWishlist('${movie.title}', '${sanitizedTitle}')">
      ${isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
    </button>
  </div>

  <div class="watched-container" style="margin-bottom: 15px;">
    <!-- Normal "Already Watched?" button -->
    <button id="watched-button-${sanitizedTitle}" class="watched-button" 
            style="font-size: 1em; padding: 5px 10px; background-color: red; color: white;" 
            onclick="toggleWatched('${movie.title}', '${sanitizedTitle}')">
      ${isWatched ? 'Remove from Watched' : 'Already Watched?'}
    </button>
  </div>

  <div class="platforms-container" style="border: 1px solid #ccc; padding: 10px; border-radius: 5px; overflow-y: auto;">
    ${platforms}
  </div>
`;

        container.appendChild(movieItem);

        // Ensure a minimum height for movie card to avoid squishing
        movieItem.style.minHeight = '350px'; // Adjust this value based on the desired minimum height for the card

        // Event listener for Show More button
        if (movie.overview && movie.overview.length > 150) {
          const showMoreButton = movieItem.querySelector(`#show-more-${movie.id}`);
          showMoreButton.addEventListener('click', () => togglePlot(movie.id, fullPlot));
        }

        // Event listener for Read Plot button (text-to-speech)
        const readPlotButton = movieItem.querySelector(`#read-plot-${movie.id}`);
        if (readPlotButton) {
          readPlotButton.addEventListener('click', () => toggleReadPlot(readPlotButton, fullPlot));
        }
      });
    } else {
      container.innerHTML = '';
      alert('No results found for the search query. Try utilizing A.I. Search');
    }
  } catch (error) {
    console.error('Error fetching search results:', error);
  }
}

// Utility function to check if the JWT token is valid
function isTokenValid() {
  const token = localStorage.getItem('token');
  if (!token) {
    return false; // No token found
  }

  try {
    const decoded = jwt_decode(token); // Decode the JWT token
    const currentTime = Date.now() / 1000; // Get the current timestamp
    if (decoded.exp < currentTime) {
      return false; // Token is expired
    }
    return true; // Token is valid
  } catch (error) {
    console.error('Invalid token:', error);
    return false; // Invalid token format
  }
}

// Function to check if the token is valid
function isTokenValid() {
  const token = localStorage.getItem('token');
  if (!token) return false; // No token means not logged in
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the JWT token
    return payload.exp > Date.now() / 1000; // Check if the token is expired
  } catch (e) {
    return false; // Invalid token
  }
}
async function toggleWatched(movieTitle, sanitizedTitle) {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('You need to be logged in to mark movies as watched');
    return;
  }

  // Decode the JWT token to get the userId
  const decoded = jwt_decode(token);  // Decode the token using jwt-decode library
  const userId = decoded.id;

  const button = document.getElementById(`watched-button-${sanitizedTitle}`);
  if (!button) {
    console.error('Watched button not found');
    return;
  }

  // Check if the movie is in the watched list
  const isInWatched = await checkWatchedStatus(movieTitle);

  try {
    const response = await fetch('http://localhost:5001/dashboard/api/watchedMovies', {
      method: isInWatched ? 'POST' : 'DELETE',  // POST for adding, DELETE for removing
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ movieTitle })
    });

    if (response.ok) {
      // Update button text and state
      button.textContent = isInWatched ? 'Already Watched?' : 'Remove from Watched';
      button.style.backgroundColor = isInWatched ? '#6C757D' : '#28A745';  // Grey for default, green for watched
    } else {
      //modify alert to something else, if un-able to fix issue by production.
      console.error('Error toggling watched status');
      alert('An error occurred while updating the watched status.',error)
    }
  } catch (error) {
    console.error('Error toggling watched status:', + error);
    alert('An error occurred while updating the watched status. (Still in Beta Phase, So Not Functional At This Time. Head To Dashboard To Add Titles Manually)');
  }
}

// Helper function to check if the movie is in the watched list
async function checkWatchedStatus(movieTitle) {
  const token = localStorage.getItem('token');
  if (!token) return false;

  // Decode the JWT token to get the userId
  const decoded = jwt_decode(token);  // Decode the token using jwt-decode library
  const userId = decoded.id;

  try {
    const response = await fetch(`http://localhost:5001/dashboard/api/watchedMovies/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data.watchedMovies.includes(movieTitle);
  } catch (error) {
    console.error('Error checking watched status:', error);
    return false;
  }
}

// Wishlist Functions

async function toggleWishlist(movieTitle, sanitizedTitle) {
  const token = localStorage.getItem('token');  // Retrieve token from localStorage

  if (!token) {
    alert("You need to be signed in to add movies to your wishlist.");
    return;
  }

  // Decode the JWT token to get the userId
  const decoded = jwt_decode(token);  // Decode the token using jwt-decode library
  const userId = decoded.id;  // Assuming the token has an 'id' field for the user ID

  const button = document.getElementById(`wishlist-button-${sanitizedTitle}`);
  if (!button) {
    console.error('Wishlist button not found');
    return;
  }

  const isInWishlist = button.textContent === 'Remove from Wishlist';

  try {
    const response = await fetch('http://localhost:5001/dashboard/api/wishlist2', {
      method: isInWishlist ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId, movieTitle })
    });

    if (response.ok) {
      // Update button text and color
      button.textContent = isInWishlist ? 'Add to Wishlist' : 'Remove from Wishlist';
      button.style.backgroundColor = isInWishlist ? '#28A745' : '#FF6347';
    } else {
      const data = await response.json();
      console.error('Error updating wishlist:', data.error);
      alert('Failed to update wishlist. Movie might already be in your wishlist! Check dashboard to confirm.');
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    alert('An error occurred while updating your wishlist. Please try again later.');
  }
}

async function checkWishlistStatus(movieTitle) {
  const token = localStorage.getItem('token');  // Retrieve token from localStorage

  if (!token) return false;

  // Decode the JWT token to get the userId
  const decoded = jwt_decode(token);  // Decode the token using jwt-decode library
  const userId = decoded.id;  // Assuming the token has an 'id' field for the user ID

  try {
    const response = await fetch(`http://localhost:5001/dashboard/api/wishlist2/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId, movieTitle })
    });

    const data = await response.json();
    return data.isInWishlist || false;  // Assuming the API returns a property isInWishlist
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    return false;
  }
}




// Toggle full plot text
function togglePlot(movieId, fullPlot) {
  const plotElement = document.getElementById(`plot-${movieId}`);
  const button = document.getElementById(`show-more-${movieId}`);

  if (plotElement.textContent.length <= 150) {
    plotElement.textContent = fullPlot;
    button.textContent = 'Show Less';
  } else {
    plotElement.textContent = `${fullPlot.slice(0, 150)}...`;
    button.textContent = 'Show More';
  }
}

// Open the trailer in a new tab
function openTrailer(url) {
  window.open(url, '_blank');
}

// Fetch the movie cast
async function getMovieCast(movieId) {
  try {
    // Fetch the API key dynamically
    const configResponse = await fetch('/api/config');
    const config = await configResponse.json();
    const TMDB_API_KEY = config.TMDB_API_KEY; // Extract the API key
    const TMDB_API_URL = 'https://api.themoviedb.org/3'; // TMDB base URL

    // Construct the URL for fetching movie cast
    const url = `${TMDB_API_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`;
    
    // Fetch cast information
    const response = await fetch(url);
    const data = await response.json();
    const castMembers = data.cast.slice(0, 4); // Get the first 4 cast members

    // Generate cast HTML
    let castHTML = castMembers.map(member => member.name).join(', '); // Join cast names with commas
    return castHTML || 'No cast information available.';
  } catch (error) {
    console.error("Error fetching movie cast:", error);
    return 'No cast information available.';
  }
}

// Fetch streaming platforms for a movie
async function getStreamingPlatforms(movieId) {
  try {
    // Fetch the API key dynamically
    const configResponse = await fetch('/api/config');
    const config = await configResponse.json();
    const TMDB_API_KEY = config.TMDB_API_KEY; // Extract the API key
    const TMDB_API_URL = 'https://api.themoviedb.org/3'; // TMDB base URL

    // Construct the URL for fetching streaming platforms
    const url = `${TMDB_API_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`;
    
    // Fetch streaming platform information
    const response = await fetch(url);
    const data = await response.json();
    const platforms = data.results?.US?.flatrate || []; // Check US streaming options

    // Return platform names as text
    return getPlatformNames(platforms);
  } catch (error) {
    console.error("Error fetching streaming platforms:", error);
    return "<p>No streaming platforms available.</p>"; // Default text if error
  }
}

// Format the platform names (as text)
function getPlatformNames(platforms) {
  let platformNamesHTML = '';
  if (platforms.length > 0) {
    platformNamesHTML = '<strong>Available on:</strong><span style="font-size: 14px;">';
    platforms.forEach((platform, index) => {
      platformNamesHTML += `${platform.provider_name}${index < platforms.length - 1 ? ', ' : ''}`;
    });
    platformNamesHTML += '</span>';
  } else {
    platformNamesHTML = '<p>No streaming platforms available.</p>';
  }
  return platformNamesHTML; // Returns formatted HTML for platform names
}



  //monitors website traffic?
// Frontend script (e.g., in a separate JS file or embedded in HTML)
document.addEventListener('DOMContentLoaded', function () {
  const visitCountElement = document.getElementById('visit-count');
  const visitCounterPopup = document.getElementById('visit-counter-popup');
  
  // Send a request to the server to increment the visit count
  fetch('http://localhost:5001/api/increment-visit', {  // Note the updated endpoint to point to your Node.js backend
      method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
      if (data && data.visitCount) {
          visitCountElement.textContent = `Number of users that have tried our recommendation engine: ${data.visitCount}`;
          visitCounterPopup.style.visibility = 'visible';  // Make the popup visible after fetching the count
      } else {
          console.error('Failed to update visit count');
      }
  })
  .catch(error => {
      console.error('Error updating visit count:', error);
  });
});




window.onload = function () {
const token = localStorage.getItem('token');
const authLinks = document.getElementById('auth-links');
const welcomeSection = document.getElementById('welcome-section');

let firstName = 'Guest'; // Default value

if (token) {
try {
    // If token exists, retrieve the first name from localStorage
    firstName = localStorage.getItem('firstName') || 'Guest'; // Defaults to 'Guest' if not found
    console.log(firstName)

    // Update the header with user's first name and logout option
    authLinks.innerHTML = `
        <p>Hello, ${firstName}!</p>
        <button id="dashboard-btn" class="flashy-btn">Dashboard</button> | 
        <button id="logout-btn" class="flashy-btn">Logout</button>
    `;

    // Display a welcome message
    welcomeSection.innerHTML = ` 
        <p>Welcome back, ${firstName}! You can now access your personalized movie recommendations, wishlist, and already watched movies, in your Dashboard. Don't forget to try out our A.I. powered movie search!</p>
    `;

    // Handle dashboard button click
    document.getElementById('dashboard-btn').addEventListener('click', function () {
        window.location.href = 'html/dashboard.html';  // Redirect to dashboard
    });

    // Handle logout
    document.getElementById('logout-btn').addEventListener('click', function () {
        localStorage.removeItem('token');
        localStorage.removeItem('firstName'); // Clear first name on logout
        window.location.href = '/html/login.html'; // Redirect to login page
    });
} catch (error) {
    console.error('Error fetching user data:', error);
    handleLoggedOutState(authLinks, welcomeSection);
}
} else {
// No token found, show login/signup options
handleLoggedOutState(authLinks, welcomeSection);
}
};

function handleLoggedOutState(authLinks, welcomeSection) {
authLinks.innerHTML = `
<button class="flashy-btn" onclick="window.location.href=' html/login.html'">Sign In</button> | 
<button class="flashy-btn" onclick="window.location.href=' html/signup.html'">Sign Up</button>
`;
welcomeSection.innerHTML = `
<p>You are not logged in. Please <a href="/html/login.html">login</a> to access your personalized movie recommendations.</p>
`;
}








//Model output funciton
async function getPrediction(newQuery = null) {
const boxElement = document.querySelector('.Prediction-Content');
boxElement.style.height = '100%';
boxElement.style.visibility = 'visible';

hideSearchResults();
hideFilterResults();
showPredictionContent();

// Create or show the floating button only during prediction
// Create or show the floating button dynamically
function createOrShowFloatingButton() {
let buttonContainer = document.getElementById('floating-button-container');

// Create the container if it doesn't exist
if (!buttonContainer) {
buttonContainer = document.createElement('div');
buttonContainer.id = 'floating-button-container';
buttonContainer.style.position = 'fixed';
buttonContainer.style.bottom = '20px';
buttonContainer.style.left = '50%';
buttonContainer.style.transform = 'translateX(-50%)';
buttonContainer.style.zIndex = '1000';
document.body.appendChild(buttonContainer);
}

// Create the button if it doesn't exist
let button = document.getElementById('floating-recommendation-button');
if (!button) {
//trailing reccomendation buttons styling
button = document.createElement('button');
button.id = 'floating-recommendation-button';
button.textContent = 'Get More A.I. Driven Recommendations?';
button.style.padding = '10px 20px';
button.style.fontSize = '16px';
button.style.backgroundColor = 'blue';
button.style.color = 'white';
button.style.border = 'none';
button.style.borderRadius = '5px';
button.style.cursor = 'pointer';
button.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'Loading...';

    // Call the prediction function or trigger additional results
    await getPrediction();
    // Reset scroll bar to the top of the page
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Smooth scrolling for better user experience
    });

    button.disabled = false;
    button.textContent = 'Get More A.I. Driven Recommendations?';
});
buttonContainer.appendChild(button);
}

// Show the button
buttonContainer.style.display = 'block';
}

// Hide the floating button
function hideFloatingButton() {
const buttonContainer = document.getElementById('floating-button-container');
if (buttonContainer) {
buttonContainer.style.display = 'none';
}
}

// Monitor the visibility of the prediction output
function toggleFloatingButtonBasedOnPrediction() {
const predictionContent = document.getElementById('Prediction-Content-id');
if (predictionContent && predictionContent.style.display !== 'none') {
createOrShowFloatingButton();
} else {
hideFloatingButton();
}
}

// Call this function periodically or after updates
setInterval(toggleFloatingButtonBasedOnPrediction, 500);
const button = document.getElementById('main-search-button');
button.disabled = true;
button.textContent = 'Processing...';

const inputText = newQuery || document.getElementById('main-search-bar').value;
const vocabSize = 50257;

try {
  const response = await fetch('http://127.0.0.1:5001/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: inputText, vocab_size: vocabSize }),
  });

  const data = await response.json();
  console.log("Received data from server:", data);

  if (data.error) {
      console.error('Error from server:', data.error);
      alert(`Error: ${data.error}`);
      return;
  }

  if (!Array.isArray(data)) {
      console.error('Expected an array, but got:', data);
      return;
  }

  const container = document.getElementById('Prediction-Content-id');
  container.innerHTML = '';

  for (const movie of data) {
      if (movie.title && movie.fullplot && movie.rating) {
          movie.fullplot = movie.fullplot || 'No plot available';
          movie.rating = movie.rating == 0.0 ? 'N/A' : movie.rating;

          // Fetch additional data from TMDb
          let trailerUrl = null;
          let castList = [];
          let platforms = [];
          let posterUrl = movie.poster; // Default to existing poster if available
          try {
            // Fetch the API key dynamically
            const configResponse = await fetch('/api/config');
            const config = await configResponse.json();
            const TMDB_API_KEY = config.TMDB_API_KEY; // Extract the API key
            const TMDB_API_URL = 'https://api.themoviedb.org/3'; // TMDB base URL
        
            // Construct the TMDB API URL for searching movies
            const tmdbResponse = await fetch(
                `${TMDB_API_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movie.title)}`
            );
        
            // Handle the TMDB API response
            const tmdbData = await tmdbResponse.json();
            if (tmdbData.results && tmdbData.results.length > 0) {
                const movieId = tmdbData.results[0].id;
        
                // Fetch poster
                const posterPath = tmdbData.results[0].poster_path;
                if (posterPath) {
                    posterUrl = `https://image.tmdb.org/t/p/w500${posterPath}`; // Use TMDb's base image URL with a standard size
                }
        
                // Fetch trailer
                const videoResponse = await fetch(
                    `${TMDB_API_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`
                );
                const videoData = await videoResponse.json();
                const trailer = videoData.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
                if (trailer) {
                    trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
                }
        
                // Fetch cast
                const castResponse = await fetch(
                    `${TMDB_API_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`
                );
                const castData = await castResponse.json();
                castList = castData.cast.slice(0, 5).map(member => member.name); // Top 5 cast members
        
                // Fetch watch providers (streaming platforms)
                const watchProvidersResponse = await fetch(
                    `${TMDB_API_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`
                );
                const watchProvidersData = await watchProvidersResponse.json();
                platforms = watchProvidersData.results?.US?.flatrate || [];
            }
        } catch (error) {
            console.error('Error fetching TMDb data:', error);
        }
        

          // Generate the movie card HTML for prediction
          const movieCard = createMovieCard_2(
              { ...movie, poster: posterUrl }, // Include the updated poster URL
              castList,
              trailerUrl,
              platforms
          );

          container.innerHTML += movieCard;
      } else {
          console.error('Movie data is incomplete:', movie);
      }
  }
} catch (error) {
  console.error('Error during prediction:', error);
  alert("Unable to fetch movies/server may be down...");
} finally {
  button.disabled = false;
  button.textContent = 'Get More A.I. Based Recommendations?';
}
}

// Helper function to check if the movie is in the user's wishlist
async function checkIfMovieInWishlist(movieTitle) {
const userId = getLoggedInUserId(); // Assume you have a way to get the logged-in user's ID

try {
  const response = await fetch(`/api/wishlist?userId=${userId}&movieTitle=${encodeURIComponent(movieTitle)}`);
  const data = await response.json();
  return data.isInWishlist; // Boolean value indicating if the movie is in the wishlist
} catch (error) {
  console.error('Error checking wishlist:', error);
  return false;
}
}


// movie card display for prediction outputs
function createMovieCard_2(movie, castList, trailerUrl, platforms) {
const sanitizedTitle = movie.title.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
const plot = movie.fullplot || "Plot not available"; // Fallback for missing fullplot

// Truncate plot text similar to fetchMovies logic
const truncatedPlot = plot.length > 150 ? plot.slice(0, 150) + "..." : plot;

// Limit the cast list to 4 members
const limitedCastList = castList.slice(0, 4);
const castDisplay = limitedCastList.join(', ') || 'No cast available';

// Poster and card styles
const posterStyle = "width: 100%; height: 300px; object-fit: cover; border-radius: 8px 8px 0 0;";
const cardStyle = `
  display: inline-block;
  width: 230px;
  margin: 10px;
  text-align: center;
  background-color: #222;
  border-radius: 8px;
  padding: 0;
  color: white;
  transition: transform 0.3s ease;
  cursor: pointer;
  vertical-align: top;
  overflow: hidden;
`;

// Safely parse the rating
const rating = movie.rating && !isNaN(movie.rating) ? parseFloat(movie.rating).toFixed(1) : "N/A";

return `
  <div class="movie-card" style="${cardStyle}" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
      <img src="${movie.poster}" alt="${movie.title} Poster" style="${posterStyle}" />
      <h3 style="font-size: 18px; font-weight: bold; margin: 10px 0;">${movie.title}</h3>
      <div style="font-size: 14px; margin: 5px 0;">
          ⭐ ${rating}
      </div>
      <p style="font-size: 14px; margin: 0 0 5px 0;">
          <strong>Cast:</strong> ${castDisplay}
      </p>
      <div class="plot-container">
          <p id="plot-${sanitizedTitle}" style="font-size: 14px; margin: 0 0 10px 0;">
              <strong>Plot:</strong> ${truncatedPlot}
          </p>
      </div>

      <!-- Show More and Read Plot buttons (if the plot is truncated) -->
      ${plot.length > 150 ? `
          <div class="button-container">
              <button id="show-more-${sanitizedTitle}" style="font-size: 14px; padding: 5px 10px; background-color: #007BFF; color: white; border: none; border-radius: 5px; cursor: pointer;" onclick="togglePlot('${sanitizedTitle}', '${plot.replace(/'/g, "\\'")}')">Show More</button>
              <button id="read-plot-${sanitizedTitle}" style="font-size: 14px; padding: 5px 10px; background-color: #28A745; color: white; border: none; border-radius: 5px; cursor: pointer;" onclick="toggleReadPlot(this, '${plot.replace(/'/g, "\\'")}')">
                  Read Plot
              </button>
          </div>
      ` : ''}

      <div style="height: 10px;"></div>
      
      <!-- Watch Trailer Button -->
      ${trailerUrl ? `
          <button class="trailer-button" style="padding: 8px 16px; font-size: 14px; background-color: #007BFF; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;" onclick="openTrailer('${trailerUrl}')">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png" alt="YouTube Icon" style="width: 20px; vertical-align: middle;"/> Watch Trailer
          </button>
      ` : ''}

      <!-- Add to Wishlist Button -->
      <button 
          id="wishlist-button-${sanitizedTitle}" 
          class="wishlist-button" 
          style="padding: 8px 16px; font-size: 14px; background-color: #FF6347; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;" 
          onclick="toggleWishlist('${movie.title}', '${sanitizedTitle}')">
          Add to Wishlist
      </button>

      <div style="height: 10px;"></div>
      
      <!-- Platforms List -->
      <div id="platforms-links-${sanitizedTitle}" style="margin-top: 10px;">
          ${platforms.length > 0 ? `
              <div class="platforms" style="margin-top: 10px; padding-top: 10px;">
                  <strong style="font-size: 14px;">Available on:</strong>
                  <div style="margin-top: 5px; padding-top: 5px;">
                      ${platforms.map(p => `<span style="display: inline-block; margin-right: 5px; font-size: 12px; background-color: #333; padding: 5px; border-radius: 4px;">${p.provider_name}</span>`).join('')}
                  </div>
              </div>` : ''
          }
      </div>
  </div>
`;
}

// Wishlist Functions

async function toggleWishlist(movieTitle, sanitizedTitle) {
const token = localStorage.getItem('token');  // Retrieve token from localStorage

if (!token) {
  alert("You need to be signed in to add movies to your wishlist.");
  return;
}

// Decode the JWT token to get the userId
const decoded = jwt_decode(token);  // Decode the token using jwt-decode library
const userId = decoded.id;  // Assuming the token has an 'id' field for the user ID

const button = document.getElementById(`wishlist-button-${sanitizedTitle}`);
const isInWishlist = button.textContent === 'Remove from Wishlist';

try {
  // Update the URL to point to localhost:5001
  const response = await fetch('http://localhost:5001/dashboard/api/wishlist', {
      method: isInWishlist ? 'DELETE' : 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Send the JWT token for authentication
      },
      body: JSON.stringify({ userId, movieTitle })
  });

  if (response.ok) {
      // Update button text and color
      button.textContent = isInWishlist ? 'Add to Wishlist' : 'Remove from Wishlist';
      button.style.backgroundColor = isInWishlist ? 'green' : 'red';
  } else {
      const data = await response.json();
      console.error('Error updating wishlist:', data.error);
      alert('Failed to update wishlist. Movie might already be in your wishlist! Check dashboard to confirm.');
  }
} catch (error) {
  console.error('Error toggling wishlist:', error);
  alert('An error occurred while updating your wishlist. Please try again later.');
}
}

function getPlatformNames(platforms) {
let platformNamesHTML = '';
if (platforms.length > 0) {
  platformNamesHTML = '<strong>Available on:</strong><ul style="list-style-type: none; padding-left: 0; font-size: 14px; margin: 0;">';
  platforms.forEach(platform => {
      platformNamesHTML += `<li>${platform.provider_name}</li>`;
  });
  platformNamesHTML += '</ul>';
} else {
  platformNamesHTML = '<p>No streaming platforms available.</p>';
}
return platformNamesHTML;
}

function openTrailer(url) {
if (url) {
  window.open(url, '_blank');
} else {
  alert('No trailer available.');
}
}

function togglePlot(sanitizedTitle, fullPlot) {
const plotElement = document.getElementById(`plot-${sanitizedTitle}`);
const button = document.getElementById(`show-more-${sanitizedTitle}`);
if (plotElement.style.height === 'auto') {
  plotElement.style.height = '60px'; // Collapsed state
  plotElement.innerHTML = `<strong>Plot:</strong> ${fullPlot.slice(0, 150)}...`;
  button.textContent = 'Show More';
} else {
  plotElement.style.height = 'auto'; // Expanded state
  plotElement.innerHTML = `<strong>Plot:</strong> ${fullPlot}`;
  button.textContent = 'Show Less';
}
}





