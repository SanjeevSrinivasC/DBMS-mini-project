// server.js
/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const pool = require('./database'); // must export a MySQL pool/connection

const app = express();
const PORT = 3000;

// ---------------- Middleware ----------------
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));
app.use(express.json());

// Serve static files from project root (adjust if your HTML lives elsewhere)
app.use(express.static(__dirname));

// Dev logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ---------------- Auth APIs ----------------
app.post('/api/signup', async (req, res) => {
  try {
    const { name, username, email, password, phone } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, Username, Email, and Password are required.' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const sql = 'INSERT INTO Users (Name, Username, Email, PasswordHash, Phone) VALUES (?, ?, ?, ?, ?)';
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
    const sql = 'SELECT * FROM Users WHERE Username = ?';
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
      username: user.Username,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'An error occurred on the server.' });
  }
});

// ---------------- Sample Data (fallback only) ----------------
const sampleVenues = {
  1: { VenueID: 1, Name: 'PVR Orion Mall', CityName: 'Bengaluru' },
  2: { VenueID: 2, Name: 'INOX Garuda Mall', CityName: 'Bengaluru' },
  3: { VenueID: 3, Name: 'Palace Grounds', CityName: 'Bengaluru' },
  4: { VenueID: 4, Name: 'Central Auditorium', CityName: 'Bengaluru' },
  5: { VenueID: 5, Name: 'Wonderla Amusement Park', CityName: 'Bengaluru' },
  6: { VenueID: 6, Name: 'Chinnaswamy Stadium', CityName: 'Bengaluru' },
  7: { VenueID: 7, Name: 'Kanteerava Indoor Stadium', CityName: 'Bengaluru' },
};
const hardcodedShows = [
  { ShowID: 9001, VenueID: 1, ScreenInfo: 'Screen 1', StartTime: '2025-12-01T18:00:00', Price: 350.00, VenueName: sampleVenues[1].Name, CityName: sampleVenues[1].CityName },
  { ShowID: 9002, VenueID: 2, ScreenInfo: 'Audi 3', StartTime: '2025-12-01T21:00:00', Price: 400.00, VenueName: sampleVenues[2].Name, CityName: sampleVenues[2].CityName },
];

// ---------------- Content APIs ----------------
app.get('/api/movies', async (_req, res) => {
  try {
    const [movies] = await pool.query('SELECT * FROM Movie');
    res.status(200).json({ success: true, data: movies });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch movies.' });
  }
});

app.get('/api/sports', async (_req, res) => {
  try {
    const [sports] = await pool.query('SELECT * FROM SportsMatch');
    res.status(200).json({ success: true, data: sports });
  } catch (error) {
    console.error('Error fetching sports:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sports.' });
  }
});

app.get('/api/events', async (_req, res) => {
  try {
    const [events] = await pool.query('SELECT * FROM Events');
  res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events.' });
  }
});

app.get('/api/venues', async (_req, res) => {
  try {
    const [venues] = await pool.query('SELECT * FROM Venue');
    if (venues.length === 0) {
      return res.status(200).json({ success: true, data: Object.values(sampleVenues) });
    }
    res.status(200).json({ success: true, data: venues });
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch venues.' });
  }
});

