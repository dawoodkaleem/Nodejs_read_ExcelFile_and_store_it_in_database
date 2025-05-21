import { Client } from "@hubspot/api-client";
import axios from "axios";
import { generateHubspotAuthUrl, handleHubspotOAuthCallback, getAllContactsHubsopt, getAllCompaniesHubsopt, fetchSelectedContactPropertiesFromHubSpot, getAllLeadsHubspot, createContactPropertyInHubSpot, searchOrListContacts, getLimitedContacts, createSingleContactService, createDealService, getHubspotDealsService } from "../services/hubspot.services.js"

export const getAuthHubspot = (req, res) => {
  const authUrl = generateHubspotAuthUrl();
  res.redirect(authUrl);
};

export const getCallbackAuthMethod = async (req, res) => {
  try {
    const { code } = req.query;

    const response = await handleHubspotOAuthCallback(code);

    res.json({
      message: "OAuth success",
      user: response.user,
    });
  } catch (error) {
    console.error("OAuth callback error:", error.message || error);
    res.status(500).send("OAuth failed");
  }
};
//Done with services

export const getHubspotContacts = async (req, res) => {
  const accessToken = req.accessToken;

  try {
    const response = await getAllContactsHubsopt(accessToken)

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
  const accessToken = req.accessToken;
  try {
    const response = await getAllCompaniesHubsopt(accessToken)

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
  const accessToken = req.accessToken;
  try {
    const leads = await getAllLeadsHubspot(accessToken);

    res.status(200).json(leads);
  } catch (error) {
    console.error("Error fetching leads from HubSpot:", error.message);
    res.status(500).json({ error: "Failed to fetch leads from HubSpot" });
  }
};

export const getHubspotDeals = async (req, res) => {
  const accessToken = req.accessToken;

  try {
    const deals = await getHubspotDealsService(accessToken);
    res.status(200).json(deals);
  } catch (error) {
    console.error("Controller Error - getHubspotDeals:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const createDeals = async (req, res) => {
  const accessToken = req.accessToken; // from middleware
  const { properties, associations } = req.body;

  try {
    const deal = await createDealService(accessToken, properties, associations);
    res.status(200).json(deal);
  } catch (err) {
    console.error("Error creating deal:", err.message);
    res.status(404).json({ message: "Failed to create deal", error: err.message });
  }
};

export const createSingleContact = async (req, res) => {
  const accessToken = req.accessToken; // From middleware
  const properties = req.body.properties;

  try {
    const contact = await createSingleContactService(accessToken, properties);

    res.status(200).json(contact);
  } catch (err) {
    console.error("Error creating contact:", err.message);
    res.status(400).json({ error: err.message });
  }
};

export const createBundleOfContacts = async (req, res) => {
  const accessToken = req.accessToken;
  try {
    const { inputs } = req.body;

    const result = await createBundleOfContactsFormFile(accessToken, inputs);

    res.status(200).json(result);
  } catch (err) {
    console.error("Error creating contact bundle:", err.message);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};

export const getLimited_Number_Of_Contact = async (req, res) => {
  const accessToken = req.accessToken;
  const limit = parseInt(req.query.limit) || 10;
  const after = req.query.after || undefined;

  try {
    const data = await getLimitedContacts(accessToken, limit, after);

    res.status(200).json(data);
  } catch (err) {
    console.error("HubSpot Error:", err.message);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
};

export const getContact_with_Search = async (req, res) => {
  const accessToken = req.accessToken;

  const limit = parseInt(req.query.limit) || 10;
  const after = req.query.after || undefined;
  const search = req.query.search || null;

  try {
    const data = await searchOrListContacts(accessToken, limit, after, search);

    res.status(200).json(data);
  } catch (err) {
    console.error("HubSpot Error:", err.message);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
};
export const getHubspotContactProperties = async (req, res) => {
  const accessToken = req.accessToken;
  try {
    // Make the API call to HubSpot
    const response = await axios.get(
      "https://api.hubapi.com/crm/v3/properties/contacts",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const filteredProperties = response.data.results.filter(
      (property) => property.hidden !== false
    );
    res.json({ result: filteredProperties });
  } catch (error) {
    console.error(
      "Error fetching contact properties from HubSpot:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({ error: "Failed to fetch contact properties from HubSpot" });
  }
};

export const createContactProperty = async (req, res) => {
  const accessToken = req.accessToken;

  try {
    const propertyPayload = req.body;
    const result = await createContactPropertyInHubSpot(accessToken, propertyPayload);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating contact property:", error.message);
    res.status(500).json({ error: "Failed to create contact property" });
  }
};

export const fetchSelectedContactProperties = async (req, res) => {
  const accessToken = req.accessToken;
  try {

    const { properties } = req.body;
    const results = await fetchSelectedContactPropertiesFromHubSpot(
      accessToken,
      properties
    );

    res.status(200).json({ results });
  } catch (error) {
    console.error(
      "Error fetching specific contact properties from HubSpot:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({ error: "Failed to fetch selected properties from HubSpot" });
  }
};