import querystring from "querystring";
import { Client } from "@hubspot/api-client";
import axios from "axios";
import { User } from "../models/user.model.js"; // adjust your path

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

export const getAuthHubspot = (req, res) => {
  const params = querystring.stringify({
    client_id: process.env.HUBSPOT_CLIENT_ID,
    redirect_uri: process.env.HUBSPOT_REDIRECT_URI,
    scope:
      "oauth crm.objects.contacts.read crm.objects.companies.read crm.objects.leads.read crm.objects.deals.read crm.objects.contacts.write",
    // scope: 'oauth',
    response_type: "code",
  });
  // Redirect user to HubSpot's OAuth page
  res.redirect(`https://app.hubspot.com/oauth/authorize?${params}`);
};

export const getUserAccessToken = async (userId) => {
  const user = await User.findById(userId);

  if (!user || !user.accessToken) {
    throw new Error(
      "Access token not found. Please connect your HubSpot account."
    );
  }

  return user.accessToken;
};

export const getCallbackAuthMethod = async (req, res) => {
  const code = req.query.code;
  // console.log('Callback route triggered');

  if (!code) {
    return res.status(400).send("No code received");
  }

  const hubspotClient = new Client();

  try {
    const tokenResponse = await hubspotClient.oauth.tokensApi.create(
      "authorization_code",
      code,
      process.env.HUBSPOT_REDIRECT_URI,
      process.env.HUBSPOT_CLIENT_ID,
      process.env.HUBSPOT_CLIENT_SECRET
    );

    const accessToken = tokenResponse.accessToken;
    // console.log("Checking the token in if this is correct ", accessToken)
    // const refreshToken = tokenResponse.refreshToken;
    const expiresIn = tokenResponse.expiresIn;

    hubspotClient.setAccessToken(accessToken);

    const userInfoResponse = await axios.get(
      `https://api.hubapi.com/oauth/v1/access-tokens/${accessToken}`
    );
    // console.log(userInfoResponse)
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
        hubspotAccessToken: accessToken,
      },
    });
  } catch (error) {
    console.error(
      "OAuth error:",
      error.response?.data || error.message || error
    );
    res.status(500).send("OAuth failed");
  }
};

export const getHubspotContacts = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Authorization header missing or invalid" });
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    const response = await axios.get(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error fetching contacts from HubSpot:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch contacts from HubSpot" });
  }
};

export const getHubspotCompanies = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Authorization header missing or invalid" });
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    const response = await axios.get(
      "https://api.hubapi.com/crm/v3/objects/companies",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.status(200).json(response.data, "Header auth", authHeader);
  } catch (error) {
    console.error(
      "Error fetching companies from HubSpot:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch companies from HubSpot" });
  }
};

export const getHubspotLeads = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Authorization header missing or invalid" });
  }

  const accessToken = authHeader.split(" ")[1];
  // console.log("We are here and ", accessToken)

  // await axios.get('https://api.hubapi.com/crm/v3/properties/leads',
  try {
    const response = await axios.get(
      "https://api.hubapi.com/crm/v3/objects/leads?properties=firstname,lastname,email",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.status(200).json(response);
  } catch (err) {
    console.log(
      "Error fetching leads from HubSpot:",
      err.response?.data || err.message
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
};

export const getHubspotDeals = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Authorization header missing or invalid" });
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    const response = await axios.get(
      "https://api.hubapi.com/crm/v3/objects/deals",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error fetching deals from HubSpot:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch deals from HubSpot" });
  }
};

export const createDeals = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Authorization header missing or invalid" });
  }

  const accessToken = authHeader.split(" ")[1];
  const { properties, associations } = req.body;
  const dealsData = {
    properties,
    associations: associations || [],
  };
  try {
    const apiResponse = await hubspotClient.crm.deals.basicApi.create(
      dealsData
    );
    console.log(JSON.stringify(apiResponse, null, 2));
    res.status(200).json(apiResponse);
  } catch (err) {
    console.log(err.response);
    res
      .status(404)
      .json({ message: "Fail to create the Deals data ", error: err });
  }
};

export const createSingleContact = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Authorization header missing or invalid" });
  }

  const accessToken = authHeader.split(" ")[1];

  const hubspotClient = new Client({ accessToken: accessToken });

  const properties = req.body.properties;
  console.log(req.body.properties);
  const SimplePublicObjectInputForCreate = { associations: [], properties };

  try {
    const apiResponse = await hubspotClient.crm.contacts.basicApi.create(
      SimplePublicObjectInputForCreate
    );
    console.log(JSON.stringify(apiResponse, null, 2));
    res.status(200).json(apiResponse);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err });
  }
};

export const createBundelOfContacts = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Authorization header missing or invalid" });
  }

  const accessToken = authHeader.split(" ")[1];
  const hubspotClient = new Client({ accessToken });

  // Get the payload from the request body
  const { inputs } = req.body;

  if (!inputs || !Array.isArray(inputs)) {
    return res
      .status(400)
      .json({ error: 'Invalid or missing "inputs" array in request body' });
  }

  // HubSpot API only allows max 100 contacts per batch request remember to tell uzair bahi
  const BATCH_SIZE = 100;

  try {
    const results = [];

    for (let i = 0; i < inputs.length; i += BATCH_SIZE) {
      const batch = inputs.slice(i, i + BATCH_SIZE);

      const response = await hubspotClient.crm.contacts.batchApi.create({
        inputs: batch,
      });
      console.log(`Batch ${i / BATCH_SIZE + 1}:`, response);
      results.push(response);
    }
    const Recordlenght = results.length;
    res
      .status(200)
      .json({
        message: "All contacts created in batches",
        Recordlenght,
        results,
      });
  } catch (err) {
    console.error("HubSpot Batch Create Error:", err.message);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
};

