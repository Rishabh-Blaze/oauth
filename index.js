const express = require('express');
const session = require('express-session');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');
require('dotenv').config();

const app = express();

// Session middleware
app.use(session({ secret: 'SECRET_KEY', resave: false, saveUninitialized: true }));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

passport.use(new OAuth2Strategy({
    authorizationURL: process.env.AUTHORIZATION_URL,
    tokenURL: process.env.TOKEN_URL,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.REDIRECT_URI
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Home page with OAuth login and Privacy Policy link
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the OAuth App</h1>
    <a href="/auth">Login with OAuth</a>
    <br><br>
    <a href="/privacy-policy">Privacy Policy</a>
  `);
});

// Privacy Policy route
app.get('/privacy-policy', (req, res) => {
  res.send(`
    <h1>Privacy Policy</h1>
    <p>This is where your application privacy policy will go. Make sure to describe how you handle user data, cookies, and other legal obligations regarding privacy.</p>
  `);
});

// OAuth authentication route
app.get('/auth', passport.authenticate('oauth2'));

app.use('/health', (req, res)=>{
    res.send('ok')
})

// OAuth callback route
app.get('/oauth2callback',
    passport.authenticate('oauth2', { failureRedirect: '/' }),
    (req, res) => {
        console.log('ok')
      // Render a success message after login
      res.send(`
        <h1>Welcome !</h1>
        <p>You have successfully logged in using OAuth.</p>
        <a href="/logout">Logout</a>
      `);
    }
  );

// Logout route
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
