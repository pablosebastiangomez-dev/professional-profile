console.log('dashboard-movers.js: Script started.');

document.addEventListener('DOMContentLoaded', () => {
    console.log('dashboard-movers.js: DOMContentLoaded fired.');
    fetchHybridMoversData();
    console.log('dashboard-movers.js: fetchHybridMoversData called.');
});

// === LÓGICA PARA DASHBOARD HÍBRIDO DE ACCIONES ===
async function fetchHybridMoversData() {
    console.log('fetchHybridMoversData: Starting data fetch from proxy server.');
    const tableBody = document.querySelector('#movers-final-table tbody');
    try {
        const marketMovers = await fetchMarketMoversFromProxy(); // New function name
        displayHybridMovers(marketMovers);
        console.log('fetchHybridMoversData: Table updated with data from proxy server.');
    } catch (error) {
        console.error("fetchHybridMoversData: Error al obtener datos del servidor proxy:", error);
        tableBody.innerHTML = `<tr><td colspan="5" class="error">No se pudieron cargar los movimientos del mercado. Error: ${error.message}. Asegúrate de que el servidor proxy de Alpha Vantage esté funcionando.</td></tr>`;
    }
}

// === LÓGICA PARA OBTENER PRINCIPALES ACCIONES DEL SERVIDOR PROXY ===
async function fetchMarketMoversFromProxy() {
    console.log('fetchMarketMoversFromProxy: Fetching data from proxy server.');
    const popularTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'FB', 'JPM', 'V', 'PG']; // Example popular tickers
    const marketMoversData = [];

    for (const ticker of popularTickers) {
        try {
            // Call our proxy server
            const url = `http://localhost:3000/api/alpha-vantage-proxy?function=GLOBAL_QUOTE&symbol=${ticker}`;
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Proxy server error for ${ticker}: ${errorData.error || response.statusText}`);
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
                console.warn(`Proxy Server: No Global Quote data for ${ticker}.`);
            }
        } catch (error) {
            console.error(`Error fetching data for ${ticker} from proxy server:`, error);
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
