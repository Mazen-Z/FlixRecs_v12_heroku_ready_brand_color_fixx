
//main dashboard fetches
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    // Check if token exists
    if (!token) {
        //alert('You must be logged in to view the dashboard.');
        window.location.href = '/login'; // Redirect to login if no token
        return;
    }

    // Fetch user data from the server (Dashboard Data)
    fetch('http://localhost:5001/dashboard/dashboard', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Include token for authenticated requests
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Dashboard Data:', data); // Log the response data for debugging

        if (data.success) {
            const user = data.user;

            // Store first name globally in localStorage (to use it across pages)
            localStorage.setItem('firstName', user.firstName);

            // Fill user info
            document.getElementById('username').textContent = user.username; // Display the username
            document.getElementById('first-name').textContent = user.firstName;
            document.getElementById('last-name').textContent = user.lastName;
            document.getElementById('email').textContent = user.email;

            // Set the first name after "Welcome to your Dashboard"
            document.getElementById('username').textContent = user.username;

            // Format and display the join date
            const formattedJoinDate = new Date(user.dateJoined).toLocaleDateString('en-US');
            document.getElementById('join-date').textContent = formattedJoinDate;

            // Populate Wishlist with Remove Button
            const wishlistList = document.getElementById('wishlist-items');
            wishlistList.innerHTML = ''; // Clear loading message
            if (user.wishlist && user.wishlist.length > 0) {
                user.wishlist.forEach(movie => {
                    const listItem = document.createElement('li');
                    listItem.textContent = movie;

                    // Add remove button for each movie in wishlist
                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = 'Remove';
                    removeBtn.addEventListener('click', () => removeMovieFromWishlist(movie)); // Call removeMovieFromWishlist when clicked

                    listItem.appendChild(removeBtn);
                    wishlistList.appendChild(listItem);
                });
            } else {
                wishlistList.innerHTML = '<li>No movies in wishlist.</li>';
            }

            // Populate Watched Movies with Remove Button
            const watchedList = document.getElementById('watched-items');
            watchedList.innerHTML = ''; // Clear loading message
            if (user.watchedMovies && user.watchedMovies.length > 0) {
                user.watchedMovies.forEach(movie => {
                    const listItem = document.createElement('li');
                    listItem.textContent = movie;

                    // Add remove button for each movie in watched list
                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = 'Remove';
                    removeBtn.addEventListener('click', () => removeMovie(movie)); // Call removeMovie when clicked

                    listItem.appendChild(removeBtn);
                    watchedList.appendChild(listItem);
                });
            } else {
                watchedList.innerHTML = '<li>No movies watched yet.</li>';
            }
        } else {
            alert('Failed to load dashboard data (Seesion timed out): Try logging in/out to correct this');
        }
    })
    .catch(error => {
        console.error('Error fetching dashboard data:', error);
       
    });

    // Logout functionality
    const logoutBtn = document.getElementById('signout-btn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('firstName'); // Remove first name upon logout
        window.location.href = '/'; // Redirect to login page
    });
});






// Add movie to watched list function
async function addMovieToWatched(title) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to add movies.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5001/dashboard/add-movie-to-watched', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title })
        });
        const data = await response.json();
        if (data.success) {
            alert('Movie added to watched list!');
            location.reload();  // Optionally, refresh the list on the page
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error('Error adding movie:', error);
        alert('Something went wrong. Please try again later.');
    }
}




// function to find how many movies a user watched.
// Assuming the user is logged in and we have a session or token to identify the user
async function fetchMoviesWatchedCount() {
    try {
        const response = await fetch('http://localhost:5001/dashboard/getMoviesWatchedCount', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add authentication token if needed
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
        });

        const data = await response.json();
        if (data.watchedMoviesCount !== undefined) {
            document.getElementById('movies-watched-count').textContent = data.watchedMoviesCount;
        } else {
            console.error('Failed to fetch movie count', data);
        }
    } catch (error) {
        console.error('Error fetching movie count:', error);
    }
}

// Call the function to fetch the count when the page loads
window.onload = function() {
    fetchMoviesWatchedCount();
};







