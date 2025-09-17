// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const apiRouter = require('./routes/api');
const db = require('./config/db'); // Import the database connection
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors()); // Enables cross-origin requests
app.use(express.json()); // Parses incoming JSON requests

// Use the main API router
app.use('/api', apiRouter);

// Basic route to check if the server is running
app.get('/', (req, res) => {
    res.send('Welcome to the OptiManager Backend API!');
});

// Check database connection and start the server
db.getConnection()
    .then(connection => {
        console.log('Successfully connected to the database.');
        connection.release();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to the database:', err);
        console.log('Server not started due to database connection error.');
    });