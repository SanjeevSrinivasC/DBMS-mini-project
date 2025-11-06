// Wait for the page to load
document.addEventListener('DOMContentLoaded', () => {
    
    // Find the form on the page
    const signupForm = document.getElementById('signup-form');
    
    // Add a 'submit' listener to the form
    signupForm.addEventListener('submit', async (event) => {
        
        event.preventDefault(); // Stop the form from refreshing the page

        // Get all the values from the form
        const name = document.getElementById('name').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        const messageEl = document.getElementById('message');

        // 1. Frontend check: Do the passwords match?
        if (password !== confirmPassword) {
            messageEl.textContent = 'Passwords do not match.';
            messageEl.className = 'error';
            messageEl.style.display = 'block';
            return;
        }

        try {
            // 2. Send the data to the backend API
            // The '/api/signup' path is handled by your server.js
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    username: username,
                    email: email,
                    password: password,
                    phone: phone
                })
            });

            const data = await response.json();

            // 3. Show the server's response (success or error)
            if (response.ok) { // 'ok' means status 200-299
                messageEl.textContent = data.message;
                messageEl.className = 'success';
                messageEl.style.display = 'block';
                
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    // Go to the login page (it's in the same folder)
                    window.location.href = 'flick-tickets-login.html'; 
                }, 2000);
            } else {
                // Show the error (e.g., "Username already exists")
                messageEl.textContent = data.message; 
                messageEl.className = 'error';
                messageEl.style.display = 'block';
            }

        } catch (error) {
            console.error('Signup error:', error);
            messageEl.textContent = 'An error occurred. Please try again.';
            messageEl.className = 'error';
            messageEl.style.display = 'block';
        }
    });
});