export const getLimited_Number_Of_Contact = async (req, res) => {
  const authHeader = req.headers.authorization;
  // console.log(req.query, "WWWWWWWWWWWWWWWWWWWWWW");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Authorization header missing or invalid" });
  }

  const accessToken = authHeader.split(" ")[1];
  const hubspotClient = new Client({ accessToken });

  const limit = req.query.limit;
  const after = req.query.after || undefined;
  const properties = undefined;
  const propertiesWithHistory = undefined;
  const associations = undefined;
  const archived = false;
  console.log(req.query, "Cheking if limit is working or have undefine");
  try {
    const apiResponse = await hubspotClient.crm.contacts.basicApi.getPage(
      limit,
      after,
      properties,
      propertiesWithHistory,
      associations,
      archived
    );
    // console.log(JSON.stringify(apiResponse, null, 2));
    res
      .status(200)
      .json({
        message: `lenght is ${apiResponse.results.length}`,
        Results: apiResponse.results,
      });
  } catch (err) {
    console.error("HubSpot Batch Create Error:", err.message);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
};




export const getContact_with_Search = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header missing or invalid" });
  }

  const accessToken = authHeader.split(" ")[1];
  const hubspotClient = new Client({ accessToken });

  const limit = parseInt(req.query.limit) || 10;
  const after = req.query.after || undefined;
  const search = req.query.search || null;

  try {
    if (search) {
      //  If search query is provided, use search API
      const request = {
        // filterGroups: [

        //   {
        //     filters: [
        //       {
        //         propertyName: 'email', // Change to any other property as needed
        //         operator: 'CONTAINS_TOKEN',
        //         value: search
        //       },
        //       {
        //         propertyName: 'firstname',
        //         operator: 'CONTAINS_TOKEN',
        //         value: search
        //       },
        //       {
        //         propertyName: 'lastname',
        //         operator: 'CONTAINS_TOKEN',
        //         value: search
        //       }
        //     ]
        //   }
        // ],
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'CONTAINS_TOKEN',
                value: search
              }
            ]
          },
          {
            filters: [
              {
                propertyName: 'firstname',
                operator: 'CONTAINS_TOKEN',
                value: search
              }
            ]
          },
          {
            filters: [
              {
                propertyName: 'lastname',
                operator: 'CONTAINS_TOKEN',
                value: search
              }
            ]
          }
        ],
        properties: ['firstname', 'lastname', 'email',"name"],
        limit:limit,
        after
      };

      const apiResponse = await hubspotClient.crm.contacts.searchApi.doSearch(request);

      return res.status(200).json({
        message: `Search returned ${apiResponse.results.length} results.`,
        Results: apiResponse,
        paging: apiResponse.paging?.next || null
      });
    } else {
      //  If no search, use regular paginated list
      const apiResponse = await hubspotClient.crm.contacts.basicApi.getPage(
        limit,
        after,
        undefined,
        undefined,
        undefined,
        false
      );

      return res.status(200).json({
        message: `List returned ${apiResponse.results.length} results.`,
        Results: apiResponse.results,
        paging: apiResponse.paging?.next || null
      });
    }
  } catch (err) {
    console.error("HubSpot Error:", err.message);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
};



// export const getContact_with_Search = async (req, res) => {
//   const authHeader = req.headers.authorization;
  
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res
//       .status(401)
//       .json({ error: "Authorization header missing or invalid" });
//   }

//   const accessToken = authHeader.split(" ")[1];
//   const hubspotClient = new Client({ accessToken });

//   const limit = req.query.limit;
//   const after = req.query.after || undefined;
//   const properties = undefined;
//   const propertiesWithHistory = undefined;
//   const associations = undefined;
//   const archived = false;
//   console.log(req.query, "Cheking if limit is working or have undefine");
//   try {
//     const apiResponse = await hubspotClient.crm.contacts.basicApi.getPage(
//       limit,
//       after,
//       properties,
//       propertiesWithHistory,
//       associations,
//       archived
//     );
//     // console.log(JSON.stringify(apiResponse, null, 2));
//     res
//       .status(200)
//       .json({
//         message: `lenght is ${apiResponse.results.length}`,
//         Results: apiResponse.results,
//       });
//   } catch (err) {
//     console.error("HubSpot Batch Create Error:", err.message);
//     res.status(500).json({ error: err.message || "Unknown error" });
//   }
// };

// export const createBundelOfContacts = async (req, res) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ error: 'Authorization header missing or invalid' });
//   }

//   const accessToken = authHeader.split(' ')[1];

//   const hubspotClient = new Client({ "accessToken": accessToken });

//   const BatchInputSimplePublicObjectBatchInputForCreate = { inputs: [{ "associations": [{ "types": [{ "associationCategory": "HUBSPOT_DEFINED" }], "to": {} }], "properties": {} }] };

//   try {
//     const apiResponse = await hubspotClient.crm.contacts.batchApi.create(BatchInputSimplePublicObjectBatchInputForCreate);
//     console.log(apiResponse, "Bundel of Contacts")
//     res.status(200).json(apiResponse)
//   } catch (err) {
//     console.log(err)
//     res.status(400).json({ error: err })
//   }

// }

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

// Post create single deal from Hubspot deals

// const dealData = {
//   properties: {
//     dealname: 'Website Redesign',
//     amount: '8000',
//     pipeline: 'default',
//     dealstage: 'appointmentscheduled'
//   }
// };

// async function createDeal() {
//   try {
//     const response = await hubspotClient.crm.deals.basicApi.create({ properties: dealData.properties });
//     console.log('✅ Deal created successfully:', response.body);
//   } catch (e) {
//     console.error('❌ Error creating deal:', e.response?.body || e.message || e);
//   }
// }
