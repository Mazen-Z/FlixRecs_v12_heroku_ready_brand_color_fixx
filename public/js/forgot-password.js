document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;

    try {
        const response = await fetch('http://localhost:5001/password/api/forgot-password', {
            method: 'POST',
            
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
        } else {
            alert(data.message || 'Something went wrong');
        }
    } catch (error) {
        console.error('Error sending reset email:', error);
        alert('An error occurred. Please try again later.');
    }
});
