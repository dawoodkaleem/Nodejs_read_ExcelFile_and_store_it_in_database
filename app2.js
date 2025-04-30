// app2.js
import express from "express";
import dotenv from "dotenv";
import { Client } from "@hubspot/api-client";

dotenv.config();

const app = express();
const PORT = 3000;

const CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
const CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;
const REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI;
const SCOPES = ["contacts", "oauth"];

const hubspotClient = new Client();

app.get("/auth", (req, res) => {
  const authUrl = hubspotClient.oauth.getAuthorizationUrl(CLIENT_ID, REDIRECT_URI, SCOPES);
  res.redirect(authUrl);
});

app.get("/auth/hubspot/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const tokenResponse = await hubspotClient.oauth.defaultApi.createToken(
      "authorization_code",
      code,
      REDIRECT_URI,
      CLIENT_ID,
      CLIENT_SECRET
    );

    const accessToken = tokenResponse.body.accessToken;
    hubspotClient.setAccessToken(accessToken);

    const userInfo = await hubspotClient.oauth.defaultApi.getAccessTokenInfo(accessToken);

    res.json({
      message: "Authenticated successfully!",
      user: userInfo.body
    });

  } catch (err) {
    console.error("OAuth Error:", err.response?.body || err.message);
    res.status(500).send("OAuth failed.");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`🔗 Start OAuth at http://localhost:${PORT}/auth`);
});

export default app;