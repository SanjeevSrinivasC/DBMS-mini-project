document.addEventListener('DOMContentLoaded', () => {
    
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Stop the form from refreshing

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const messageEl = document.getElementById('message');

        try {
            // Call your backend API
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                messageEl.textContent = 'Login successful! Redirecting...';
                messageEl.className = 'success';
                messageEl.style.display = 'block';

                // --- THIS IS THE IMPORTANT PART ---
                // Save the login state and username in the browser
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', data.username);
                // ------------------------------------

                // Redirect to the homepage after 1 second
                setTimeout(() => {
                    // Use the correct path to your homepage
                    window.location.href = '/components/flick-tickets-homepage/flick-tickets-home.html';
                }, 1000);

            } else {
                // Show error (e.g., "Invalid username or password")
                messageEl.textContent = data.message;
                messageEl.className = 'error';
                messageEl.style.display = 'block';
            }

        } catch (error) {
            console.error('Login error:', error);
            messageEl.textContent = 'An error occurred. Please try again.';
            messageEl.className = 'error';
            messageEl.style.display = 'block';
        }
    });
});