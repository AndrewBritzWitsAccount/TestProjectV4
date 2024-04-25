const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session middleware
app.use(session({
    secret: 'secret-key', // Change this to a random string
    resave: false,
    saveUninitialized: true
}));

// Middleware to check if the user is logged in
const requireLogin = (req, res, next) => {
    if (!req.session.displayName) {
        return res.redirect('/');
    }
    next();
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/loginPage.html');
});

app.post('/login', (req, res) => {
    const { displayName, password } = req.body;
    if (password === 'brokenTelephone') {
        // Here you can handle the display name as needed, for example, you can store it in a session
        req.session.displayName = displayName;
        // Redirect to the main game page
        res.redirect('/game');
    } else {
        res.send('Incorrect password. Please try again.');
    }
});

// Route to serve the game page with authentication middleware
app.get('/game', requireLogin, (req, res) => {
    res.sendFile(__dirname + '/public/game.html');
});

// Route to log out the user
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle drawing events
    socket.on('draw', (data) => {
        // Broadcast drawing data to all clients
        io.emit('draw', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Route to get the list of logged-in users
app.get('/loggedInUsers', (req, res) => {
    const loggedInUsers = req.session.displayName ? [{ displayName: req.session.displayName }] : [];
    res.json(loggedInUsers);
});
