const mysql = require('mysql2/promise');

// Create a "pool" of connections that your server can use
// This is more efficient than creating a new connection for every query.
const pool = mysql.createPool({
    host: '127.0.0.1', // Or 'localhost'
    user: 'root',
    
    // THIS IS THE FIX:
    // Use the new password you just set
    password: 'FlickTickets123', 
    
    // This is the name of the database you created
    database: 'FlickTickets',
    
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// A small function to test the connection when the server starts
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Successfully connected to MySQL database.');
        connection.release(); // Release the connection back to the pool
    } catch (err) {
        console.error('❌ Failed to connect to MySQL:', err);
    }
}

// Run the test
testConnection();

// Export the 'pool' so that server.js and other files can use it 
// to make database queries.
module.exports = pool;