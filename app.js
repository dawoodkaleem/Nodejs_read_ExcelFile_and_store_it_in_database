import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import 'dotenv/config.js';
import morgan from "morgan"
import querystring from 'querystring'
import categoryRoute from './api/routes/category.route.js';
import subcategoryRoute from './api/routes/subcategory.route.js';
import todosRoute from './api/routes/todo.route.js';
import userRoute from './api/routes/user.route.js';
import { Client } from "@hubspot/api-client";
import axios from 'axios';  // Add this import
import hubsportRoute from './api/routes/hubsport.route.js'
// const hubspotClient = new Client({ accessToken: YOUR_ACCESS_TOKEN });
import './passport.js'; // Passport strategy setup

const app = express();

// Middleware
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(morgan("dev"))
app.set('view engine', 'ejs');

// MongoDB Connection
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB Connection Failed:', err));

// Routes
app.use('/category', categoryRoute);
app.use('/subcategory', subcategoryRoute);
app.use('/todos', todosRoute);
app.use('/user', userRoute);
app.use('/', hubsportRoute)
// Default Route
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/usercrediantion');
  }
  res.redirect('/auth/google');
});

// Function to get leads from the hubsport 
// const getLeadsFromHubSpot = async (accessToken) => {
//   try {
//     // Make the GET request to HubSpot to fetch leads data
//     const response = await axios.get('https://api.hubapi.com/crm/v3/properties/leads', {
//       headers: {
//         Authorization: `Bearer ${accessToken}`, // access token to set in request
//       },
//     });

//     // Return the leads data from the response
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching leads from HubSpot:', error.response?.data || error.message);
//     throw new Error('Failed to fetch leads from HubSpot');
//   }
// };

// Google OAuth Routes
app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/usercrediantion');
  }
  res.redirect('/auth/google');
});

app.get(
  '/auth/google/callback',

  passport.authenticate('google', {
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect('/usercrediantion');
  }
);
// Protected Route After Login
app.get('/usercrediantion', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }

  const email = req.user.emails?.[0]?.value || 'No email';
  res.send(`Welcome ${req.user.displayName} (${email})`);
});


app.get('/dashboard', (req, res) => {
  res.send('Google login successful!');
});
app.get('/login', (req, res) => {
  res.send('Login failed. Try again.');
});

// const hubspotClient = new Client();

// app.get("/auth/hubspot", (req, res) => {
//   const authUrl = hubspotClient.oauth.getAuthorizationUrl(CLIENT_ID, REDIRECT_URI, SCOPES);
//   res.redirect(authUrl);
// });

// app.get("/auth/hubspot/callback", async (req, res) => {
//   const { code } = req.query;

//   try {
//     const tokenResponse = await hubspotClient.oauth.defaultApi.createToken(
//       "authorization_code",
//       code,
//       REDIRECT_URI,
//       CLIENT_ID,
//       CLIENT_SECRET
//     );

//     const accessToken = tokenResponse.body.accessToken;
//     hubspotClient.setAccessToken(accessToken);

//     const userInfo = await hubspotClient.oauth.defaultApi.getAccessTokenInfo(accessToken);

//     res.json({
//       message: "Authenticated successfully!",
//       user: userInfo.body
//     });

//   } catch (err) {
//     console.error("OAuth Error:", err.response?.body || err.message);
//     res.status(500).send("OAuth failed.");
//   }
// });





// const SCOPE = 'oauth'; // ✅ minimal scope just for identity

// app.get('/auth/hubspot', (req, res) => {
//   const params = querystring.stringify({
//     client_id: process.env.HUBSPOT_CLIENT_ID,
//     redirect_uri: process.env.HUBSPOT_REDIRECT_URI,
//     scope: 'oauth crm.objects.contacts.read crm.objects.companies.read crm.objects.deals.read',
//     response_type: 'code',
//   });

//   // Redirect user to HubSpot's OAuth page
//   res.redirect(`https://app.hubspot.com/oauth/authorize?${params}`);
// });



// app.get('/auth/hubspot/callback', async (req, res) => {
//   const code = req.query.code;

//   if (!code) {
//     return res.status(400).send('No code received');
//   }

//   const hubspotClient = new Client();

//   try {
//     // Step 1: Exchange the authorization code for an access token
//     const tokenResponse = await hubspotClient.oauth.tokensApi.create(
//       'authorization_code', // Grant type
//       code, // Authorization code received in the callback
//       process.env.HUBSPOT_REDIRECT_URI, // Redirect URI
//       process.env.HUBSPOT_CLIENT_ID, // Your client ID
//       process.env.HUBSPOT_CLIENT_SECRET // Your client secret
//     );

//     console.log('Token Response:', tokenResponse);

//     // Step 2: Check if access_token is in the response body
//     if (!tokenResponse.accessToken) {
//       console.error('Access token not found in the response body.');
//       return res.status(500).send('Access token not found in the response body');
//     }
//     const accessToken = tokenResponse.accessToken;
//     console.log('Received access token:', accessToken); // Log the access token

//     // Step 2: Set the access token for the client
//     hubspotClient.setAccessToken(accessToken);

//     const userResponse = await hubspotClient.crm.contacts.basicApi.getPage();

//     const leadProperties = await getLeadsFromHubSpot(accessToken);
//     const userCompanies = await hubspotClient.crm.companies.basicApi.getPage();
//     const userDeals = await hubspotClient.crm.deals.basicApi.getPage();

//     console.log('User Contacts:', userResponse);
//     console.log('User Companies:', userCompanies);
//     console.log("USer deals ", userDeals)
//     res.json({
//       message: 'OAuth success',
//       contacts: userResponse.results,
//       companies: userCompanies.results,
//       deals: userDeals.results,
//       leads: leadProperties.results,  // Return the leads data fetched from the function
//     });


//   } catch (error) {
//     console.error('OAuth error:', error.response?.body || error.message || error);
//     res.status(500).send('OAuth failed');
//   }
// });




export default app;






// HubSpot OAuth Routes
// app.get(
//   '/auth/hubspot',
//   passport.authenticate('hubspot', {
//     scope: ['ouath'],
//   })
// );

// app.get(
//   '/auth/hubspot',
//   passport.authenticate('hubspot', {
//     scope: ['oauth'], // Here we add the fileds we want to get from the login site in scope
//   })
// );

// app.get(
//   '/auth/hubspot/callback',
//   passport.authenticate('hubspot', {
//     failureRedirect: '/login',
//   }),
//   (req, res) => {
//     console.log('Authenticated user:', req.user);
//     res.redirect('/');
//   }
// );


/// Export the app for server usage

