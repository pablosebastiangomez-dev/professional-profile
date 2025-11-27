// netlify/functions/fmp-api.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const FMP_API_KEY = process.env.FMP_API_KEY;
    const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';

    if (!FMP_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "FMP API Key not configured." })
        };
    }

    try {
        const url = `${FMP_BASE_URL}/actives?apikey=${FMP_API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Error from FMP API: ${errorText}` })
            };
        }

        const data = await response.json();

        const formattedData = data.map(stock => ({
            simbolo: stock.ticker,
            nombre: stock.companyName,
            precio: stock.price,
            cambio_porcentaje: stock.changesPercentage,
            volumen: stock.volume.toLocaleString('en-US')
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(formattedData)
        };
    } catch (error) {
        console.error("Error fetching FMP data:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch data from FMP API.", details: error.message })
        };
    }
};
