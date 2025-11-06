const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const pool = require('./database'); // Import our MySQL connection from database.js

const app = express();
const PORT = 3000; // Your backend will run on this port

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
// ------------------

// --- API Endpoints for Auth ---
app.post('/api/signup', async (req, res) => {
    try {
        const { name, username, email, password, phone } = req.body;
        if (!name || !username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, Username, Email, and Password are required.' });
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const sql = "INSERT INTO Users (Name, Username, Email, PasswordHash, Phone) VALUES (?, ?, ?, ?, ?)";
        await pool.query(sql, [name, username, email, passwordHash, phone || null]);
        console.log(`New user created: ${username}`);
        res.status(201).json({ success: true, message: 'Account created successfully! You can now log in.' });
    } catch (error) {
        console.error('Signup error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ success: false, message: 'Username or email already exists.' });
        } else {
            res.status(500).json({ success: false, message: 'An error occurred on the server.' });
        }
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required.' });
        }
        const sql = "SELECT * FROM Users WHERE Username = ?";
        const [users] = await pool.query(sql, [username]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }
        console.log(`User logged in: ${user.Username}`);
        res.status(200).json({ 
            success: true, 
            message: 'Login successful!',
            username: user.Username 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'An error occurred on the server.' });
    }
});

// --- API Endpoints for Content ---

// --- Sample Data (for testing) ---
const sampleVenues = {
    1: { VenueName: 'PVR Orion Mall', CityName: 'Bengaluru' },
    2: { VenueName: 'INOX Garuda Mall', CityName: 'Bengaluru' },
    3: { VenueName: 'Palace Grounds', CityName: 'Bengaluru' },
    4: { VenueName: 'Central Auditorium', CityName: 'Bengaluru' },
    5: { VenueName: 'Wonderla Amusement Park', CityName: 'Bengaluru' },
    6: { VenueName: 'Chinnaswamy Stadium', CityName: 'Bengaluru' },
    7: { VenueName: 'Kanteerava Indoor Stadium', CityName: 'Bengaluru' }
};

const sampleMovies = [
    { MovieID: 1, Title: 'Hindi Movie', Language: 'Hindi', ImageURL: '/components/movies portable/poster2.jpg', Summary: 'A thrilling action movie.' },
    { MovieID: 2, Title: 'Telugu Movie', Language: 'Telugu', ImageURL: '/components/movies portable/poster3.jpg', Summary: 'A heartwarming family drama.' },
    { MovieID: 3, Title: 'English Movie', Language: 'English', ImageURL: '/components/movies portable/poster4.jpg', Summary: 'A hilarious comedy.' },
    { MovieID: 4, Title: 'Kannada Movie', Language: 'Kannada', ImageURL: '/components/movies portable/poster5.jpg', Summary: 'A suspenseful mystery.' }
];

// ** THIS IS YOUR NEW HARDCODED SHOWS LIST **
// It will be used for ANY movie you add via the admin panel.
const hardcodedShows = [
    { 
        ShowID: 9001, // A fake ID so we can book it
        VenueID: 1, 
        ScreenInfo: 'Screen 1', 
        StartTime: '2025-12-01T18:00:00', // 6:00 PM
        Price: 350.00,
        VenueName: sampleVenues[1].VenueName, 
        CityName: sampleVenues[1].CityName
    },
    { 
        ShowID: 9002, // A fake ID
        VenueID: 2, 
        ScreenInfo: 'Audi 3', 
        StartTime: '2025-12-01T21:00:00', // 9:00 PM
        Price: 400.00,
        VenueName: sampleVenues[2].VenueName,
        CityName: sampleVenues[2].CityName
    }
];

// This is still used as a fallback if the movie isn't in the DB at all
const sampleShows = [
    { ShowID: 101, MovieID: 1, VenueID: 1, ScreenInfo: 'Screen 1', StartTime: '2025-11-10T18:00:00', Price: 350.00 },
    { ShowID: 102, MovieID: 1, VenueID: 2, ScreenInfo: 'Audi 3', StartTime: '2025-11-10T19:00:00', Price: 400.00 },
];

