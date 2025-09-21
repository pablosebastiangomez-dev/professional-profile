// ==========================
// LÓGICA PRINCIPAL UNIFICADA
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    const cryptoTable = document.querySelector('#crypto-table');
    const aiTable = document.querySelector('#ai-table');
    const apiTable = document.querySelector('#api-table');
    
    if (cryptoTable) fetchCryptoData();
    if (aiTable) fetchAiData();
    if (apiTable) fetchApiData();
});

// === LÓGICA PARA DASHBOARD DE CRIPTOMONEDAS ===
async function fetchCryptoData() {
    // ... (esta función se queda exactamente igual que antes)
    const cryptoTableBody = document.querySelector('#crypto-table tbody');
    const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false';
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Error en la respuesta: ${response.statusText}`);
        const coins = await response.json();
        cryptoTableBody.innerHTML = ''; 
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
        cryptoTableBody.innerHTML = `<tr><td colspan="5" class="error">No se pudieron cargar los datos.</td></tr>`;
    }
}

// === LÓGICA PARA DASHBOARD DE IA (GEMINI) ===
async function fetchAiData() {
    const tableBody = document.querySelector('#ai-table tbody');
    try {
        const response = await fetch('/.netlify/functions/gemini-scraper');
        if (!response.ok) throw new Error('Respuesta de servidor no fue exitosa');
        const data = await response.json();
        
        tableBody.innerHTML = '';
        data.forEach(stock => {
            const row = `
                <tr>
                    <td class="coin-name">
                        <span>${stock.nombre} <span class="symbol">${stock.simbolo}</span></span>
                    </td>
                    <td>${stock.volumen}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="2" class="error">No se pudieron obtener los datos de la IA.</td></tr>`;
    }
}

// === LÓGICA PARA DASHBOARD DE API (FMP) ===
async function fetchApiData() {
    const tableBody = document.querySelector('#api-table tbody');
    try {
        const response = await fetch('/.netlify/functions/fmp-api');
        if (!response.ok) throw new Error('Respuesta de servidor no fue exitosa');
        const data = await response.json();

        tableBody.innerHTML = '';
        data.forEach(stock => {
            const changeColorClass = stock.cambio_porcentaje >= 0 ? 'color-green' : 'color-red';
            const row = `
                <tr>
                    <td>${stock.simbolo}</td>
                    <td>${formatCurrency(stock.precio)}</td>
                    <td class="${changeColorClass}">${stock.cambio_porcentaje.toFixed(2)}%</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="3" class="error">No se pudieron obtener los datos de la API.</td></tr>`;
    }
}

// === FUNCIONES AUXILIARES ===
const formatCurrency = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
const formatMarketCap = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(num);
