import express from "express";
import axios from "axios";
const router = express.Router();
import {
  getAuthHubspot,
  getCallbackAuthMethod,
  getHubspotContacts,
  getHubspotCompanies,
  getHubspotLeads,
  getHubspotDeals,
  createDeals,
  createSingleContact,
  createBundelOfContacts,
  getLimited_Number_Of_Contact,
  getContact_with_Search,
  getHubspotContactProperties,
  createContactProperty, getSelectedHubspotContactProperties
} from "../controller/hubspot.controller.js";

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

router.get("/auth/hubspot", getAuthHubspot);
router.get("/auth/hubspot/callback", getCallbackAuthMethod);

router.get("/hubspot/contacts", getHubspotContacts);
router.get("/hubspot/companies", getHubspotCompanies);
router.get("/hubspot/leads", getHubspotLeads);
router.get("/hubspot/deals", getHubspotDeals);
router.post("/create/deals", createDeals);
router.post("/create/contact", createSingleContact);
router.post("/create/bundelcontacts", createBundelOfContacts);
router.get("/hubspot/limitedcontact", getLimited_Number_Of_Contact);
router.get("/contactsearch", getContact_with_Search), //search with pagination
  router.get("/allcontactproperties", getHubspotContactProperties);
router.post("/createspecificproperty", createContactProperty)
router.post('/api/hubspot/properties', getSelectedHubspotContactProperties);

// Endpoint to check scopes from the HubSpot access token
router.get("/check-scopes", async (req, res) => {
  // Extract the access token from the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Authorization header missing or invalid" });
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    // Make the request to HubSpot to check scopes
    const response = await axios.get(
      `https://api.hubapi.com/oauth/v1/access-tokens/${accessToken}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Log the scopes and return them to the client
    console.log("Scopes granted:", response.data.scopes);
    res.status(200).json({
      message: "Scopes retrieved successfully",
      scopes: response.data.scopes,
    });
  } catch (error) {
    console.error(
      "Error fetching scopes from HubSpot:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch scopes from HubSpot" });
  }
});

export default router;
