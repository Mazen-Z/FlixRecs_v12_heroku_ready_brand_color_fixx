// login.js (Frontend)

// Event listener for the login form submission
document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Send POST request to the backend to log in
    fetch('http://localhost:5001/login/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response data:', data);

        if (data.success) {
            // Store the JWT token and user info in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('firstName', data.user.firstName);
            alert('Login successful!');
            window.location.href = 'dashboard.html';
        } else if (data.error === 'Account locked') {
            // Notify the user that their account is locked
            alert('Your account has been locked due to too many failed attempts. Check your email for a reset link.');
            // Redirect to the reset password page
            window.location.href = 'reset-password.html';
        } else {
            // General login failure
            alert('Login failed: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error during login:', error);
        alert('Something went wrong, please try again later.');
    });
});

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('firstName');
    window.location.href = 'login.html';
}
