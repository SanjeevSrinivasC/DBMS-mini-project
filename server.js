const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const pool = require('./database'); // Import our MySQL connection from database.js

const app = express();
const PORT = 3000; // Your backend will run on this port

// --- Middleware ---
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
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
    1: { VenueID: 1, Name: 'PVR Orion Mall', CityName: 'Bengaluru' },
    2: { VenueID: 2, Name: 'INOX Garuda Mall', CityName: 'Bengaluru' },
    3: { VenueID: 3, Name: 'Palace Grounds', CityName: 'Bengaluru' },
    4: { VenueID: 4, Name: 'Central Auditorium', CityName: 'Bengaluru' },
    5: { VenueID: 5, Name: 'Wonderla Amusement Park', CityName: 'Bengaluru' },
    6: { VenueID: 6, Name: 'Chinnaswamy Stadium', CityName: 'Bengaluru' },
    7: { VenueID: 7, Name: 'Kanteerava Indoor Stadium', CityName: 'Bengaluru' }
};
const hardcodedShows = [
    { ShowID: 9001, VenueID: 1, ScreenInfo: 'Screen 1', StartTime: '2025-12-01T18:00:00', Price: 350.00, VenueName: sampleVenues[1].Name, CityName: sampleVenues[1].CityName },
    { ShowID: 9002, VenueID: 2, ScreenInfo: 'Audi 3', StartTime: '2025-12-01T21:00:00', Price: 400.00, VenueName: sampleVenues[2].Name, CityName: sampleVenues[2].CityName }
];
// --- End Sample Data ---

// --- GET APIs ---
app.get('/api/movies', async (req, res) => {
    try {
        const [movies] = await pool.query("SELECT * FROM Movie");
        res.status(200).json({ success: true, data: movies });
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch movies.' });
    }
});

app.get('/api/sports', async (req, res) => {
    try {
        const [sports] = await pool.query("SELECT * FROM SportsMatch");
        res.status(200).json({ success: true, data: sports });
    } catch (error) {
        console.error('Error fetching sports:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch sports.' });
    }
});

app.get('/api/events', async (req, res) => {
    try {
        const [events] = await pool.query("SELECT * FROM Events");
        res.status(200).json({ success: true, data: events });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch events.' });
    }
});

app.get('/api/venues', async (req, res) => {
    try {
        const [venues] = await pool.query("SELECT * FROM Venue");
        if (venues.length === 0) {
            return res.status(200).json({ success: true, data: Object.values(sampleVenues) });
        }
        res.status(200).json({ success: true, data: venues });
    } catch (error) {
        console.error('Error fetching venues:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch venues.' });
    }
});


// --- Detail APIs ---
app.get('/api/event-details/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        // Use LEFT JOIN in case VenueID is NULL
        const sql = `
            SELECT 
                e.EventID, e.Name as EventName, e.Category, e.Price, e.StartTime, e.ImageURL,
                v.Name as VenueName,
                c.Name as CityName
            FROM Events e
            LEFT JOIN Venue v ON e.VenueID = v.VenueID
            LEFT JOIN City c ON v.CityID = c.CityID
            WHERE e.EventID = ?
        `;
        const [rows] = await pool.query(sql, [eventId]);

        if (rows.length > 0) {
            // Send the real data, even if VenueName is NULL
            return res.status(200).json({ success: true, data: rows[0] });
        }
        
        res.status(404).json({ success: false, message: 'Event not found.' });
    } catch (error) {
        console.error('Error fetching event details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch event details.' });
    }
});

