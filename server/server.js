// server/server.js
require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all origins, or specify allowed origins for better security
app.use(cors()); 
app.use(express.json()); // For parsing application/json

// Alpha Vantage API Key
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

if (!ALPHA_VANTAGE_API_KEY) {
    console.error('ERROR: ALPHA_VANTAGE_API_KEY is not set in environment variables.');
    process.exit(1); // Exit if API key is not configured
}

// Proxy endpoint for Alpha Vantage API
app.get('/api/alpha-vantage-proxy', async (req, res) => {
    try {
        const { function: fn, symbol } = req.query;

        if (!fn || !symbol) {
            return res.status(400).json({ error: 'Missing required query parameters: function and symbol.' });
        }

        // Construct Alpha Vantage API URL
        const alphaVantageUrl = `https://www.alphavantage.co/query?function=${fn}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
        
        console.log(`Proxying request to Alpha Vantage: ${alphaVantageUrl}`);

        const response = await axios.get(alphaVantageUrl);
        res.json(response.data); // Send Alpha Vantage response back to client

    } catch (error) {
        console.error('Error proxying Alpha Vantage API request:', error.message);
        if (error.response) {
            // The request was made and the server responded with a status code 
            // that falls out of the range of 2xx
            console.error('Alpha Vantage response data:', error.response.data);
            console.error('Alpha Vantage response status:', error.response.status);
            console.error('Alpha Vantage response headers:', error.response.headers);
            res.status(error.response.status).json({ 
                error: 'Error from Alpha Vantage API', 
                details: error.response.data 
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Alpha Vantage request no response:', error.request);
            res.status(500).json({ error: 'No response received from Alpha Vantage API.' });
        } else {
            // Something happened in setting up the request that triggered an Error
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    }
});

app.listen(port, () => {
    console.log(`Alpha Vantage Proxy Server running on port ${port}`);
});
