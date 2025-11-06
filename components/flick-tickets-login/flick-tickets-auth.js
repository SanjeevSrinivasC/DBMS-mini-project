document.addEventListener('DOMContentLoaded', () => {
    
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    // Find the container for ALL the icons
    const iconsContainer = document.querySelector('.header .icons');

    if (isLoggedIn === 'true' && iconsContainer) {
        
        // Get the username we saved
        const username = localStorage.getItem('username');

        // 1. Clear the *entire* icons container (🔍, 👤, ☰)
        iconsContainer.innerHTML = '';
        
        // 2. Re-create the Search icon
        const searchIcon = document.createElement('span');
        searchIcon.textContent = '🔍';
        searchIcon.style.cursor = 'pointer';
        // You can add a click event here for search if you want
        // searchIcon.onclick = () => { alert('Search clicked!'); };

        // 3. Create "Hi, [username]" text
        const welcomeText = document.createElement('span');
        welcomeText.textContent = `Hi, ${username}`;
        // Apply styles to match your other header links
        welcomeText.style.color = '#fff';
        welcomeText.style.fontWeight = '500';
        welcomeText.style.margin = '0 0.5rem';

        // 4. Create a "Logout" link
        const logoutLink = document.createElement('a');
        logoutLink.textContent = 'Logout';
        logoutLink.href = '#';
        // Apply styles to match your other header links
        logoutLink.style.color = '#fff';
        logoutLink.style.fontWeight = '500';
        logoutLink.style.margin = '0 0.5rem';
        logoutLink.style.textDecoration = 'underline';
        
        // 5. Add the click event to log out
        logoutLink.onclick = (e) => {
            e.preventDefault(); // Stop link from jumping
            
            // Clear the login status
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            
            // Reload the page to reset the state
            window.location.reload();
        };

        // 6. Re-create the Menu icon
        const menuIcon = document.createElement('span');
        menuIcon.textContent = '☰';
        menuIcon.style.cursor = 'pointer';
        // You can add a click event for the menu here
        // menuIcon.onclick = () => { alert('Menu clicked!'); };

        // 7. Add all the new elements back to the container
        //    in the correct order
        iconsContainer.appendChild(searchIcon);
        iconsContainer.appendChild(welcomeText);
        iconsContainer.appendChild(logoutLink);
        iconsContainer.appendChild(menuIcon);
    }
    // If not logged in, the script does nothing, and the
    // default HTML (🔍, 👤, ☰) from your .html file is used.
});