document.addEventListener('DOMContentLoaded', () => {
const token = localStorage.getItem('token');

// Check if token exists
if (!token) {
window.location.href = '/html/login.html'; // Redirect to login if no token
alert('You must be logged in to view the dashboard.');

return;
}

// Fetch user data from the server (Dashboard Data)
fetchUserDashboard();

// Add new movie to watched list
document.getElementById('add-movie-btn').addEventListener('click', () => {
const movieTitle = document.getElementById('movie-title-input').value;
if (movieTitle) {
    addMovieToWatched(movieTitle);
}
});
});








// Function to fetch and update the dashboard data
function fetchUserDashboard() {
const token = localStorage.getItem('token');

if (!token) {
window.location.href = '/html/login.html'; // Redirect to login if no token
//alert('You must be logged in to view the dashboard.');

return;
}

fetch('http://localhost:5001/dashboard/dashboard', {
method: 'GET',
headers: {
    'Authorization': `Bearer ${token}`, // Include token for authenticated requests
}
})
.then(response => response.json())
.then(data => {
if (data.success) {
    const user = data.user;

    // Fill in user info
    document.getElementById('first-name').textContent = user.firstName;
    document.getElementById('last-name').textContent = user.lastName;
    document.getElementById('email').textContent = user.email;

    // Format and insert the dateJoined field
    const joinDateElement = document.getElementById('join-date');
    if (joinDateElement && user.dateJoined) {
        joinDateElement.textContent = formatDate(user.dateJoined);
    } else {
        console.error('Date Joined not found.');
    }

    // Insert the user's first name into the greeting message
    document.getElementById('user-first-name').textContent = user.firstName;

    // Update the wishlist
    const wishlist = document.getElementById('wishlist');
    if (wishlist) {
        wishlist.innerHTML = ''; // Clear existing wishlist
        if (user.wishlist && user.wishlist.length > 0) {
            user.wishlist.forEach(movie => {
                const listItem = document.createElement('li');
                listItem.textContent = movie;

                // Fetch the poster for the movie from TMDB API
                fetchAndDisplayPosters(movie, listItem);

                const removeBtn = document.createElement('button');
                removeBtn.textContent = 'Remove';
                removeBtn.addEventListener('click', () => removeMovieFromWishlist(movie));

                listItem.appendChild(removeBtn);
                wishlist.appendChild(listItem);
            });
        } else {
            wishlist.innerHTML = '<li>No movies in wishlist.</li>';
        }
    } else {
        console.error('Wishlist element not found.');
    }

    // Update the watched list
    const watchedList = document.getElementById('movies-watched');
    if (watchedList) {
        watchedList.innerHTML = ''; // Clear existing list
        if (user.watchedMovies && user.watchedMovies.length > 0) {
            user.watchedMovies.forEach(movie => {
                const listItem = document.createElement('li');
                listItem.textContent = movie;

                // Fetch the poster for the movie from TMDB API
                fetchAndDisplayPosters(movie, listItem);

                const removeBtn = document.createElement('button');
                removeBtn.textContent = 'Remove';
                removeBtn.addEventListener('click', () => removeMovieFromWatched(movie));

                listItem.appendChild(removeBtn);
                watchedList.appendChild(listItem);
            });
        } else {
            watchedList.innerHTML = '<li>No movies watched yet.</li>';
        }
    } else {
        console.error('Watched list element not found.');
    }
} else {
      //remove + data.error during production
    alert('Failed to load dashboard data (Session timed out): Try logging in/out to correct this issue.');
    localStorage.removeItem('token');
    localStorage.removeItem('firstName'); // Remove first name upon logout
    window.location.href = '/html/login.html'; // Redirect to login page
    
  
}
})
.catch(error => {
console.error('Error fetching dashboard data:', error);

alert('Something went wrong. Please try again.');
});
}

// Helper function to format a date as MM/DD/YYYY
function formatDate(date) {
const d = new Date(date);
const month = d.getMonth() + 1; // Months are zero-indexed, so we add 1
const day = d.getDate();
const year = d.getFullYear();

// Return the date in MM/DD/YYYY format
return `${month < 10 ? '0' + month : month}/${day < 10 ? '0' + day : day}/${year}`;
}










