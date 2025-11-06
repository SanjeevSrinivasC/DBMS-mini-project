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

        // 3. Create "Hi, [username]" text
        const welcomeText = document.createElement('span');
        welcomeText.textContent = `Hi, ${username}`;
        welcomeText.style.color = '#fff';
        welcomeText.style.fontWeight = '500';
        welcomeText.style.margin = '0 0.5rem';

        // 4. *** NEW "My Profile" LINK ***
        const profileLink = document.createElement('a');
        profileLink.textContent = 'My Profile';
        // This path is root-relative, assuming you'll save my-profile.html in the login folder
        profileLink.href = '/components/flick-tickets-login/my-profile.html';
        profileLink.style.color = '#fff';
        profileLink.style.fontWeight = '500';
        profileLink.style.margin = '0 0.5rem';
        profileLink.style.textDecoration = 'underline';

        // 5. Create a "Logout" link
        const logoutLink = document.createElement('a');
        logoutLink.textContent = 'Logout';
        logoutLink.href = '#';
        logoutLink.style.color = '#fff';
        logoutLink.style.fontWeight = '500';
        logoutLink.style.margin = '0 0.5rem';
        logoutLink.style.textDecoration = 'underline';
        
        // 6. Add the click event to log out
        logoutLink.onclick = (e) => {
            e.preventDefault(); // Stop link from jumping
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            window.location.reload();
        };

        // 7. Re-create the Menu icon
        const menuIcon = document.createElement('span');
        menuIcon.textContent = '☰';
        menuIcon.style.cursor = 'pointer';

        // 8. Add all the new elements back to the container
        //    in the correct order
        iconsContainer.appendChild(searchIcon);
        iconsContainer.appendChild(welcomeText);
        iconsContainer.appendChild(profileLink); // <-- ADDED
        iconsContainer.appendChild(logoutLink);
        iconsContainer.appendChild(menuIcon);
    }
});