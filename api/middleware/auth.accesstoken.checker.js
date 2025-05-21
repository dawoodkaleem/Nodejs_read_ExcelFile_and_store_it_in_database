export const verifyBearerToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Authorization header missing or invalid" });
  }

  req.accessToken = authHeader.split(" ")[1]; // Attach token to request object
  next();
};


// const getLeadsFromHubSpot = async (accessToken) => {
//   try {
//     // Make the GET request to HubSpot to fetch leads data
//     const response = await axios.get('https://api.hubapi.com/crm/v3/properties/leads', {
//       headers: {
//         Authorization: `Bearer ${accessToken}`, // access token to set in request
//       },
//     });

//     // Return the leads data from the response
//     return res.status(200).json(response.data);
//   } catch (error) {
//     console.error('Error fetching companies from HubSpot:', error.response?.data || error.message);
//     res.status(500).json({ error: 'Failed to fetch companies from HubSpot' });
//   }
// };

// export const getAuthHubspot = (req, res) => {
//   const params = querystring.stringify({
//     client_id: process.env.HUBSPOT_CLIENT_ID,
//     redirect_uri: process.env.HUBSPOT_REDIRECT_URI,
//     scope:
//       "oauth crm.objects.contacts.read crm.objects.companies.read crm.objects.leads.read crm.objects.deals.read crm.objects.contacts.write crm.schemas.contacts.write",
//     response_type: "code",
//   });
//   // Redirect user to HubSpot's OAuth page
//   res.redirect(`https://app.hubspot.com/oauth/authorize?${params}`);
// };

// export const getUserAccessToken = async (userId) => {
//   const user = await User.findById(userId);

//   if (!user || !user.accessToken) {
//     throw new Error(
//       "Access token not found. Please connect your HubSpot account."
//     );
//   }

//   return user.accessToken;
// };

// export const getCallbackAuthMethod = async (req, res) => {
//   const code = req.query.code;
//   // console.log('Callback route triggered');

//   if (!code) {
//     return res.status(400).send("No code received");
//   }

//   const hubspotClient = new Client();

//   try {
//     const tokenResponse = await hubspotClient.oauth.tokensApi.create(
//       "authorization_code",
//       code,
//       process.env.HUBSPOT_REDIRECT_URI,
//       process.env.HUBSPOT_CLIENT_ID,
//       process.env.HUBSPOT_CLIENT_SECRET
//     );

//     const accessToken = tokenResponse.accessToken;
//     // console.log("Checking the token in if this is correct ", accessToken)
//     // const refreshToken = tokenResponse.refreshToken;
//     const expiresIn = tokenResponse.expiresIn;

//     hubspotClient.setAccessToken(accessToken);

//     const userInfoResponse = await axios.get(
//       `https://api.hubapi.com/oauth/v1/access-tokens/${accessToken}`
//     );
//     console.log(userInfoResponse, "Hello ");
//     const hubspotUser = userInfoResponse.data;

//     // Create or update the user in MongoDB
//     const user = await User.findOneAndUpdate(
//       { email: hubspotUser.user }, // Find by email
//       {
//         email: hubspotUser.user,
//         hubspotId: hubspotUser.user_id,
//         hubspotAccessToken: accessToken,
//         hubspotTokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
//         name: hubspotUser.hub_domain,
//         avatar: null,
//       },
//       { upsert: true, new: true }
//     );

//     console.log("✅ HubSpot user saved:", user.email);

//     res.json({
//       message: "OAuth success",
//       user: {
//         email: user.email,
//         name: user.name,
//         hubspotConnected: true,
//         hubspotId: hubspotUser.user_id,
//         hubspotAccessToken: accessToken,
//       },
//     });
//   } catch (error) {
//     console.error(
//       "OAuth error:",
//       error.response?.data || error.message || error
//     );
//     res.status(500).send("OAuth failed");
//   }
// };