// Function to fetch movie poster from TMDB API
async function fetchAndDisplayPosters(movieTitle, listItem) {
    try {
        // Fetch the API key dynamically from the /api/config endpoint
        const configResponse = await fetch('/api/config');
        const config = await configResponse.json();
        const TMDB_API_KEY = config.TMDB_API_KEY; // Extract the API key from the response

        // Now use the API key to fetch movie data from TMDB
        const tmdbResponse = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieTitle)}`
        );
        const tmdbData = await tmdbResponse.json();

        if (tmdbData.results && tmdbData.results.length > 0) {
            const movie = tmdbData.results[0];
            const posterPath = movie.poster_path;
            const movieId = movie.id;

            // Add poster image if available
            if (posterPath) {
                const posterUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;
                const imgElement = document.createElement('img');
                imgElement.src = posterUrl;
                imgElement.alt = `${movieTitle} Poster`;
                imgElement.style.width = '50px'; // Adjust poster size
                imgElement.style.marginBottom = '10px';
                imgElement.style.display = 'block';
                listItem.insertBefore(imgElement, listItem.firstChild);
            }

            // Fetch streaming platforms
            const providersResponse = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`
            );
            const providersData = await providersResponse.json();

            let platformsText = 'No streaming platforms available.';
            if (providersData.results && providersData.results.US) { // Adjust for country code
                const platforms = providersData.results.US.flatrate || [];
                if (platforms.length > 0) {
                    platformsText = `Streaming on: ${platforms.map(p => p.provider_name).join(', ')}`;
                }
            }

            // Add streaming platform text directly above the remove button
            const platformsElement = document.createElement('p');
            platformsElement.textContent = platformsText;
            platformsElement.style.fontSize = '12px';
            platformsElement.style.marginTop = '5px';
            platformsElement.style.marginBottom = '10px';

            // Insert platformsElement above the last child (assuming the last child is the remove button)
            if (listItem.lastChild) {
                listItem.insertBefore(platformsElement, listItem.lastChild);
            } else {
                // If no remove button exists yet, append platformsElement normally
                listItem.appendChild(platformsElement);
            }
        }
    } catch (error) {
        console.error('Error fetching movie details or streaming platforms:', error);
    }
}

  






// Function to remove movie from wishlist
async function removeMovieFromWishlist(title) {
const token = localStorage.getItem('token');
if (!token) {
alert('You must be logged in to remove movies.');
return;
}

try {
// Decode the JWT token to get the userId
const decoded = jwt_decode(token);  // Decode the token using jwt-decode library
const userId = decoded.id;  // Assuming the token has an 'id' field for the user ID

const response = await fetch('http://localhost:5001/api/wishlist', {
    method: 'DELETE', // Change to DELETE method as per the new route
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Send token as Authorization header
    },
    body: JSON.stringify({ userId, movieTitle: title }) // Send userId and movieTitle
});

if (!response.ok) {
    throw new Error(`Server responded with status: ${response.status}`);
}

const data = await response.json();

if (data.success) {
    alert('Movie removed from wishlist!');
    fetchUserDashboard(); // Re-fetch the dashboard to update the wishlist
} else {
    alert(`Error: ${data.error}`);
}
} catch (error) {
console.error('Error removing movie from wishlist:', error);
alert('Something went wrong. Please try again later.');
}
}










// Function to remove movie from wishlist
async function removeMovieFromWishlist(title) {
const token = localStorage.getItem('token');
if (!token) {
alert('You must be logged in to remove movies.');
return;
}

try {
// Decode the JWT token to get the userId
const decoded = jwt_decode(token);  // Decode the token using jwt-decode library
const userId = decoded.id;  // Assuming the token has an 'id' field for the user ID

const response = await fetch('http://localhost:5001/dashboard/api/wishlist', {
    method: 'DELETE', // Change to DELETE method as per the new route
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Send token as Authorization header
    },
    body: JSON.stringify({ userId, movieTitle: title }) // Send userId and movieTitle
});

if (!response.ok) {
    throw new Error(`Server responded with status: ${response.status}`);
}

const data = await response.json();

if (data.success) {
    alert('Movie removed from wishlist!');
    fetchUserDashboard(); // Re-fetch the dashboard to update the wishlist
} else {
    alert(`Error: ${data.error}`);
}
} catch (error) {
console.error('Error removing movie from wishlist:', error);
alert('Something went wrong. Please try again later.');
}
}

