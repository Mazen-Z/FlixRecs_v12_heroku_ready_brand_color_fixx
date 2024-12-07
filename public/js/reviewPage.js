

document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        console.error('No movie ID found in the URL.');
        alert('No movie ID found.');
        return;
    }

    // Check for JWT token in localStorage
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found. User is not logged in.');
        alert('You must be logged in to access this page.');
        window.location.href = 'login.html'; // Redirect to login page if no token is found
        return;
    }

    try {
        // Fetch current user data with the token in the Authorization header
        const currentUserResponse = await fetch('http://localhost:5001/dashboard/api/user', {
            headers: {
                'Authorization': `Bearer ${token}`, // Send the token in the Authorization header
            }
        });

        if (!currentUserResponse.ok) {
            throw new Error('Failed to fetch user data.');
        }

        const currentUser = await currentUserResponse.json();
        const isAdmin = currentUser?.admin === 1;

        console.log('Current user data:', currentUser);

        // Fetch movie data using the movie ID
        const response = await fetch(`http://localhost:5001/review/api/getMovieById?id=${movieId}`, {
            headers: {
                'Authorization': `Bearer ${token}`, // Include the token for authenticated requests
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch movie data: ${response.statusText}`);
        }

        const movie = await response.json();
        console.log('Fetched movie data:', movie);

        if (!movie) {
            throw new Error('Movie not found.');
        }

        // Populate movie details
        document.getElementById('movie-title').textContent = movie.title || "No title available";
        document.getElementById('movie-plot').textContent = movie.plot || "No plot description available";
        document.getElementById('movie-cast').textContent = movie.cast?.join(', ') || "No cast information available";
   

        // Display total number of reviews
        const totalReviewsCount = movie.reviews?.length || 0;
        document.getElementById('total-reviews').textContent = `Total Reviews: ${totalReviewsCount}`;

        // Aggregate rating
        const averageRating = movie.reviews && movie.reviews.length > 0
            ? (movie.reviews.reduce((acc, review) => acc + review.rating, 0) / movie.reviews.length).toFixed(1)
            : 'N/A';
        document.getElementById('movie-aggregate-rating').textContent = `Average Rating: ${averageRating}`;

        // Fetch movie poster by title
        const configResponse = await fetch('/api/config');
        const config = await configResponse.json();
        const TMDB_API_KEY = config.TMDB_API_KEY; // Extract the API key from the response

        const searchResponse = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movie.title)}`);
        if (!searchResponse.ok) {
            throw new Error('Failed to fetch poster data from TMDB.');
        }

        const searchData = await searchResponse.json();
        if (searchData.results?.length > 0) {
            const posterUrl = `https://image.tmdb.org/t/p/w500${searchData.results[0].poster_path}`;
            document.getElementById('movie-poster').src = posterUrl;
            document.getElementById('movie-poster').alt = `${movie.title} Poster`;
        } else {
            document.getElementById('movie-poster').alt = "No poster available";
        }

        // Fetch and render trailer


        const trailerResponse = await fetch(`https://api.themoviedb.org/3/movie/${movie.tmdbId}/videos?api_key=${TMDB_API_KEY}`);
        const trailerData = await trailerResponse.json();
        const trailer = trailerData.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        if (trailer) {
            const youtubeButton = document.createElement('button');
            youtubeButton.classList.add('youtube-button');
            youtubeButton.innerText = 'Watch Trailer';
            youtubeButton.onclick = function () {
                window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
            };
            document.getElementById('movie-trailer').appendChild(youtubeButton);
        } else {
            document.getElementById('movie-trailer').innerText = 'No trailer available.';
        }

    

    
        // Fetch and display streaming platforms
        const tmdbResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=watch/providers`);
        if (!tmdbResponse.ok) {
            throw new Error('Failed to fetch data from TMDB.');
        }
        const tmdbData = await tmdbResponse.json();
        const streamingProviders = tmdbData['watch/providers']?.results?.US?.flatrate?.map(p => p.provider_name) || [];
        const platformsContainer = document.getElementById('streaming-platforms');
        platformsContainer.textContent = streamingProviders.length > 0 ? streamingProviders.join(', ') : "No streaming platforms available.";

        // Render reviews
        const reviewsContainer = document.getElementById('user-reviews');
        if (movie.reviews?.length > 0) {
            movie.reviews.reverse().forEach(review => {
                const reviewCard = document.createElement('div');
                reviewCard.classList.add('review-card');
                reviewCard.innerHTML = `
                <h3>Review by ${review.userName || 'Anonymous'} on ${new Date(review.timestamp).toLocaleString()}</h3>
                    <p>${review.content}</p>
                    <p>Rating: ${review.rating}/10</p>
                    ${currentUser.userId === review.userId || isAdmin ? `
                        <button class="delete-btn" data-review-id="${review._id}" data-movie-id="${movie._id}">Delete</button>
                    ` : ''}
                `;
                reviewsContainer.appendChild(reviewCard);
            });
        } else {
            const noReviewsMessage = document.createElement('p');
            noReviewsMessage.textContent = 'No reviews available.';
            reviewsContainer.appendChild(noReviewsMessage);
        }
        


        //delete button even lisenter 
        document.body.addEventListener('click', async (e) => {
            const deleteBtn = e.target.closest('.delete-btn');
            if (!deleteBtn) return;
        
            const reviewId = deleteBtn.getAttribute('data-review-id');
            const movieId = deleteBtn.getAttribute('data-movie-id');
            const userId = currentUser?.userId; // Ensure currentUser is properly defined

            console.log("Review ID:", reviewId);
            console.log("Movie ID:", movieId);
            console.log("user ID:", userId);
        
            if (!reviewId || !movieId || !userId) {
                console.error("Missing data for delete operation.", { reviewId, movieId, userId });
                alert("Unable to delete the review. Missing required data.");
                return;
            }
        
            try {
                const response = await fetch('http://localhost:5001/review/api/deleteReview', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ reviewId, movieId, userId }),
                });
        
                const result = await response.json();
        
                if (!response.ok) {
                    throw new Error(result.message || 'Failed to delete review.');
                }
        
                alert("Review deleted successfully.");
                deleteBtn.closest('.review-card').remove(); // Update the DOM dynamically
            } catch (error) {
                console.error("Error deleting review:", error);
                alert("Error occurred while deleting the review.");
            }
        });
        

        // Handle review form submission
        document.getElementById('review-form').addEventListener('submit', async function (e) {
            e.preventDefault();
            if (!token) {
                alert('You need to be logged in to submit a review.');
                window.location.href = 'login.html'; // Redirect to login if not signed in.
                return;
            }

            try {
                const decoded = jwt_decode(token);
                const userId = decoded.id;
                if (!userId) {
                    throw new Error('Invalid token: Missing user ID.');
                }

                if (movie.reviews?.some(review => review.userId === userId)) {
                    alert('You have already posted a review for this movie.');
                    return;
                }

                const reviewContent = document.getElementById('reviewContent').value.trim();
                const ratingInput = document.getElementById('rating');

                if (!reviewContent) {
                    alert('Please write a review before submitting.');
                    return;
                }

                const rating = parseInt(ratingInput.value, 10);

                if (!rating || rating < 1 || rating > 10) {
                    alert('Please select a rating between 1 and 10.');
                    return;
                }

                const newReview = {
                    movieId: movieId,
                    userId: userId,
                    userName: currentUser.userName,
                    content: reviewContent,
                    rating: rating,
                    timestamp: Date.now(),
                };

                const reviewResponse = await fetch('http://localhost:5001/review/api/addReview', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(newReview),
                });

                if (!reviewResponse.ok) {
                    throw new Error('Failed to submit review.');
                }

                alert('Review submitted successfully.');
                window.location.reload();
            } catch (error) {
                console.error(error);
                alert('Error occurred while submitting your review.');
            }
        });
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
});
