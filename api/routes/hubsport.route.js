import express from "express";
const router = express.Router();
import { getAuthHubspot, getCallbackAuthMethod, getHubspotContacts } from "../controller/hubspot.controller.js";

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


router.get('/auth/hubspot', getAuthHubspot);
router.get('/auth/hubspot/callback', getCallbackAuthMethod);

router.get('/hubspot/contacts', getHubspotContacts);



export default router