// Function to remove movie from watched list
async function removeMovieFromWatched(title) {
const token = localStorage.getItem('token');
if (!token) {
alert('You must be logged in to remove movies.');
return;
}

try {
// Decode the JWT token to get the userId
const decoded = jwt_decode(token);  // Decode the token using jwt-decode library
const userId = decoded.id;  // Assuming the token has an 'id' field for the user ID

const response = await fetch('http://localhost:5001/api/watched/remove', {
    method: 'DELETE', // Change to DELETE method as per the new route
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Send token as Authorization header
    },
    body: JSON.stringify({ userId, movieTitle: title }) // Send userId and movieTitle
});

if (!response.ok) {
    throw new Error(`Server responded with status: ${response.status}`);
}

const data = await response.json();

if (data.success) {
    alert('Movie removed from already watched!');
    fetchUserDashboard(); // Re-fetch the dashboard to update the wishlist
} else {
    alert(`Error: ${data.error}`);
}
} catch (error) {
console.error('Error removing movie from already watched:', error);
alert('Something went wrong. Please try again later.');
}
}



// Function to update button text to 'Loading...' and start rendering the cards
function startLoading() {
// Get the button element by ID
const button = document.getElementById('dashboard-movie-cards');

// Change the button text to 'Loading...'
button.innerText = 'Loading...';

// Call the function to fetch and render the personalized recommendations
renderPersonalizedRecommendations();
}

// Example function to simulate rendering of personalized recommendations (use your actual function here)
function renderPersonalizedRecommendations() {
// Simulate loading time (for demo purposes)
setTimeout(() => {
// When the rendering is done, update the button text back to the original
const button = document.getElementById('dashboard-movie-cards');
button.innerText = 'Get more personalized A.I. generated recommendations?';

// Call your logic to display the personalized recommendations here
}, 3000); // Simulate a delay of 3 seconds (replace with your actual rendering logic)
}










