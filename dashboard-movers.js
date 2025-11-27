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
        console.log('fetchHybridMoversData: Fetching main stocks from TradingView API (simulated).');
        const mainStocks = await fetchMainStocksFromTradingView();
        
        // Assuming fmp-api is still used for additional financial data
        const apiResponse = await fetch('/.netlify/functions/fmp-api');
        if (!apiResponse.ok) {
            throw new Error(`La API de FMP falló. Revisa la clave de API en Netlify. Estado: ${apiResponse.status}, Texto: ${apiResponse.statusText}`);
        }
        const financialsFromAPI = await apiResponse.json();
        console.log('fetchHybridMoversData: Data from TradingView (simulated) and FMP parsed.');

        const financialsMap = new Map(financialsFromAPI.map(stock => [stock.simbolo, stock]));

        const mergedData = mainStocks.map(company => {
            const financials = financialsMap.get(company.simbolo) || {};
            // Merge TradingView data with FMP data
            return {
                simbolo: company.simbolo,
                nombre: company.nombre,
                precio: company.precio || financials.precio, // Prefer TradingView price, fallback to FMP
                cambio_porcentaje: company.cambio_porcentaje || financials.cambio_porcentaje, // Prefer TradingView change, fallback to FMP
                volumen: company.volumen || financials.volumen // Prefer TradingView volume, fallback to FMP
            };
        });

        displayHybridMovers(mergedData);
        console.log('fetchHybridMoversData: Table updated with data.');

    } catch (error) {
        console.error("fetchHybridMoversData: Error al obtener datos híbridos:", error);
        // Display generic error if main stock fetch or FMP API fails
        tableBody.innerHTML = `<tr><td colspan="5" class="error">No se pudieron cargar los movimientos del mercado. Error: ${error.message}</td></tr>`;
    }
}

// === LÓGICA PARA OBTENER PRINCIPALES ACCIONES DE TRADINGVIEW (SIMULADO) ===
async function fetchMainStocksFromTradingView() {
    console.log('fetchMainStocksFromTradingView: Simulating fetch from TradingView API.');
    // In a real scenario, this would involve actual API calls to TradingView
    // For now, we'll return some mock data based on the OpenAPI spec
    const mockStocks = [
        { simbolo: 'AAPL', nombre: 'Apple Inc.', precio: 170.00, cambio_porcentaje: 1.25, volumen: '100M' },
        { simbolo: 'MSFT', nombre: 'Microsoft Corp.', precio: 430.50, cambio_porcentaje: -0.75, volumen: '80M' },
        { simbolo: 'GOOGL', nombre: 'Alphabet Inc. (Class A)', precio: 150.20, cambio_porcentaje: 2.10, volumen: '60M' },
        { simbolo: 'AMZN', nombre: 'Amazon.com Inc.', precio: 180.10, cambio_porcentaje: -0.30, volumen: '95M' },
        { simbolo: 'NVDA', nombre: 'NVIDIA Corp.', precio: 900.80, cambio_porcentaje: 3.50, volumen: '120M' },
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate a possible error for testing the fallback
    // if (Math.random() > 0.8) {
    //     throw new Error('Simulated TradingView API error');
    // }

    return mockStocks;
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
