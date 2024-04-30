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

// Keep track of logged-in users
let loggedInUsers = [];

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/loginPage.html');
});

app.post('/login', (req, res) => {
    const { displayName, password } = req.body;
    if (password === 'brokenTelephone') {
        // Here you can handle the display name as needed, for example, you can store it in a session
        req.session.displayName = displayName;
        loggedInUsers.push({ displayName: displayName });
        io.emit('playerListUpdate', loggedInUsers);
        // Redirect to the lobby page
        res.redirect('/lobby');
    } else {
        res.send('Incorrect password. Please try again.');
    }
});

// Route to serve the lobby page with authentication middleware
app.get('/lobby', requireLogin, (req, res) => {
    res.sendFile(__dirname + '/public/lobby.html');
});

// Route to log out the user
app.get('/logout', (req, res) => {
    const index = loggedInUsers.findIndex(user => user.displayName === req.session.displayName);
    if (index !== -1) {
        loggedInUsers.splice(index, 1);
        io.emit('playerListUpdate', loggedInUsers);
    }
    req.session.destroy();
    res.redirect('/');
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('A user connected');

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
    res.json(loggedInUsers);
});
