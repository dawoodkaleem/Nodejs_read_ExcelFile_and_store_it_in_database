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
  createBundleOfContacts,
  getLimited_Number_Of_Contact,
  getContact_with_Search,
  getHubspotContactProperties,
  createContactProperty, fetchSelectedContactProperties
} from "../controller/hubspot.controller.js";
import { verifyBearerToken } from "../middleware/auth.accesstoken.checker.js";
router.get("/auth/hubspot", getAuthHubspot);
router.get("/auth/hubspot/callback", getCallbackAuthMethod);
router.get("/hubspot/contacts", verifyBearerToken, getHubspotContacts);
router.get("/hubspot/companies", verifyBearerToken, getHubspotCompanies);
router.get("/hubspot/leads", verifyBearerToken, getHubspotLeads);
router.get("/hubspot/deals", verifyBearerToken, getHubspotDeals);
router.post("/create/deals", verifyBearerToken, createDeals);
router.post("/create/contact", verifyBearerToken, createSingleContact);
router.post("/create/bundelcontacts", verifyBearerToken, createBundleOfContacts);
router.get("/hubspot/limitedcontact", verifyBearerToken, getLimited_Number_Of_Contact);
router.get("/contactsearch", verifyBearerToken, getContact_with_Search), //search with pagination
  router.get("/allcontactproperties", verifyBearerToken, getHubspotContactProperties);
router.post("/createspecificproperty", verifyBearerToken, createContactProperty)
router.post('/api/hubspot/properties', verifyBearerToken, fetchSelectedContactProperties);

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
