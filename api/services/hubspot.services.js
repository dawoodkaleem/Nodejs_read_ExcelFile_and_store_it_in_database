import axios from "axios";
import querystring from "querystring";
import { Client } from "@hubspot/api-client";
import { User } from "../models/user.model.js";

// Generate HubSpot Auth URL
export const generateHubspotAuthUrl = () => {
  const params = querystring.stringify({
    client_id: process.env.HUBSPOT_CLIENT_ID,
    redirect_uri: process.env.HUBSPOT_REDIRECT_URI,
    scope: "oauth crm.objects.contacts.read crm.objects.companies.read crm.objects.leads.read crm.objects.deals.read crm.objects.contacts.write crm.schemas.contacts.write",
    response_type: "code",
  });

  return `https://app.hubspot.com/oauth/authorize?${params}`;
};

// Get User Access Token from MongoDB
export const getUserAccessToken = async (userId) => {
  const user = await User.findById(userId);

  if (!user || !user.hubspotAccessToken) {
    throw new Error("Access token not found. Please connect your HubSpot account.");
  }

  return user.hubspotAccessToken;
};

// Handle Callback from HubSpot OAuth
export const handleHubspotOAuthCallback = async (code) => {
  if (!code) {
    throw new Error("No authorization code received");
  }

  const hubspotClient = new Client();

  const tokenResponse = await hubspotClient.oauth.tokensApi.create(
    "authorization_code",
    code,
    process.env.HUBSPOT_REDIRECT_URI,
    process.env.HUBSPOT_CLIENT_ID,
    process.env.HUBSPOT_CLIENT_SECRET
  );

  const accessToken = tokenResponse.accessToken;
  const expiresIn = tokenResponse.expiresIn;

  hubspotClient.setAccessToken(accessToken);

  const userInfoResponse = await axios.get(
    `https://api.hubapi.com/oauth/v1/access-tokens/${accessToken}`
  );

  const hubspotUser = userInfoResponse.data;

  const user = await User.findOneAndUpdate(
    { email: hubspotUser.user },
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

  return {
    user: {
      email: user.email,
      name: user.name,
      hubspotConnected: true,
      hubspotId: hubspotUser.user_id,
      hubspotAccessToken: accessToken,
    },
  };
};
export const getAllContactsHubsopt = async (accessToken) => {
  try {
    const response = await axios.get(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || error.message || "Unknown error"
    );
  }


}

export const getAllCompaniesHubsopt = async (accessToken) => {
  try {
    const response = await axios.get(
      "https://api.hubapi.com/crm/v3/objects/companies",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || error.message || "Unknown error"
    );
  }


}

export const createBundleOfContactsFormFile = async (accessToken, inputs) => {
  if (!inputs || !Array.isArray(inputs)) {
    throw new Error('Invalid or missing "inputs" array');
  }

  const hubspotClient = new Client({ accessToken });
  const BATCH_SIZE = 100;
  const results = [];

  for (let i = 0; i < inputs.length; i += BATCH_SIZE) {
    const batch = inputs.slice(i, i + BATCH_SIZE);

    const response = await hubspotClient.crm.contacts.batchApi.create({
      inputs: batch,
    });

    console.log(`Batch ${i / BATCH_SIZE + 1}:`, response);
    results.push(response);
  }

  return {
    message: "All contacts created in batches",
    recordLength: results.length,
    results,
  };
};


export const fetchSelectedContactPropertiesFromHubSpot = async (accessToken, properties) => {
  if (!Array.isArray(properties) || properties.length === 0) {
    throw new Error("Please provide an array of property names");
  }

  const requests = properties.map((prop) =>
    axios.get(`https://api.hubapi.com/crm/v3/properties/contacts/${prop}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
  );

  const responses = await Promise.all(requests);
  return responses.map((res) => res.data);
};

export const getAllLeadsHubspot = async (accessToken) => {
  try {
    const response = await axios.get(
      "https://api.hubapi.com/crm/v3/objects/leads?properties=firstname,lastname,email",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;  // return just the data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
};

export const createContactPropertyInHubSpot = async (accessToken, propertyPayload) => {
  try {
    const response = await axios.post(
      "https://api.hubapi.com/crm/v3/properties/contacts",
      propertyPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to create contact property"
    );
  }
};

export const searchOrListContacts = async (accessToken, limit, after, search) => {
  const hubspotClient = new Client({ accessToken });

  try {
    if (search) {
      const request = {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "CONTAINS_TOKEN",
                value: search,
              },
            ],
          },
          {
            filters: [
              {
                propertyName: "firstname",
                operator: "CONTAINS_TOKEN",
                value: search,
              },
            ],
          },
          {
            filters: [
              {
                propertyName: "lastname",
                operator: "CONTAINS_TOKEN",
                value: search,
              },
            ],
          },
        ],
        properties: ["firstname", "lastname", "email", "name"],
        limit,
        after,
      };

      const apiResponse = await hubspotClient.crm.contacts.searchApi.doSearch(request);

      return {
        message: `Search returned ${apiResponse.results.length} results.`,
        results: apiResponse.results,
        paging: apiResponse.paging?.next || null,
      };
    } else {
      const apiResponse = await hubspotClient.crm.contacts.basicApi.getPage(
        limit,
        after,
        undefined,
        undefined,
        undefined,
        false
      );

      return {
        message: `List returned ${apiResponse.results.length} results.`,
        results: apiResponse.results,
        paging: apiResponse.paging?.next || null,
      };
    }
  } catch (err) {
    throw new Error(err.message || "Unknown error occurred while fetching contacts");
  }
};

export const getLimitedContacts = async (accessToken, limit, after) => {
  const hubspotClient = new Client({ accessToken });

  try {
    const apiResponse = await hubspotClient.crm.contacts.basicApi.getPage(
      limit,
      after,
      undefined, // properties
      undefined, // propertiesWithHistory
      undefined, // associations
      false      // archived
    );

    return {
      message: `Length is ${apiResponse.results.length}`,
      results: apiResponse.results,
    };
  } catch (err) {
    throw new Error(err.message || "Failed to fetch limited contacts");
  }
};

export const createSingleContactService = async (accessToken, properties) => {
  const hubspotClient = new Client({ accessToken });

  const SimplePublicObjectInputForCreate = {
    associations: [],
    properties,
  };

  try {
    const apiResponse = await hubspotClient.crm.contacts.basicApi.create(
      SimplePublicObjectInputForCreate
    );

    return apiResponse;
  } catch (err) {
    throw new Error(err.message || "Failed to create contact");
  }
};


export const createDealService = async (accessToken, properties, associations = []) => {
  const hubspotClient = new Client({ accessToken });

  const dealsData = {
    properties,
    associations,
  };

  try {
    const response = await hubspotClient.crm.deals.basicApi.create(dealsData);
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create deal");
  }
};

export const getHubspotDealsService = async (accessToken) => {
  try {
    const response = await axios.get(
      "https://api.hubapi.com/crm/v3/objects/deals",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Service Error - Fetching deals from HubSpot:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch deals from HubSpot");
  }
};