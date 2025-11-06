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

// ** FIX: This is now a master list of all venues **
const sampleVenues = {
    // Movie Venues
    1: { VenueName: 'PVR Orion Mall', CityName: 'Bengaluru' },
    2: { VenueName: 'INOX Garuda Mall', CityName: 'Bengaluru' },
    // Event Venues
    3: { VenueName: 'Palace Grounds', CityName: 'Bengaluru' },
    4: { VenueName: 'Central Auditorium', CityName: 'Bengaluru' },
    5: { VenueName: 'Wonderla Amusement Park', CityName: 'Bengaluru' },
    // Sports Venues
    6: { VenueName: 'Chinnaswamy Stadium', CityName: 'Bengaluru' },
    7: { VenueName: 'Kanteerava Indoor Stadium', CityName: 'Bengaluru' }
};

const sampleMovies = [
    { MovieID: 1, Title: 'Hindi Movie', Language: 'Hindi', ImageURL: '/components/movies portable/poster2.jpg', Summary: 'A thrilling action movie.' },
    { MovieID: 2, Title: 'Telugu Movie', Language: 'Telugu', ImageURL: '/components/movies portable/poster3.jpg', Summary: 'A heartwarming family drama.' },
    { MovieID: 3, Title: 'English Movie', Language: 'English', ImageURL: '/components/movies portable/poster4.jpg', Summary: 'A hilarious comedy.' },
    { MovieID: 4, Title: 'Kannada Movie', Language: 'Kannada', ImageURL: '/components/movies portable/poster5.jpg', Summary: 'A suspenseful mystery.' }
];

const sampleShows = [
    // Pointing to movie venues (1 & 2)
    { ShowID: 101, MovieID: 1, VenueID: 1, ScreenInfo: 'Screen 1', StartTime: '2025-11-10T18:00:00', Price: 350.00 },
    { ShowID: 102, MovieID: 1, VenueID: 2, ScreenInfo: 'Audi 3', StartTime: '2025-11-10T19:00:00', Price: 400.00 },
    { ShowID: 103, MovieID: 2, VenueID: 1, ScreenInfo: 'Screen 2', StartTime: '2025-11-10T20:00:00', Price: 350.00 },
    { ShowID: 104, MovieID: 3, VenueID: 2, ScreenInfo: 'Screen 1', StartTime: '2025-11-11T17:00:00', Price: 450.00 },
    { ShowID: 105, MovieID: 4, VenueID: 1, ScreenInfo: 'Screen 5', StartTime: '2025-11-11T21:00:00', Price: 300.00 },
];

const sampleEvents = [
    // Pointing to event venues (3, 4, 5)
    { EventID: 1, Name: 'Amusement Park', Category: 'AP', ImageURL: '/flick-ticket-images-2/events-amusement-park2.png', Price: 750.00, StartTime: '2025-11-15T10:00:00', VenueID: 5 },
    { EventID: 2, Name: 'Stand-up Comedy', Category: 'SC', ImageURL: '/flick-ticket-images-2/events-comedy1.png', Price: 1200.00, StartTime: '2025-11-20T19:00:00', VenueID: 4 },
    { EventID: 3, Name: 'Concert', Category: 'MC', ImageURL: '/flick-ticket-images-2/events-music-1.jpg', Price: 2500.00, StartTime: '2025-11-25T20:00:00', VenueID: 3 },
    { EventID: 4, Name: 'Workshop', Category: 'WS', ImageURL: '/flick-ticket-images-2/event-ws-1.jpg', Price: 500.00, StartTime: '2025-12-01T14:00:00', VenueID: 4 }
];

const sampleSports = [
    // Pointing to sports venues (6, 7)
    { MatchID: 1, Team1ID: 'India', Team2ID: 'Australia', Category: 'C', ImageURL: '/flick-tickets-images/flick-tickets-sports/sports1.jpg', Price: 2000.00, StartTime: '2025-11-28T14:00:00', VenueID: 6 },
    { MatchID: 2, Team1ID: 'F1 Grand Prix', Team2ID: 'Main Event', Category: 'R', ImageURL: '/flick-tickets-images/flick-tickets-sports/sports2.jpg', Price: 5000.00, StartTime: '2025-11-29T12:00:00', VenueID: 6 }, // Re-using stadium
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

// GET single EVENT details
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

// GET single MOVIE details
app.get('/api/movie-details/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const movieSql = "SELECT * FROM Movie WHERE MovieID = ?";
        const [movieRows] = await pool.query(movieSql, [movieId]);
        const showsSql = `
            SELECT 
                s.ShowID, s.ScreenInfo, s.StartTime, s.Price,
                v.Name as VenueName,
                c.Name as CityName
            FROM Shows s
            JOIN Venue v ON s.VenueID = v.VenueID
            JOIN City c ON v.CityID = c.CityID
            WHERE s.MovieID = ?
        `;
        const [showsRows] = await pool.query(showsSql, [movieId]);

        if (movieRows.length > 0) {
            return res.status(200).json({ 
                success: true, 
                data: {
                    movie: movieRows[0],
                    shows: showsRows
                } 
            });
        }

        // Fallback to sample data
        const movie = sampleMovies.find(m => m.MovieID == movieId);
        if (movie) {
            const shows = sampleShows
                .filter(s => s.MovieID == movieId)
                .map(show => {
                    const venue = sampleVenues[show.VenueID] || { VenueName: 'TBC', CityName: 'TBC' }; // Fallback
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
        res.status(404).json({ success: false, message: 'Movie not found.' });
    } catch (error) {
        console.error('Error fetching movie details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch movie details.' });
    }
});

// GET single SPORT details
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
            const venue = sampleVenues[match.VenueID] || { VenueName: 'TBC', CityName: 'TBC' }; // Fallback
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

// API ENDPOINT FOR BOOKING
app.post('/api/book', async (req, res) => {
    try {
        const { username, bookingDetails } = req.body;
        if (!username || !bookingDetails) {
            return res.status(400).json({ success: false, message: 'Missing booking information.' });
        }
        const userSql = "SELECT UserID FROM Users WHERE Username = ?";
        const [users] = await pool.query(userSql, [username]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const userId = users[0].UserID;
        const { type, id, tickets, totalPrice } = bookingDetails;
        const categoryChar = type.charAt(0);
        const bookingSql = "INSERT INTO Booking (UserID, category, catId, NoOfTickets, TotalPrice) VALUES (?, ?, ?, ?, ?)";
        await pool.query(bookingSql, [userId, categoryChar, id, tickets, totalPrice]);
        console.log(`New booking created for UserID ${userId}: ${tickets} ticket(s) for ${type} ID ${id}`);
        res.status(201).json({ success: true, message: 'Booking successful!' });
    } catch (error)
    {
        console.error('Booking error:', error);
        res.status(500).json({ success: false, message: 'An error occurred during booking.' });
    }
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`🎉 Backend server running at http://localhost:${PORT}`);
});