app.get('/api/movie-details/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const movieSql = "SELECT * FROM Movie WHERE MovieID = ?";
        const [movieRows] = await pool.query(movieSql, [movieId]);
        if (movieRows.length > 0) {
            const movie = movieRows[0];
            return res.status(200).json({ 
                success: true, 
                data: {
                    movie: movie,
                    shows: hardcodedShows // Send the hardcoded shows
                } 
            });
        }
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
                sm.MatchID, sm.Team1ID, sm.Team2ID, sm.Price, sm.StartTime, sm.ImageURL, sm.Category,
                v.Name as VenueName,
                c.Name as CityName
            FROM SportsMatch sm
            LEFT JOIN Venue v ON sm.VenueID = v.VenueID
            LEFT JOIN City c ON v.CityID = c.CityID
            WHERE sm.MatchID = ?
        `;
        const [rows] = await pool.query(sql, [matchId]);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows[0] });
        }
        
        res.status(404).json({ success: false, message: 'Match not found.' });
    } catch (error) {
        console.error('Error fetching sport details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch sport details.' });
    }
});

// --- Booking & Profile APIs ---
app.post('/api/book', async (req, res) => {
    try {
        const { username, bookingDetails } = req.body;
        if (!username || !bookingDetails) {
            return res.status(400).json({ success: false, message: 'Missing booking information.' });
        }
        const { type, id, tickets, totalPrice } = bookingDetails;
        const categoryChar = type.charAt(0);
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
        const { team1, team2, price, imageUrl, category, venueId } = req.body;
        if (!team1) {
            return res.status(400).json({ success: false, message: 'Team 1 is required.' });
        }
        const sql = "INSERT INTO SportsMatch (Team1ID, Team2ID, Price, ImageURL, Category, VenueID) VALUES (?, ?, ?, ?, ?, ?)";
        await pool.query(sql, [team1, team2, price, imageUrl, category, venueId || null]);
        console.log(`ADMIN: New sport added: ${team1} vs ${team2}`);
        res.status(201).json({ success: true, message: 'Sport added successfully!' });
    } catch (error) {
        console.error('Admin add sport error:', error);
        res.status(500).json({ success: false, message: 'Failed to add sport.' });
    }
});

app.post('/api/add/event', async (req, res) => {
    try {
        const { name, category, price, imageUrl, venueId } = req.body;
        if (!name || !category) {
            return res.status(400).json({ success: false, message: 'Name and Category are required.' });
        }
        const sql = "INSERT INTO Events (Name, Category, Price, ImageURL, VenueID) VALUES (?, ?, ?, ?, ?)";
        await pool.query(sql, [name, category, price, imageUrl, venueId || null]);
        console.log(`ADMIN: New event added: ${name}`);
        res.status(201).json({ success: true, message: 'Event added successfully!' });
    } catch (error) {
        console.error('Admin add event error:', error);
        res.status(500).json({ success: false, message: 'Failed to add event.' });
    }
});

app.delete('/api/delete/movie/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM Movie WHERE MovieID = ?", [id]);
        console.log(`ADMIN: Deleted MovieID: ${id}`);
        res.status(200).json({ success: true, message: 'Movie deleted.' });
    } catch (error) {
        console.error('Admin delete movie error:', error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ success: false, message: 'Cannot delete. This movie is referenced by shows or bookings.' });
        }
        res.status(500).json({ success: false, message: 'Failed to delete movie.' });
    }
});

app.delete('/api/delete/sport/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM SportsMatch WHERE MatchID = ?", [id]);
        console.log(`ADMIN: Deleted MatchID: ${id}`);
        res.status(200).json({ success: true, message: 'Sport deleted.' });
    } catch (error) {
        console.error('Admin delete sport error:', error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ success: false, message: 'Cannot delete. This match is referenced by bookings.' });
        }
        res.status(500).json({ success: false, message: 'Failed to delete sport.' });
    }
});

app.delete('/api/delete/event/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM Events WHERE EventID = ?", [id]);
        console.log(`ADMIN: Deleted EventID: ${id}`);
        res.status(200).json({ success: true, message: 'Event deleted.' });
    } catch (error) {
        console.error('Admin delete event error:', error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ success: false, message: 'Cannot delete. This event is referenced by bookings.' });
        }
        res.status(500).json({ success: false, message: 'Failed to delete event.' });
    }
});


// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`🎉 Backend server running at http://localhost:${PORT}`);
});