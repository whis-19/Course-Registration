const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Initialize environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to the database
connectDB().catch(err => {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
});

// Middleware for logging requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware to log response body
app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function (body) {
        console.log('Response:', JSON.stringify(body, null, 2));
        originalSend.call(this, body);
    };
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Define routes
const userRoutes = require('./routes/api/users');
const courseRoutes = require('./routes/api/courses');
const registrationRoutes = require('./routes/api/registrations');
const reportRoutes = require('./routes/api/reports');
const seedRoutes = require('./routes/api/seed');
const indexRoutes = require('./routes/index');

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/seed', seedRoutes);
app.use('/', indexRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Define the port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});