// function allows us to recommend movies to users based on their watchlist history.
async function getMovieRecommendation() {
    startLoading() //allows for the  dashboard reccomendaiton button to change it's state via. text.






const token = localStorage.getItem('token');

// Optional check for logged-in user
if (!token) {
    console.log('You are not logged in, proceeding without token.');
    alert('You are not logged in. Please log in to continue.');
    return;  // Exit if token is not available
}

try {
    console.log("Fetching user data...");

    // Fetch the logged-in user's data using token in the headers
    const userResponse = await fetch('http://localhost:5001/dashboard/api/user', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,  // Include the token in the Authorization header
        },
    });

    // Check if the user data is available
    if (!userResponse.ok) {
        alert("Failed to fetch user data.");
        return;
    }

    const userData = await userResponse.json();

    // Check if userId exists before making fetch request
    if (!userData || !userData.userId) {
        alert("User ID is not available.");
        return;
    }

    console.log("User data fetched:", userData);

    // Fetch most common genre from API
    const response = await fetch(`http://localhost:5001/dashboard/api/userData/randomMovies/${userData.userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,  // Include the token in the Authorization header
        },
    });

    if (!response.ok) {
        alert("Please add items to your wishlist/movies watched so we can better assist you, in rendering  A.I. generated movie reccomendations personalized, just for you!");
        return;
    }

    const data = await response.json();

    console.log("Fetched data:", data);  // Log data for debugging
    if (data.message) {
        alert(data.message);
        return;
    }

    // Ensure the genre is available before proceeding
    const mostCommonGenre = data.mostCommonGenre;
    console.log("Most common genre:", mostCommonGenre);

    if (!mostCommonGenre) {
        alert("No custom recommendations for you can be produced at this time. Try adding movies to your watchlist/wishlist!");
        return;  // Exit if no common genre found
    }

    // Define a pool of query variations
    const queryVariations = [
        `Best ${mostCommonGenre} movies of all time.`,
        `Top-rated ${mostCommonGenre} films to watch.`,
        `Popular ${mostCommonGenre} movies for movie night.`,
        `Must-watch ${mostCommonGenre} films.`,
        `Critically acclaimed ${mostCommonGenre} movies.`,
        `Hidden gem ${mostCommonGenre} films.`,
        `Highly recommended ${mostCommonGenre} movies to stream.`,
        `Classic ${mostCommonGenre} films everyone loves.`,
        `Latest ${mostCommonGenre} releases.`,
        `Underrated ${mostCommonGenre} movies you should check out.`
    ];

    // Randomly select one query from the pool
    const inputText = queryVariations[Math.floor(Math.random() * queryVariations.length)];
    console.log(inputText);

    const vocabSize = 5001;  // Adjust based on your model's parameters

    // Fetch recommendations from RAG model
    const ragResponse = await fetch('http://127.0.0.1:5001/predict', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: inputText, vocab_size: vocabSize }),
    });

    if (!ragResponse.ok) {
        const errorText = await ragResponse.text();  
        console.error("Error getting Personalized Recommendations:", errorText); 
        alert("Failed to fetch recommendations from our A.I.");
        return;
    }

    const ragData = await ragResponse.json();

    // Check if response is empty or missing expected fields
    if (!Array.isArray(ragData) || ragData.length === 0) {
        alert("No recommendations from the RAG model at this time.");
        return;
    }

    // Process the received movie recommendations
    const movieRecommendations = ragData.map(movie => {
        // Default values if missing
        movie.fullplot = movie.fullplot || 'Plot not available';
        movie.rating = movie.rating == 0.0 ? 'N/A' : movie.rating;

        // Fetch additional movie data from TMDB (poster, trailer, cast, platforms)
        let trailerUrl = null;
        let castList = [];
        let platforms = [];
        let posterUrl = movie.poster; // Default to existing poster if available

        return fetchTMDBData(movie.title).then(tmdbData => {
            if (tmdbData) {
                trailerUrl = tmdbData.trailerUrl;
                castList = tmdbData.castList;
                platforms = tmdbData.platforms;
                posterUrl = tmdbData.posterUrl;
            }

            return createMovieCard_2({ ...movie, poster: posterUrl }, castList, trailerUrl, platforms);
        });
    });

    // Wait for all movie data fetches to complete
    const movieCards = await Promise.all(movieRecommendations);

    // Generate movie cards and display them
    const carouselItems = movieCards.join('');
    document.getElementById('output-box').style.display = 'block';
    document.getElementById('carousel-container').innerHTML = carouselItems;

} catch (error) {
    console.log("Failed to fetch user data:", error);
    alert('Error fetching user data for RAG.');
}
}

// Function to fetch additional movie data from TMDB
async function fetchTMDBData(movieTitle) {
    try {
        // Fetch the API key dynamically from the /api/config endpoint
        const configResponse = await fetch('/api/config');
        const config = await configResponse.json();
        const TMDB_API_KEY = config.TMDB_API_KEY; // Extract the API key from the response

        // Fetch movie data from TMDB based on the title
        const tmdbResponse = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieTitle)}`
        );
        const tmdbData = await tmdbResponse.json();

        if (tmdbData.results && tmdbData.results.length > 0) {
            const movieId = tmdbData.results[0].id;
            let posterUrl = null, trailerUrl = null, castList = [], platforms = [];

            // Fetch poster
            const posterPath = tmdbData.results[0].poster_path;
            if (posterPath) {
                posterUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;
            }

            // Fetch trailer
            const videoResponse = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`
            );
            const videoData = await videoResponse.json();
            const trailer = videoData.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
            if (trailer) {
                trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
            }

            // Fetch cast
            const castResponse = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`
            );
            const castData = await castResponse.json();
            castList = castData.cast.slice(0, 5).map(member => member.name);  // Top 5 cast members

            // Fetch watch providers (streaming platforms)
            const watchProvidersResponse = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`
            );
            const watchProvidersData = await watchProvidersResponse.json();
            platforms = watchProvidersData.results?.US?.flatrate || [];

            return { trailerUrl, castList, platforms, posterUrl };
        }
    } catch (error) {
        console.error('Error fetching TMDb data:', error);
    }

    return null;  // Return null in case of error
}


// Function to create a movie card with given movie data


function createMovieCard_2(movie, castList, trailerUrl, platforms) {
    const sanitizedTitle = movie.title.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
    const plot = movie.fullplot || "Plot not available"; // Fallback for missing fullplot

    // Truncate plot text similar to fetchMovies logic
    const truncatedPlot = plot.length > 150 ? plot.slice(0, 150) + "..." : plot;

    // Limit the cast list to 4 members
    const limitedCastList = castList.slice(0, 4);
    const castDisplay = limitedCastList.join(', ') || 'No cast available';

    // Poster and card styles
    const posterStyle = `
        width: 100%;
        height: 300px;
        object-fit: cover;
        border-radius: 8px 8px 0 0;
        background-color: #000; /* Fallback for missing images */
    `;
    
    // Safely parse the rating
    const rating = movie.rating && !isNaN(movie.rating) ? parseFloat(movie.rating).toFixed(1) : "N/A";

    return `
        <div class="movie-card" 
             style="background-color: #222; color: #fff; border-radius: 8px; overflow: hidden; margin: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.3s;"
             onmouseover="this.style.transform='scale(1.05)'" 
             onmouseout="this.style.transform='scale(1)'">
            
            <!-- Movie Poster -->
            <img src="${movie.poster}" alt="${movie.title} Poster" style="${posterStyle}" />
            
            <!-- Movie Title -->
            <h3 style="font-size: 20px; font-weight: bold; margin: 10px 0;">${movie.title}</h3>
            
            <!-- Movie Rating -->
            <div style="font-size: 16px; margin: 5px 0;">
                ⭐ ${rating}
            </div>
            
            <!-- Cast Information -->
            <p style="font-size: 16px; margin: 0 0 5px 0; color: #fff;">
                <strong>Cast:</strong> ${castDisplay}
            </p>
            
            <!-- Plot Section -->
            <div class="plot-container">
                <p id="plot-${sanitizedTitle}" style="font-size: 16px; margin: 0 0 10px 0; color: #fff;">
                    <strong>Plot:</strong> ${truncatedPlot}
                </p>
            </div>

                    <!-- Show More and Read Plot buttons (if the plot is truncated) -->
            ${plot.length > 150 ? `
                <div class="button-container" style="display: flex; justify-content: center; gap: 7px; margin-top: 10px;">
                    <button id="show-more-${sanitizedTitle}" 
                            style="font-size: 14px; padding: 8px 12px; background-color: #007BFF; color: white; border: none; border-radius: 5px; cursor: pointer;" 
                            onclick="togglePlot('${sanitizedTitle}', '${plot.replace(/'/g, "\\'")}')">
                        Show More
                    </button>
                    <button id="read-plot-${sanitizedTitle}" 
                            style="font-size: 14px; padding: 8px 12px; background-color: #28A745; color: white; border: none; border-radius: 5px; cursor: pointer;" 
                            onclick="toggleReadPlot(this, '${plot.replace(/'/g, "\\'")}')">
                        Read Plot
                    </button>
                </div>
            ` : ''}



            <!-- Watch Trailer Button -->
            ${trailerUrl ? `
                <button class="trailer-button" 
                        style="padding: 8px 12px; font-size: 14px; background-color: #007BFF; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px; display: flex; align-items: center; gap: 5px;" 
                        onclick="openTrailer('${trailerUrl}')">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png" 
                        alt="YouTube Icon" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle;"/> 
                    Watch Trailer
                </button>
            ` : `
                <button class="trailer-button disabled" 
                        style="padding: 8px 12px; font-size: 14px; background-color: #6c757d; color: white; border: none; border-radius: 5px; cursor: not-allowed; margin-top: 10px;">
                    No Trailer Available
                </button>
            `}

            <!-- Add to Wishlist Button -->
            <button 
                id="wishlist-button-${sanitizedTitle}" 
                class="wishlist-button" 
                style="padding: 8px 16px; font-size: 14px; background-color: #FF6347; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;" 
                onclick="toggleWishlist('${movie.title}', '${sanitizedTitle}')">
                Add to Wishlist
            </button>

            <!-- Platforms List -->
            ${platforms.length > 0 ? `
                <div id="platforms-links-${sanitizedTitle}" style="margin-top: 10px;">
                    <strong style="font-size: 14px;">Available on:</strong>
                    <div style="margin-top: 5px;">
                        ${platforms.map(p => `
                            <span style="display: inline-block; margin-right: 5px; font-size: 12px; background-color: #333; color: #fff; padding: 5px; border-radius: 4px;">
                                ${p.provider_name}
                            </span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
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








module.exports = router;