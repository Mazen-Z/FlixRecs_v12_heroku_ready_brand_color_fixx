document.getElementById('search-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const movieTitle = document.getElementById('movie-search').value;
    const errorMessage = document.getElementById('error-message');
    
    // Reset any previous error messages
    errorMessage.textContent = '';
    
    // Show loading message
    document.getElementById('search-btn').textContent = 'Loading...';
    
    try {
        const response = await fetch(`http://localhost:5001/review/api/searchMovie?title=${movieTitle}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add authorization headers if necessary
            }
        });
  
        if (response.ok) {
            const data = await response.json();
            const searchResults = document.getElementById('search-results');
            searchResults.innerHTML = '';
  
            if (data.movies && data.movies.length > 0) {
                data.movies.forEach(movie => {
                    console.log('Movie ID for link:', movie._id); // Log to ensure _id is correct
                    const movieElement = document.createElement('div');
                    movieElement.innerHTML = `
                        <h3>${movie.title}</h3>
                        <p>${movie.plot || 'No description available.'}</p>
                        <a style="font-size: 30px;" href="reviewPage.html?id=${movie._id}">View Review</a>
                    `;
                    searchResults.appendChild(movieElement);
                });
            } else {
                searchResults.innerHTML = `<p>No results found for "${movieTitle}".</p>`;
            }
        } else {
            const errorData = await response.json();
            errorMessage.textContent = errorData.message || 'An error occurred. Please try again later.';
        }
    } catch (error) {
        console.error('Error fetching movie data:', error);
        errorMessage.textContent = 'There was a problem with the request. Please try again later.';
    } finally {
        // Reset button text after loading
        document.getElementById('search-btn').textContent = 'Search';
    }
});

// Get the movie ID from the query string
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');
console.log("Movie ID: ", movieId); // Log the movie ID

// Ensure that the movieId is valid before proceeding
if (movieId) {
    // Use the movieId to fetch the movie data
    fetch(`http://localhost:5001/review/api/getMovieById?id=${movieId}`)
        .then(response => response.json())
        .then(movie => {
            // Render the review page with movie data
            document.getElementById('movie-title').innerText = movie.title;
            document.getElementById('movie-description').innerText = movie.plot;
            // Optionally, render reviews, etc.
        })
        .catch(err => console.error('Error fetching movie data:', err));
} else {
    console.error('No movie ID found in the URL.');
    // Optionally, show an error message or redirect if no movie ID is found
}
