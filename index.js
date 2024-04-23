const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/loginPage.html');
});

app.post('/login', (req, res) => {
    const password = req.body.password;
    if (password === 'brokenTelephone') {
        // Redirect to the main game page
        res.redirect('/game');
    } else {
        res.send('Incorrect password. Please try again.');
    }
});

app.get('/game', (req, res) => {
    res.send('Welcome to the game page!');
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
