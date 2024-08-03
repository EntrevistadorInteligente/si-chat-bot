const express = require('express');
const router = express.Router();
const axios = require('axios');

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

router.post('/get-access-token', async function (req, res, next) {
  try {
    if (!HEYGEN_API_KEY) {
      throw new Error("API key is missing from environment variables");
    }

    const response = await axios.post(
      "https://api.heygen.com/v1/streaming.create_token",
      {}, 
      {
        headers: {
          "x-api-key": HEYGEN_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data && response.data.data && response.data.data.token) {
      res.status(200).json({ token: response.data.data.token });
    } else {
      throw new Error("Unexpected response structure from Heygen API");
    }
  } catch (error) {
    console.error("Error retrieving access token:", error);
    res.status(500).json({ error: "Failed to retrieve access token", details: error.message });
  }
});

module.exports = router;