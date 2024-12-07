

// Function to validate the password
function validatePassword(password) {
    // Regex to ensure password contains at least 8 characters, 
    // with at least one letter, one special character, and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

// Function to handle user registration
function registerUser(firstName, lastName, username, email, password) {
    // Validate the password
    if (!validatePassword(password)) {
        alert('Password must be at least 8 characters long and include at least one letter, one number, and one special character.');
        return;
    }

    // Send data to the backend via a POST request
    fetch('http://localhost:5001/register/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, username, email, password }),
    })
    .then(response => {
        if (!response.ok) {
            // If response is not OK, throw an error
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert('User registered successfully!');
            window.location.href = 'login.html'; // Redirect to login page
        } else if (data.error) {
            if (data.error === 'Email already taken') {
                alert('The email address is already in use. Please use a different email.');
            } else if (data.error === 'Username already taken') {
                alert('The username is already in use. Please choose a different username.');
            } else {
                alert('Registration failed: ' + data.error);
            }
        }
    })
    .catch(error => {
        console.error('Error during registration:', error);
        alert('Something went wrong. Please try again.');
    });
}

// Add an event listener to the signup form to trigger the function
document.getElementById('signup-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the default form submission behavior

    // Get user input values
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const username = document.getElementById('username').value; // Get username input value
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Call the registerUser function
    registerUser(firstName, lastName, username, email, password);
});
