



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
            }
        });
  
        if (response.ok) {
            const data = await response.json();
            const searchResults = document.getElementById('search-results');
            searchResults.innerHTML = '';
  
            if (data.movies && data.movies.length > 0) {
                data.movies.forEach(movie => {
                    const movieElement = document.createElement('div');
                    movieElement.innerHTML = `
                        <h3>${movie.title}</h3>
                        <p>${movie.description || 'No description available.'}</p>
                        <a href="reviewPage.html?id=${movie._id}">View Review</a>

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
  