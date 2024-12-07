document.getElementById('reset-password-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const token = new URLSearchParams(window.location.search).get('token');
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate if the passwords match
    if (newPassword !== confirmPassword) {
        console.log("BADDDDD")
        alert('Passwords do not match.');
        return;
    }

    // Validate password strength using regex
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        alert('Password must be at least 8 characters long, and include at least one letter, one number, and one special character.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5001/password/api/reset-password/${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword })
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            window.location.href = '/html/login.html';
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        alert('An error occurred. Please try again.');
    }
});


const form = document.getElementById('reset-password-form');
const token = window.location.pathname.split('/').pop(); // Extract token from URL

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Check if passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
    }

    // Validate password strength using regex
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        alert('Password must be at least 8 characters long, and include at least one letter, one number, and one special character.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5001/password/api/reset-password/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newPassword: password }),
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message); // Show success message
            window.location.href = '/html/login.html'; // Redirect to login page
        } else {
            alert(data.message || 'Error resetting password');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});
