
import querystring from 'querystring'
import { Client } from "@hubspot/api-client";
import axios from 'axios';
import { User } from "../models/user.model.js"; // adjust your path

const getLeadsFromHubSpot = async (accessToken) => {
  try {
    // Make the GET request to HubSpot to fetch leads data
    const response = await axios.get('https://api.hubapi.com/crm/v3/properties/leads', {
      headers: {
        Authorization: `Bearer ${accessToken}`, // access token to set in request
      },
    });

    // Return the leads data from the response
    return response.data;
  } catch (error) {
    console.error('Error fetching leads from HubSpot:', error.response?.data || error.message);
    throw new Error('Failed to fetch leads from HubSpot');
  }
};



export const getAuthHubspot = (req, res) => {
  const params = querystring.stringify({
    client_id: process.env.HUBSPOT_CLIENT_ID,
    redirect_uri: process.env.HUBSPOT_REDIRECT_URI,
    scope: 'oauth crm.objects.contacts.read',
    // scope: 'oauth',
    response_type: 'code',
  });

  // Redirect user to HubSpot's OAuth page
  res.redirect(`https://app.hubspot.com/oauth/authorize?${params}`);
}




export const getUserAccessToken = async (userId) => {
  const user = await User.findById(userId);

  if (!user || !user.accessToken) {
    throw new Error('Access token not found. Please connect your HubSpot account.');
  }

  return user.accessToken;
};

export const getCallbackAuthMethod = async (req, res) => {
  const code = req.query.code;
  console.log('Callback route triggered');

  if (!code) {
    return res.status(400).send('No code received');
  }

  const hubspotClient = new Client();

  try {
    const tokenResponse = await hubspotClient.oauth.tokensApi.create(
      'authorization_code',
      code,
      process.env.HUBSPOT_REDIRECT_URI,
      process.env.HUBSPOT_CLIENT_ID,
      process.env.HUBSPOT_CLIENT_SECRET
    );

    const accessToken = tokenResponse.accessToken;
    console.log("Checking the token in if this is correct ", accessToken)
    // const refreshToken = tokenResponse.refreshToken;
    const expiresIn = tokenResponse.expiresIn;

    hubspotClient.setAccessToken(accessToken);

    const userInfoResponse = await axios.get(`https://api.hubapi.com/oauth/v1/access-tokens/${accessToken}`);
    console.log(userInfoResponse)
    const hubspotUser = userInfoResponse.data;

    // Create or update the user in MongoDB
    const user = await User.findOneAndUpdate(
      { email: hubspotUser.user }, // Find by email
      {
        email: hubspotUser.user,
        hubspotId: hubspotUser.user_id,
        hubspotAccessToken: accessToken,
        hubspotTokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
        name: hubspotUser.hub_domain,
        avatar: null,
      },
      { upsert: true, new: true }
    );

    console.log("✅ HubSpot user saved:", user.email);

    res.json({
      message: "OAuth success",
      user: {
        email: user.email,
        name: user.name,
        hubspotConnected: true,
        hubspotId: hubspotUser.user_id,
        hubspotAccessToken: accessToken
      }
    });

  } catch (error) {
    console.error("OAuth error:", error.response?.data || error.message || error);
    res.status(500).send("OAuth failed");
  }
};

export const getHubspotContacts = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    const response = await axios.get('https://api.hubapi.com/crm/v3/objects/contacts', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching contacts from HubSpot:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch contacts from HubSpot' });
  }
}

// export const getCallbackAuthMethod = async (req, res) => {
//   const code = req.query.code;
//   console.log('Callback route triggered');

//   if (!code) {
//     return res.status(400).send('No code received');
//   }

//   const hubspotClient = new Client();

//   try {
//     // 1: Exchange the code for an access token
//     const tokenResponse = await hubspotClient.oauth.tokensApi.create(
//       'authorization_code',
//       code,
//       process.env.HUBSPOT_REDIRECT_URI,
//       process.env.HUBSPOT_CLIENT_ID,
//       process.env.HUBSPOT_CLIENT_SECRET
//     );

//     const accessToken = tokenResponse.accessToken;

//     if (!accessToken) {
//       console.error('Access token not found in the response.');
//       return res.status(500).send('Access token not found.');
//     }

//     console.log('Received access token:', accessToken);

//     // 🔍 2: Get user info including email using the token
//     const userInfoResponse = await axios.get(`https://api.hubapi.com/oauth/v1/access-tokens/${accessToken}`);
//     const userEmail = userInfoResponse.data.user;
//     console.log('✅ HubSpot user email:', userEmail);

//     // 🔧 3: Use access token to fetch CRM data (optional)
//     hubspotClient.setAccessToken(accessToken);

//     // const contacts = await hubspotClient.crm.contacts.basicApi.getPage();
//     // const companies = await hubspotClient.crm.companies.basicApi.getPage();
//     // const deals = await hubspotClient.crm.deals.basicApi.getPage();
//     // const leads = await getLeadsFromHubSpot(accessToken);


//     res.json({
//       message: 'OAuth success',
//       userEmail: userEmail,
//       // contacts: contacts.results,
//       // companies: companies.results,
//       // deals: deals.results,
//       // leads: leads.results,
//     });

//   } catch (error) {
//     console.error('OAuth error:', error.response?.data || error.message || error);
//     res.status(500).send('OAuth failed');
//   }
// };


// export const getCallbackAuthMethod = async (req, res) => {
//   const code = req.query.code;
//   console.log('Callback route triggered');

//   if (!code) {
//     return res.status(400).send('No code received');
//   }

//   const hubspotClient = new Client();

//   try {
//     // 1 Exchange the authorization code for an access token
//     const tokenResponse = await hubspotClient.oauth.tokensApi.create(
//       'authorization_code', // Grant type
//       code, // Authorization code received in the callback
//       process.env.HUBSPOT_REDIRECT_URI, // Redirect URI
//       process.env.HUBSPOT_CLIENT_ID, // Your client ID
//       process.env.HUBSPOT_CLIENT_SECRET // Your client secret
//     );

//     console.log('Token Response:', tokenResponse);

//     //  2: Check if access_token is in the response body
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
//     // const userLeads = await hubspotClient.crm.leads.basicApi.getPage("leads");
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
// }