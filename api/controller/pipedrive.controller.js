import {
  fetchOrganizationsFromPipedrive,
  createPersonInPipedrive,
  createProductInPipedrive,
  fetchPersonContactsFromPipedrive,
  fetchAllProductsFromPipedrive,
  getPipedriveAuthUrl,
  exchangeCodeForToken,
  searchProductPipedrive
} from "../services/pipedrive.services.js";

// Redirect to Pipedrive login
export const pipedriveLogin = (req, res) => {
  const authUrl = getPipedriveAuthUrl();
  res.redirect(authUrl);
};

// Callback from Pipedrive after authorization
export const pipedriveCallback = async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    const accessTokenData = await exchangeCodeForToken(code);
    res.status(200).json({
      message: "Authenticated successfully",
      accessToken: accessTokenData,
    });
  } catch (error) {
    console.error(
      "Error exchanging token:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to authenticate with Pipedrive" });
  }
};

export const getAllContacts = async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1]; // Assuming "Bearer <token>" format

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is missing" });
  }

  try {
    const response = await fetchPersonContactsFromPipedrive(accessToken);

    res.status(200).json({
      message: "Contacts fetched successfully",
      data: response.data,
    });
  } catch (error) {
    console.error(
      "Error fetching contacts:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch contacts from Pipedrive" });
  }
};

export const getAllProducts = async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is missing" });
  }

  try {
    const response = await fetchAllProductsFromPipedrive(accessToken);

    res.status(200).json({
      message: "Products fetched successfully",
      data: response.data,
    });
  } catch (error) {
    console.error(
      "Error fetching products:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch products from Pipedrive" });
  }
};
export const getOrganizations = async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is missing" });
  }

  try {
    const response = await fetchOrganizationsFromPipedrive(accessToken);
    res.status(200).json({
      success: true,
      message: "Organizations fetched successfully",
      data: response.data,
    });
  } catch (error) {
    console.error(
      "Error fetching organizations:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch organizations from Pipedrive",
      error: error.response?.data || error.message,
    });
  }
};

export const createPerson = async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

  if (!accessToken) {
    return res.status(401).json({ error: "Access token is missing" });
  }

  try {
    const {
      name,
      owner_id,
      org_id,
      add_time,
      update_time,
      emails,
      phones,
      visible_to,
      label_ids,
      marketing_status,
    } = req.body;

    // Prepare data as expected by Pipedrive API
    const personData = {
      name,
      owner_id,
      org_id,
      add_time,
      update_time,
      email: emails,
      phone: phones,
      visible_to,
      label_ids,
      marketing_status,
    };

    const response = await createPersonInPipedrive(accessToken, personData);
    return res.status(200).json({
      success: true,
      message: "Person created successfully in Pipedrive",
      data: response.data,
    });
  } catch (error) {
    console.error(
      "Error creating person:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      success: false,
      message: "Failed to create person in Pipedrive",
      error: error.response?.data || error.message,
    });
  }
};

export const createProducts = async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1]; //Berear token

  if (!accessToken) {
    res.status(401).json({ message: "AccessToken is missing " });
  }
  try {
    const {
      name,
      code,
      description,
      unit,
      tax,
      category,
      owner_id,
      is_linkable = true,
      visible_to,
      price = [],
      billing_frequenc,
      billing_frequency_cycles,
    } = req.body;

    const productData = {
      name,
      code,
      description,
      unit,
      tax,
      category,
      owner_id,
      is_linkable,
      visible_to,
      price,
      billing_frequenc,
      billing_frequency_cycles,
    };
    const response = await createProductInPipedrive(accessToken, productData);
    return res.status(200).json({
      sucess: true,
      message: "Create Product Succesfully ",
      data: response.data,
    });
  } catch (error) {
    console.error(
      "Error creating person:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to create Product from Pipedrive",
      error: error.response?.data || error.message,
    });
  }
};
export const searchProduct = async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) {
    return res.status(401).json({ message: "AccessToken is missing" });
  }
  const search = req.query.search;
  if (!search) {
    return res.status(400).json({ message: "Search query is missing" });
  }
  try {
    const response = await searchProductPipedrive(accessToken, search)
    res.status(200).json({
      success: true,
      Result: response.data,
    });
  } catch (error) {
    console.error(
      "Error creating Searcing:",
      error.response?.data || error.message
    );
    res.status(404).json({
      success: false,
      message: `Product not found ${search}`,
      error: error.response?.data || error.message,
    });
  }
};

// Sample Seacrh with all parameter URL GET /your-api-endpoint?term=example&fields=name,code&exact_match=false&include_fields=product.price&start=0&limit=10
