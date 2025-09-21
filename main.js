// ==========================
// CONFIGURACIÓN GENERAL
// ==========================

// 🔑 IMPORTANTE: Reemplaza con tus propias claves de API.
// La clave de Alpha Vantage es gratuita y la puedes obtener en su sitio web.
const ALPHA_VANTAGE_API_KEY = "1UOK46NY9578FX4Y"; 

// Lista de símbolos de acciones del S&P 500 que queremos mostrar.
const SP500_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM'];

// Nombres de las empresas para que se vean más amigables.
const COMPANY_NAMES = {
    'AAPL': 'Apple Inc.', 'MSFT': 'Microsoft Corp.', 'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com, Inc.', 'NVDA': 'NVIDIA Corp.', 'META': 'Meta Platforms, Inc.',
    'TSLA': 'Tesla, Inc.', 'JPM': 'JPMorgan Chase & Co.'
};


// ==========================
// LÓGICA PRINCIPAL
// Se ejecuta cuando el HTML ha cargado completamente.
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    // Buscamos las tablas en el documento.
    const cryptoTable = document.querySelector('#crypto-table');
    const sp500Table = document.querySelector('#sp500-table');
    
    // Si encuentra la tabla de criptos, carga esos datos.
    if (cryptoTable) {
        fetchCryptoData();
    }
    
    // Si encuentra la tabla de acciones, carga esos otros datos.
    if (sp500Table) {
        fetchSP500Data();
    }
});


// =================================
// FUNCIÓN PARA OBTENER CRIPTOMONEDAS (API de CoinGecko)
// =================================
async function fetchCryptoData() {
    const cryptoTableBody = document.querySelector('#crypto-table tbody');
    const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Error en la respuesta: ${response.statusText}`);
        const coins = await response.json();
        
        // Limpiamos el mensaje de "Cargando..."
        cryptoTableBody.innerHTML = ''; 

        // Creamos una fila en la tabla por cada moneda.
        coins.forEach((coin, index) => {
            const priceChange = coin.price_change_percentage_24h;
            const changeColorClass = priceChange >= 0 ? 'color-green' : 'color-red';
            
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td class="coin-name">
                        <img src="${coin.image}" alt="${coin.name} logo">
                        <span>${coin.name} <span class="symbol">${coin.symbol.toUpperCase()}</span></span>
                    </td>
                    <td>${formatCurrency(coin.current_price)}</td>
                    <td class="${changeColorClass}">${priceChange.toFixed(2)}%</td>
                    <td>${formatMarketCap(coin.market_cap)}</td>
                </tr>
            `;
            cryptoTableBody.innerHTML += row;
        });

    } catch (error) {
        console.error("Error al cargar datos de criptomonedas:", error);
        cryptoTableBody.innerHTML = `<tr><td colspan="5" class="error">No se pudieron cargar los datos. Intenta de nuevo más tarde.</td></tr>`;
    }
}


// =================================
// FUNCIÓN PARA OBTENER ACCIONES (API de Alpha Vantage)
// =================================
async function fetchSP500Data() {
    const stocksTableBody = document.querySelector('#sp500-table tbody');
    stocksTableBody.innerHTML = ''; // Limpiamos la tabla para empezar a llenarla.

    for (const symbol of SP500_SYMBOLS) {
        const apiUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`Error en la respuesta: ${response.statusText}`);
            const data = await response.json();

            // Alpha Vantage a veces responde con un objeto vacío si la clave es inválida o se excede el límite.
            if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
                const quote = data['Global Quote'];
                const price = parseFloat(quote['05. price']);
                const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
                const volume = parseInt(quote['06. volume']);

                const changeColorClass = changePercent >= 0 ? 'color-green' : 'color-red';

                const row = `
                    <tr>
                        <td>${symbol}</td>
                        <td class="stock-name">${COMPANY_NAMES[symbol] || symbol}</td>
                        <td>${formatCurrency(price)}</td>
                        <td class="${changeColorClass}">${changePercent.toFixed(2)}%</td>
                        <td>${formatNumber(volume)}</td>
                    </tr>
                `;
                stocksTableBody.innerHTML += row;
            } else {
                // Si no hay datos para un símbolo, lo mostramos en la consola.
                console.warn(`No se recibieron datos para el símbolo: ${symbol}. Puede ser por el límite de la API.`);
            }

            // IMPORTANTE: Pausa de 15 segundos entre cada llamada para no superar el límite
            // de la API gratuita de Alpha Vantage (5 llamadas por minuto).
            await new Promise(resolve => setTimeout(resolve, 15000)); 

        } catch (error) {
            console.error(`Error al cargar datos para ${symbol}:`, error);
            // Si quieres, puedes agregar una fila de error en la tabla aquí.
        }
    }
}


// ==========================
// FUNCIONES AUXILIARES (Para formatear números)
// ==========================
const formatCurrency = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
const formatMarketCap = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(num);
const formatNumber = (num) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(num);

// ... al final de tu archivo main.js

// Detectamos si estamos en la página de Market Movers
document.addEventListener('DOMContentLoaded', () => {
    // ... tu código existente para las otras tablas
    const moversTable = document.querySelector('#movers-table');
    if (moversTable) {
        fetchMarketMoversData();
    }
});


async function fetchMarketMoversData() {
    const tableBody = document.querySelector('#movers-table tbody');
    try {
        // Llamamos a nuestra nueva función serverless
        const response = await fetch('/.netlify/functions/gemini-scraper');
        if (!response.ok) {
            throw new Error('La respuesta del servidor no fue exitosa');
        }
        const movers = await response.json();
        
        displayMarketMovers(movers);

    } catch (error) {
        console.error("Error al obtener datos de market movers:", error);
        tableBody.innerHTML = `<tr><td colspan="4" class="error">No se pudieron obtener los datos.</td></tr>`;
    }
}

function displayMarketMovers(movers) {
    const tableBody = document.querySelector('#movers-table tbody');
    tableBody.innerHTML = ''; // Limpiamos la tabla

    movers.forEach(stock => {
        const changeColorClass = stock.cambio_porcentaje >= 0 ? 'color-green' : 'color-red';
        const row = `
            <tr>
                <td class="coin-name">
                    <span>${stock.nombre} <span class="symbol">${stock.simbolo}</span></span>
                </td>
                <td>${formatCurrency(stock.precio)}</td>
                <td class="${changeColorClass}">${stock.cambio_porcentaje}%</td>
                <td>${stock.volumen}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}
