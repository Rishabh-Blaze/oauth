require('dotenv').config();
const express = require('express');
const request = require('request');
const app = express();
const port = 8081;

// Load environment variables
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURI = process.env.REDIRECT_URI;

// Step 1: Redirect to OAuth Provider
app.get('/auth', (req, res) => {
    const authURL = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientID}&redirect_uri=${redirectURI}&scope=email%20profile&access_type=offline`;
    res.redirect(authURL);
});

// Step 2: OAuth Provider redirects to your redirect URI with code
app.get('/oauth2callback', (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send('No code received');
    }

    const tokenURL = 'https://oauth2.googleapis.com/token';
    const tokenOptions = {
        url: tokenURL,
        method: 'POST',
        form: {
            code: code,
            client_id: clientID,
            client_secret: clientSecret,
            redirect_uri: redirectURI,
            grant_type: 'authorization_code'
        },
        json: true
    };

    // Step 3: Exchange code for tokens
    request(tokenOptions, (error, response, body) => {
        if (error || response.statusCode !== 200) {
            return res.status(500).send('Error exchanging code for token');
        }

        // Step 4: Retrieve user info
        const accessToken = body.access_token;
        const userInfoURL = 'https://www.googleapis.com/oauth2/v2/userinfo';
        const userInfoOptions = {
            url: userInfoURL,
            headers: { Authorization: `Bearer ${accessToken}` },
            json: true
        };

        request(userInfoOptions, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                return res.status(500).send('Error fetching user info');
            }

            res.send(`Hello, ${body.name}! Your email is ${body.email}.`);
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