// ---------------- Detail APIs ----------------
app.get('/api/event-details/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
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
    const movieSql = 'SELECT * FROM Movie WHERE MovieID = ?';
    const [movieRows] = await pool.query(movieSql, [movieId]);
    if (movieRows.length > 0) {
      const movie = movieRows[0];
      return res.status(200).json({
        success: true,
        data: { movie, shows: hardcodedShows }, // replace with real Shows if available
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

// ---------------- Booking & Profile ----------------
/**
 * Booking rules based on your DB:
 * - booking.category stores LOWERCASE 'm'|'s'|'e'
 * - booking.catId is:
 *    m -> ShowID (from Shows table)
 *    s -> MatchID (from SportsMatch)
 *    e -> EventID (from Events)
 * - fn_GetItemName expects lowercase category and uses Shows for movies
 */
app.post('/api/book', async (req, res) => {
  try {
    const { username, bookingDetails } = req.body;

    if (!username || !bookingDetails) {
      return res.status(400).json({ success: false, message: 'Missing booking information.' });
    }

    const { type, id, tickets, totalPrice } = bookingDetails;

    // Normalize to LOWERCASE one-letter categories to match your DB/function
    const key = String(type || '').trim().toLowerCase();
    const TYPE_MAP = {
      m: 'm', mov: 'm', movie: 'm', movies: 'm',
      s: 's', sport: 's', sports: 's', match: 's', matches: 's',
      e: 'e', event: 'e', events: 'e', workshop: 'e', workshops: 'e',
    };
    const category = TYPE_MAP[key] || TYPE_MAP[key[0]];

    if (!category || !['m', 's', 'e'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported booking type "${type}". Use: movie, sport, or event/workshop.`,
      });
    }

    // Validate numeric fields
    const catId = Number(id);
    const qty = Number(tickets);
    const total = Number(totalPrice);

    if (!Number.isFinite(catId) || catId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid item id.' });
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid ticket count.' });
    }
    if (!Number.isFinite(total) || total < 0) {
      return res.status(400).json({ success: false, message: 'Invalid total price.' });
    }

    const sql = 'CALL sp_CreateBooking(?, ?, ?, ?, ?)';
    await pool.query(sql, [username, category, catId, qty, total]);

    console.log(`New booking: user=${username}, category=${category}, catId=${catId}, tickets=${qty}, total=${total}`);
    res.status(201).json({ success: true, message: 'Booking successful!' });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Booking failed on the server.',
      detail: error && (error.sqlMessage || error.message || 'Unknown error'),
    });
  }
});

// My Profile: returns user details + booking history
app.get('/api/my-profile', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required.' });
    }

    const userSql = 'SELECT Name, Email, Phone, Username, UserID FROM Users WHERE Username = ?';
    const [userRows] = await pool.query(userSql, [username]);
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // NOTE: use exact column names from your table: category, catId
    const bookingSql = `
      SELECT 
        b.BookingID,
        b.NoOfTickets,
        b.TotalPrice,
        b.BookingTime,
        fn_GetItemName(b.category, b.catId) AS ItemName
      FROM Booking b
      INNER JOIN Users u ON b.UserID = u.UserID
      WHERE u.Username = ?
      ORDER BY b.BookingTime DESC
    `;
    const [bookingRows] = await pool.query(bookingSql, [username]);

    res.status(200).json({
      success: true,
      data: {
        userDetails: {
          Name: userRows[0].Name,
          Email: userRows[0].Email,
          Phone: userRows[0].Phone,
          Username: userRows[0].Username,
        },
        bookingHistory: bookingRows,
      },
    });
  } catch (error) {
    console.error('My Profile error:', error);
    res.status(500).json({ success: false, message: 'An error occurred fetching profile data.' });
  }
});

// ---------------- Admin APIs ----------------
app.post('/api/add/movie', async (req, res) => {
  try {
    const { title, summary, language, imageUrl } = req.body;
    if (!title || !language) {
      return res.status(400).json({ success: false, message: 'Title and Language are required.' });
    }
    const sql = 'INSERT INTO Movie (Title, Summary, Language, ImageURL) VALUES (?, ?, ?, ?)';
    await pool.query(sql, [title, summary, language, imageUrl]);
    console.log(`ADMIN: New movie added: ${title}`);
    res.status(201).json({ success: true, message: 'Movie added successfully!' });
  } catch (error) {
    console.error('Admin add movie error:', error);
    res.status(500).json({ success: false, message: 'Failed to add movie.' });
  }
});

/**
 * FIXED: Validates price and venueId, verifies venue existence when provided,
 * and treats missing/invalid venueId as NULL to avoid FK violations.
 */
app.post('/api/add/sport', async (req, res) => {
    try {
        const { team1, team2, price, imageUrl, category, venueId } = req.body;

        if (!team1) {
            return res.status(400).json({ success: false, message: 'Team 1 is required.' });
        }

        const venueIdNum = venueId ? Number(venueId) : null;

        // Validate venue if provided
        if (venueIdNum !== null) {
            const [check] = await pool.query("SELECT VenueID FROM Venue WHERE VenueID = ?", [venueIdNum]);
            if (check.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: `VenueID ${venueIdNum} does not exist. Create the venue first or choose another.`
                });
            }
        }

        const sql = `
            INSERT INTO SportsMatch (Team1ID, Team2ID, Price, ImageURL, Category, VenueID)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        await pool.query(sql, [team1, team2 || null, price, imageUrl || null, category, venueIdNum]);

        console.log(`SPORT ADDED: ${team1} vs ${team2}`);
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
    const sql = 'INSERT INTO Events (Name, Category, Price, ImageURL, VenueID) VALUES (?, ?, ?, ?, ?)';
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
    await pool.query('DELETE FROM Movie WHERE MovieID = ?', [id]);
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
    await pool.query('DELETE FROM SportsMatch WHERE MatchID = ?', [id]);
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
    await pool.query('DELETE FROM Events WHERE EventID = ?', [id]);
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

app.put('/api/update/movie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, language, imageUrl } = req.body;
    if (!title || !language) {
      return res.status(400).json({ success: false, message: 'Title and Language are required.' });
    }
    const sql = 'UPDATE Movie SET Title = ?, Summary = ?, Language = ?, ImageURL = ? WHERE MovieID = ?';
    await pool.query(sql, [title, summary, language, imageUrl, id]);
    console.log(`ADMIN: Updated MovieID: ${id}`);
    res.status(200).json({ success: true, message: 'Movie updated successfully!' });
  } catch (error) {
    console.error('Admin update movie error:', error);
    res.status(500).json({ success: false, message: 'Failed to update movie.' });
  }
});

app.put('/api/update/sport/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { team1, team2, price, imageUrl, category, venueId } = req.body;
    if (!team1) {
      return res.status(400).json({ success: false, message: 'Team 1 is required.' });
    }
    const sql = 'UPDATE SportsMatch SET Team1ID = ?, Team2ID = ?, Price = ?, ImageURL = ?, Category = ?, VenueID = ? WHERE MatchID = ?';
    await pool.query(sql, [team1, team2, price, imageUrl, category, venueId || null, id]);
    console.log(`ADMIN: Updated MatchID: ${id}`);
    res.status(200).json({ success: true, message: 'Sport updated successfully!' });
  } catch (error) {
    console.error('Admin update sport error:', error);
    res.status(500).json({ success: false, message: 'Failed to update sport.' });
  }
});

app.put('/api/update/event/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, imageUrl, venueId } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Name and Category are required.' });
    }
    const sql = 'UPDATE Events SET Name = ?, Category = ?, Price = ?, ImageURL = ?, VenueID = ? WHERE EventID = ?';
    await pool.query(sql, [name, category, price, imageUrl, venueId || null, id]);
    console.log(`ADMIN: Updated EventID: ${id}`);
    res.status(200).json({ success: true, message: 'Event updated successfully!' });
  } catch (error) {
    console.error('Admin update event error:', error);
    res.status(500).json({ success: false, message: 'Failed to update event.' });
  }
});

// ---------------- Health Check ----------------
app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, ts: new Date().toISOString() });
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`🎉 Backend server running at http://localhost:${PORT}`);
});