const sampleEvents = [
    { EventID: 1, Name: 'Amusement Park', Category: 'AP', ImageURL: '/flick-ticket-images-2/events-amusement-park2.png', Price: 750.00, StartTime: '2025-11-15T10:00:00', VenueID: 5 },
    { EventID: 2, Name: 'Stand-up Comedy', Category: 'SC', ImageURL: '/flick-ticket-images-2/events-comedy1.png', Price: 1200.00, StartTime: '2025-11-20T19:00:00', VenueID: 4 },
    { EventID: 3, Name: 'Concert', Category: 'MC', ImageURL: '/flick-ticket-images-2/events-music-1.jpg', Price: 2500.00, StartTime: '2025-11-25T20:00:00', VenueID: 3 },
    { EventID: 4, Name: 'Workshop', Category: 'WS', ImageURL: '/flick-ticket-images-2/event-ws-1.jpg', Price: 500.00, StartTime: '2025-12-01T14:00:00', VenueID: 4 }
];

const sampleSports = [
    { MatchID: 1, Team1ID: 'India', Team2ID: 'Australia', Category: 'C', ImageURL: '/flick-tickets-images/flick-tickets-sports/sports1.jpg', Price: 2000.00, StartTime: '2025-11-28T14:00:00', VenueID: 6 },
    { MatchID: 2, Team1ID: 'F1 Grand Prix', Team2ID: 'Main Event', Category: 'R', ImageURL: '/flick-tickets-images/flick-tickets-sports/sports2.jpg', Price: 5000.00, StartTime: '2025-11-29T12:00:00', VenueID: 6 }, 
    { MatchID: 3, Team1ID: 'Man United', Team2ID: 'Chelsea', Category: 'F', ImageURL: '/flick-tickets-images/flick-tickets-sports/sports7.jpg', Price: 3000.00, StartTime: '2025-11-30T20:00:00', VenueID: 7 },
    { MatchID: 4, Team1ID: 'Pro Kabaddi', Team2ID: 'Finals', Category: 'OTH', ImageURL: '/flick-tickets-images/flick-tickets-sports/sports5.jpg', Price: 800.00, StartTime: '2025-12-02T19:00:00', VenueID: 7 }
];
// --- End Sample Data ---

app.get('/api/movies', async (req, res) => {
    try {
        const [movies] = await pool.query("SELECT * FROM Movie");
        if (movies.length === 0) {
            return res.status(200).json({ success: true, data: sampleMovies });
        }
        res.status(200).json({ success: true, data: movies });
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch movies.' });
    }
});

app.get('/api/sports', async (req, res) => {
    try {
        const [sports] = await pool.query("SELECT * FROM SportsMatch");
        if (sports.length === 0) {
            return res.status(200).json({ success: true, data: sampleSports });
        }
        res.status(200).json({ success: true, data: sports });
    } catch (error) {
        console.error('Error fetching sports:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch sports.' });
    }
});

app.get('/api/events', async (req, res) => {
    try {
        const [events] = await pool.query("SELECT * FROM Events");
        if (events.length === 0) {
            return res.status(200).json({ success: true, data: sampleEvents });
        }
        res.status(200).json({ success: true, data: events });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch events.' });
    }
});

