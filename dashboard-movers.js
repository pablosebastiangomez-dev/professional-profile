console.log('dashboard-movers.js: Script started.');

document.addEventListener('DOMContentLoaded', () => {
    console.log('dashboard-movers.js: DOMContentLoaded fired.');
    fetchHybridMoversData();
    console.log('dashboard-movers.js: fetchHybridMoversData called.');
});

// === LÓGICA PARA DASHBOARD HÍBRIDO DE ACCIONES ===
async function fetchHybridMoversData() {
    console.log('fetchHybridMoversData: Starting data fetch.');
    const tableBody = document.querySelector('#movers-final-table tbody');
    try {
        console.log('fetchHybridMoversData: Fetching from Netlify functions.');
        const [aiResponse, apiResponse] = await Promise.all([
            fetch('/.netlify/functions/gemini-scraper'),
            fetch('/.netlify/functions/fmp-api')
        ]);
        console.log('fetchHybridMoversData: Netlify functions responses received.');

        // Verificamos cada respuesta por separado para dar un error específico
        if (!aiResponse.ok) {
            try {
                const errorData = await aiResponse.json();
                throw new Error(`La función de IA falló: ${errorData.error || 'Error desconocido'}`);
            } catch (jsonError) {
                const errorText = await aiResponse.text();
                throw new Error(`No se pudo obtener la información de la IA. El servidor no devolvió una respuesta JSON válida. Estado: ${aiResponse.status}, Respuesta: ${errorText.substring(0, 100)}...`);
            }
        }
        if (!apiResponse.ok) {
            throw new Error(`La API de FMP falló. Revisa la clave de API en Netlify. Estado: ${apiResponse.status}, Texto: ${apiResponse.statusText}`);
        }

        const companiesFromAI = await aiResponse.json();
        const financialsFromAPI = await apiResponse.json();
        console.log('fetchHybridMoversData: Data from AI and FMP parsed.');

        const financialsMap = new Map(financialsFromAPI.map(stock => [stock.simbolo, stock]));

        const mergedData = companiesFromAI.map(company => {
            const financials = financialsMap.get(company.simbolo) || {};
            return { ...company, ...financials };
        });

        displayHybridMovers(mergedData);
        console.log('fetchHybridMoversData: Table updated with data.');

    } catch (error) {
        console.error("fetchHybridMoversData: Error al obtener datos híbridos:", error);
        // Si falla la IA o cualquier otro error, intentamos cargar datos de criptomonedas como fallback
        console.log('fetchHybridMoversData: AI data fetch failed, attempting crypto fallback.');
        try {
            const cryptoData = await fetchAndFormatCryptoDataForMovers();
            displayHybridMovers(cryptoData);
            console.log('fetchHybridMoversData: Crypto fallback data displayed.');
        } catch (cryptoError) {
            console.error("fetchHybridMoversData: Error en el fallback de criptomonedas:", cryptoError);
            tableBody.innerHTML = `<tr><td colspan="5" class="error">No se pudieron cargar los movimientos del mercado. Intente de nuevo más tarde. Error AI: ${error.message}. Error Crypto Fallback: ${cryptoError.message}</td></tr>`;
        }
    }
}

// === LÓGICA PARA FALLBACK DE CRIPTOMONEDAS ===
async function fetchAndFormatCryptoDataForMovers() {
    console.log('fetchAndFormatCryptoDataForMovers: Starting crypto data fetch for fallback.');
    const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false';
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Error en la respuesta de CoinGecko: ${response.statusText}`);
        const coins = await response.json();
        console.log('fetchAndFormatCryptoDataForMovers: Crypto data fetched and parsed.');

        return coins.map(coin => ({
            simbolo: coin.symbol.toUpperCase(),
            nombre: coin.name,
            precio: coin.current_price,
            cambio_porcentaje: coin.price_change_percentage_24h,
            // Usamos market_cap como un sustituto para volumen en este contexto de fallback
            volumen: formatMarketCap(coin.market_cap) 
        }));
    } catch (error) {
        console.error("fetchAndFormatCryptoDataForMovers: Error fetching crypto data:", error);
        throw error; // Re-throw to be caught by the main fetchHybridMoversData catch block
    }
}

// === FUNCIONES AUXILIARES ===
const formatCurrency = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
const formatMarketCap = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(num);

console.log('dashboard-movers.js: Script finished (waiting for DOMContentLoaded).');
