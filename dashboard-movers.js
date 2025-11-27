console.log('dashboard-movers.js: Script started.');

document.addEventListener('DOMContentLoaded', () => {
    console.log('dashboard-movers.js: DOMContentLoaded fired.');
    fetchHybridMoversData();
    console.log('dashboard-movers.js: fetchHybridMoversData called.');
});

// === LÓGICA PARA DASHBOARD HÍBRIDO DE ACCIONES ===
async function fetchHybridMoversData() {
    console.log('fetchHybridMoversData: Starting data fetch from Alpha Vantage API.');
    const tableBody = document.querySelector('#movers-final-table tbody');
    try {
        const marketMovers = await fetchMarketMoversFromAlphaVantage();
        displayHybridMovers(marketMovers);
        console.log('fetchHybridMoversData: Table updated with data from Alpha Vantage.');
    } catch (error) {
        console.error("fetchHybridMoversData: Error al obtener datos de Alpha Vantage:", error);
        tableBody.innerHTML = `<tr><td colspan="5" class="error">No se pudieron cargar los movimientos del mercado. Error: ${error.message}. Por favor, verifica tu clave de API de Alpha Vantage o inténtalo de nuevo más tarde.</td></tr>`;
    }
}

// === LÓGICA PARA OBTENER PRINCIPALES ACCIONES DE ALPHA VANTAGE ===
async function fetchMarketMoversFromAlphaVantage() {
    console.log('fetchMarketMoversFromAlphaVantage: Fetching data from Alpha Vantage API.');
    // !!! ADVERTENCIA DE SEGURIDAD !!!
    // Exponer la clave de API directamente en el código del lado del cliente es INSEGURO.
    // Para una aplicación de producción, siempre usa un backend (como una función Netlify)
    // para proxyar las solicitudes a la API y proteger tu clave de API.
    // Para propósitos de este ejercicio y por la solicitud del usuario de evitar funciones Netlify,
    // se coloca la clave aquí. REEMPLAZA 'YOUR_ALPHA_VANTAGE_API_KEY' con tu clave real.
    const ALPHA_VANTAGE_API_KEY = 'YOUR_ALPHA_VANTAGE_API_KEY'; 

    if (ALPHA_VANTAGE_API_KEY === 'YOUR_ALPHA_VANTAGE_API_KEY' || !ALPHA_VANTAGE_API_KEY) {
        throw new Error("Clave de API de Alpha Vantage no configurada. Edita dashboard-movers.js para añadir tu clave.");
    }

    const popularTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'FB', 'JPM', 'V', 'PG']; // Example popular tickers
    const marketMoversData = [];

    for (const ticker of popularTickers) {
        try {
            const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Alpha Vantage API error for ${ticker}: ${response.statusText}`);
            }
            const data = await response.json();

            const globalQuote = data['Global Quote'];

            if (globalQuote && globalQuote['01. symbol']) {
                const price = parseFloat(globalQuote['05. price']);
                const changePercentRaw = globalQuote['10. change percent']; 
                const changePercent = parseFloat(changePercentRaw.replace('%', ''));

                marketMoversData.push({
                    simbolo: globalQuote['01. symbol'],
                    nombre: globalQuote['01. symbol'], 
                    precio: price,
                    cambio_porcentaje: changePercent,
                    volumen: parseFloat(globalQuote['06. volume']).toLocaleString('en-US') 
                });
            } else {
                console.warn(`Alpha Vantage: No Global Quote data for ${ticker}.`);
            }
        } catch (error) {
            console.error(`Error fetching data for ${ticker} from Alpha Vantage:`, error);
            // Continue processing other tickers even if one fails
        }
    }
    return marketMoversData;
}

function displayHybridMovers(data) {
    console.log('displayHybridMovers: Updating table.');
    const tableBody = document.querySelector('#movers-final-table tbody');
    tableBody.innerHTML = '';
    
    const fragment = document.createDocumentFragment();

    data.forEach(stock => {
        const price = stock.precio ?? 0;
        const change = stock.cambio_porcentaje ?? 0;
        const changeColorClass = change >= 0 ? 'color-green' : 'color-red';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stock.simbolo}</td>
            <td class="stock-name">${stock.nombre}</td>
            <td>${formatCurrency(price)}</td>
            <td class="${changeColorClass}">${change.toFixed(2)}%</td>
            <td>${stock.volumen || 'N/A'}</td>
        `;
        fragment.appendChild(row);
    });
    tableBody.appendChild(fragment);
    console.log('displayHybridMovers: Table updated.');
}

// === FUNCIONES AUXILIARES ===
const formatCurrency = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
const formatMarketCap = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(num);

console.log('dashboard-movers.js: Script finished (waiting for DOMContentLoaded).');
