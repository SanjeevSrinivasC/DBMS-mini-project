// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- Select containers ---
    const movieContainer = document.getElementById('movie-listings-container');
    const sportsContainer = document.getElementById('sports-listings-container');
    const eventContainer = document.getElementById('event-listings-container');

    // --- DUMMY DATA (This would come from your backend/database) ---

    const dummyMovies = [
        {
            showId: 1,
            title: 'Dune: Part Two',
            venue: 'PVR Phoenix',
            city: 'Bangalore',
            screen: 'Screen 3 (IMAX)',
            startTime: '2025-11-06T19:00:00',
            price: 450.00
        },
        {
            showId: 2,
            title: 'Joker: Folie à Deux',
            venue: 'INOX Garuda',
            city: 'Bangalore',
            screen: 'Screen 1',
            startTime: '2025-11-06T20:30:00',
            price: 320.00
        }
    ];

    const dummySports = [
        {
            matchId: 1,
            team1: 'Royal Challengers Bangalore',
            team2: 'Chennai Super Kings',
            venue: 'M. Chinnaswamy Stadium',
            city: 'Bangalore',
            startTime: '2025-11-10T19:30:00',
            price: 1200.00
        }
    ];

    const dummyEvents = [
        {
            eventId: 1,
            name: 'Anuv Jain - Live Concert',
            category: 'Music',
            venue: 'Manpho Convention Centre',
            city: 'Bangalore',
            startTime: '2025-11-15T18:00:00',
            price: 800.00
        }
    ];

    // --- Functions to populate listings ---

    /**
     * Populates movie listings
     */
    function populateMovies() {
        movieContainer.innerHTML = ''; // Clear existing content
        
        dummyMovies.forEach(show => {
            const card = document.createElement('div');
            card.className = 'listing-card';
            
            // Format time for display
            const time = new Date(show.startTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            card.innerHTML = `
                <h3>${show.title}</h3>
                <div class="details">
                    <p><strong>Venue:</strong> ${show.venue} (${show.city})</p>
                    <p><strong>Screen:</strong> ${show.screen}</p>
                    <p><strong>Time:</strong> ${time}</p>
                    <p><strong>Price:</strong> ₹${show.price.toFixed(2)}</p>
                </div>
                <button class="book-btn" data-category="m" data-id="${show.showId}">Book Now</button>
            `;
            movieContainer.appendChild(card);
        });
    }

    /**
     * Populates sports listings
     */
    function populateSports() {
        sportsContainer.innerHTML = ''; // Clear existing content

        dummySports.forEach(match => {
            const card = document.createElement('div');
            card.className = 'listing-card';
            
            const time = new Date(match.startTime).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });

            card.innerHTML = `
                <h3>${match.team1} vs ${match.team2}</h3>
                <div class="details">
                    <p><strong>Venue:</strong> ${match.venue} (${match.city})</p>
                    <p><strong>Time:</strong> ${time}</p>
                    <p><strong>Price:</strong> ₹${match.price.toFixed(2)}</p>
                </div>
                <button class="book-btn" data-category="s" data-id="${match.matchId}">Book Now</button>
            `;
            sportsContainer.appendChild(card);
        });
    }

    /**
     * Populates event listings
     */
    function populateEvents() {
        eventContainer.innerHTML = ''; // Clear existing content

        dummyEvents.forEach(event => {
            const card = document.createElement('div');
            card.className = 'listing-card';
            
            const time = new Date(event.startTime).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });

            card.innerHTML = `
                <h3>${event.name}</h3>
                <div class="details">
                    <p><strong>Category:</strong> ${event.category}</p>
                    <p><strong>Venue:</strong> ${event.venue} (${event.city})</p>
                    <p><strong>Time:</strong> ${time}</p>
                    <p><strong>Price:</strong> ₹${event.price.toFixed(2)}</p>
                </div>
                <button class="book-btn" data-category="e" data-id="${event.eventId}">Book Now</button>
            `;
            eventContainer.appendChild(card);
        });
    }

    // --- Event Listener for "Book Now" buttons ---
    // We listen on the whole main area for clicks
    document.querySelector('main').addEventListener('click', (e) => {
        // Check if the clicked element is a book-btn
        if (e.target.classList.contains('book-btn')) {
            const category = e.target.dataset.category; // 'm', 's', or 'e'
            const id = e.target.dataset.id;           // The showId, matchId, or eventId
            
            // In a real application, this would probably open a new page
            // or a modal to select seats and number of tickets.
            alert(`Booking item from category '${category}' with ID ${id}. \n(This is where you would handle the booking logic)`);
        }
    });


    // --- Initial population of all sections ---
    populateMovies();
    populateSports();
    populateEvents();

});