app.get('/api/event-details/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        const sql = `
            SELECT e.Name as EventName, e.Category, e.Price, e.StartTime, v.Name as VenueName, c.Name as CityName
            FROM Events e
            JOIN Venue v ON e.VenueID = v.VenueID
            JOIN City c ON v.CityID = c.CityID
            WHERE e.EventID = ?
        `;
        const [rows] = await pool.query(sql, [eventId]);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows[0] });
        }

        // Fallback to sample data
        const event = sampleEvents.find(e => e.EventID == eventId);
        if (event) {
            const venue = sampleVenues[event.VenueID] || { VenueName: 'TBC', CityName: 'TBC' }; // Fallback
            const eventDetails = {
                EventName: event.Name, Category: event.Category, Price: event.Price,
                StartTime: event.StartTime, ImageURL: event.ImageURL,
                VenueName: venue.VenueName, CityName: venue.CityName
            };
            return res.status(200).json({ success: true, data: eventDetails });
        }
        res.status(404).json({ success: false, message: 'Event not found.' });
    } catch (error) {
        console.error('Error fetching event details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch event details.' });
    }
});

// --- THIS IS THE CORRECTED /api/movie-details/:id ENDPOINT ---
app.get('/api/movie-details/:id', async (req, res) => {
    try {
        const movieId = req.params.id;

        // Query 1: Get the movie's main info
        const movieSql = "SELECT * FROM Movie WHERE MovieID = ?";
        const [movieRows] = await pool.query(movieSql, [movieId]);

        // Check if the REAL movie was found
        if (movieRows.length > 0) {
            // REAL MOVIE FOUND! (e.g., "KGF")
            const movie = movieRows[0];
            
            // **THIS IS THE NEW LOGIC**
            // Instead of querying the 'Shows' table, just send the hardcoded list.
            return res.status(200).json({ 
                success: true, 
                data: {
                    movie: movie,
                    shows: hardcodedShows // Send the hardcoded shows
                } 
            });
        }

        // **Fallback to sample data**
        // This code will now *only* run if the movie ID was not in the database.
        const movie = sampleMovies.find(m => m.MovieID == movieId);
        if (movie) {
            const shows = sampleShows
                .filter(s => s.MovieID == movieId)
                .map(show => {
                    const venue = sampleVenues[show.VenueID] || { VenueName: 'TBC', CityName: 'TBC' };
                    return {
                        ...show,
                        VenueName: venue.VenueName,
                        CityName: venue.CityName
                    };
                });
            
            return res.status(200).json({
                success: true,
                data: {
                    movie: movie,
                    shows: shows
                }
            });
        }

        // Not found in DB or samples.
        res.status(404).json({ success: false, message: 'Movie not found.' });

    } catch (error) {
        console.error('Error fetching movie details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch movie details.' });
    }
});

app.get('/api/sport-details/:id', async (req, res) => {
    try {
        const matchId = req.params.id;
        const sql = `
            SELECT 
                sm.Team1ID, sm.Team2ID, sm.Price, sm.StartTime,
                v.Name as VenueName,
                c.Name as CityName
            FROM SportsMatch sm
            JOIN Venue v ON sm.VenueID = v.VenueID
            JOIN City c ON v.CityID = c.CityID
            WHERE sm.MatchID = ?
        `;
        const [rows] = await pool.query(sql, [matchId]);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows[0] });
        }

        // Fallback to sample data
        const match = sampleSports.find(s => s.MatchID == matchId);
        if (match) {
            const venue = sampleVenues[match.VenueID] || { VenueName: 'TBC', CityName: 'TBC' }; 
            const matchDetails = {
                Team1ID: match.Team1ID,
                Team2ID: match.Team2ID,
                Price: match.Price,
                StartTime: match.StartTime,
                ImageURL: match.ImageURL,
                Category: match.Category,
                VenueName: venue.VenueName,
                CityName: venue.CityName
            };
            return res.status(200).json({ success: true, data: matchDetails });
        }
        res.status(404).json({ success: false, message: 'Match not found.' });
    } catch (error) {
        console.error('Error fetching sport details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch sport details.' });
    }
});

app.post('/api/book', async (req, res) => {
    try {
        const { username, bookingDetails } = req.body;
        if (!username || !bookingDetails) {
            return res.status(400).json({ success: false, message: 'Missing booking information.' });
        }
        const { type, id, tickets, totalPrice } = bookingDetails;
        const categoryChar = type.charAt(0);
        
        // Call the Stored Procedure
        const sql = "CALL sp_CreateBooking(?, ?, ?, ?, ?)";
        await pool.query(sql, [username, categoryChar, id, tickets, totalPrice]);

        console.log(`New booking created via procedure for ${username}: ${tickets} ticket(s) for ${type} ID ${id}`);
        res.status(201).json({ success: true, message: 'Booking successful!' });
    } catch (error)
    {
        console.error('Booking error:', error);
        res.status(500).json({ success: false, message: 'An error occurred during booking.' });
    }
});

app.get('/api/my-profile', async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) {
            return res.status(400).json({ success: false, message: 'Username is required.' });
        }
        const userSql = "SELECT Name, Email, Phone, Username FROM Users WHERE Username = ?";
        const [userRows] = await pool.query(userSql, [username]);
        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const bookingSql = `
            SELECT 
                BookingID, 
                NoOfTickets, 
                TotalPrice, 
                BookingTime, 
                fn_GetItemName(category, catId) AS ItemName
            FROM Booking b
            JOIN Users u ON b.UserID = u.UserID
            WHERE u.Username = ?
            ORDER BY b.BookingTime DESC
        `;
        const [bookingRows] = await pool.query(bookingSql, [username]);
        res.status(200).json({
            success: true,
            data: {
                userDetails: userRows[0],
                bookingHistory: bookingRows
            }
        });
    } catch (error) {
        console.error('My Profile error:', error);
        res.status(500).json({ success: false, message: 'An error occurred fetching profile data.' });
    }
});

// --- Admin API Endpoints ---

app.post('/api/add/movie', async (req, res) => {
    try {
        const { title, summary, language, imageUrl } = req.body;
        if (!title || !language) {
            return res.status(400).json({ success: false, message: 'Title and Language are required.' });
        }
        const sql = "INSERT INTO Movie (Title, Summary, Language, ImageURL) VALUES (?, ?, ?, ?)";
        await pool.query(sql, [title, summary, language, imageUrl]);
        console.log(`ADMIN: New movie added: ${title}`);
        res.status(201).json({ success: true, message: 'Movie added successfully!' });
    } catch (error) {
        console.error('Admin add movie error:', error);
        res.status(500).json({ success: false, message: 'Failed to add movie.' });
    }
});

app.post('/api/add/sport', async (req, res) => {
    try {
        const { team1, team2, price, imageUrl, category } = req.body;
        if (!team1) {
            return res.status(400).json({ success: false, message: 'Team 1 is required.' });
        }
        const sql = "INSERT INTO SportsMatch (Team1ID, Team2ID, Price, ImageURL, Category) VALUES (?, ?, ?, ?, ?)";
        await pool.query(sql, [team1, team2, price, imageUrl, category]);
        console.log(`ADMIN: New sport added: ${team1} vs ${team2}`);
        res.status(201).json({ success: true, message: 'Sport added successfully!' });
    } catch (error) {
        console.error('Admin add sport error:', error);
        res.status(500).json({ success: false, message: 'Failed to add sport.' });
    }
});

app.post('/api/add/event', async (req, res) => {
    try {
        const { name, category, price, imageUrl } = req.body;
        if (!name || !category) {
            return res.status(400).json({ success: false, message: 'Name and Category are required.' });
        }
        const sql = "INSERT INTO Events (Name, Category, Price, ImageURL) VALUES (?, ?, ?, ?)";
        await pool.query(sql, [name, category, price, imageUrl]);
        console.log(`ADMIN: New event added: ${name}`);
        res.status(201).json({ success: true, message: 'Event added successfully!' });
    } catch (error) {
        console.error('Admin add event error:', error);
        res.status(500).json({ success: false, message: 'Failed to add event.' });
    }
});


// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`🎉 Backend server running at http://localhost:${PORT}`);
});