
import axios from "axios";


export const getPipedriveAuthUrl = () => {
  const clientId = process.env.PIPEDRIVE_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.REDIRECT_URI);

  return `https://oauth.pipedrive.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
};

export const exchangeCodeForToken = async (code) => {
  const clientId = process.env.PIPEDRIVE_CLIENT_ID;
  const clientSecret = process.env.PIPEDRIVE_CLIENT_SECRET;

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await axios.post(
    "https://oauth.pipedrive.com/oauth/token",
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.REDIRECT_URI,
    }).toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authHeader}`,
      },
    }
  );

  return response.data; // Contains access_token, refresh_token, etc.
};
export const fetchOrganizationsFromPipedrive = async (accessToken) => {
  try {
    const response = await axios.get(
      "https://api.pipedrive.com/v1/organizations",
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
      error.response?.data?.error || error.message || "Unknown error"
    );
  }
};


export const fetchPersonContactsFromPipedrive = async (accessToken) => {
  try {
    const response = await axios.get("https://api.pipedrive.com/v1/persons", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || error.message || "Unknown error"
    );
  }
};

export const fetchAllProductsFromPipedrive = async (accessToken) => {
  try {
    const response = await axios.get(
      "https://api.pipedrive.com/api/v2/products",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          limit: 10, // You can customize this value
          sort_by: "name",
          sort_direction: "asc",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || error.message || "Unknown error"
    );
  }
};


export const createPersonInPipedrive = async (accessToken, personData) => {

  try {
    const response = await axios.post(
      "https://api.pipedrive.com/v1/persons",
      personData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }

}

export const createProductInPipedrive = async (accessToken, productData) => {

  try {
    const response = await axios.post(
      "https://api.pipedrive.com/v1/products",
      productData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }

}

export const searchProductPipedrive = async (accessToken, search) => {

  try {
    const response = await axios.get(
      `https://api.pipedrive.com/api/v2/products/search?term=${search}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }

}