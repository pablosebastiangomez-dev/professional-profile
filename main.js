// ==========================
// LÓGICA PRINCIPAL UNIFICADA
// Se ejecuta una sola vez cuando el HTML de cualquier página ha cargado.
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    // Buscamos las tablas activas en el documento.
    const cryptoTable = document.querySelector('#crypto-table');
    const moversTable = document.querySelector('#movers-table');
    
    // Si encuentra la tabla de criptos, carga esos datos.
    if (cryptoTable) {
        fetchCryptoData();
    }
    
    // Si encuentra la tabla de market movers, carga los datos con IA.
    if (moversTable) {
        fetchMarketMoversData();
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
        
        cryptoTableBody.innerHTML = ''; // Limpiamos el mensaje de "Cargando..."

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
        cryptoTableBody.innerHTML = `<tr><td colspan="5" class="error">No se pudieron cargar los datos.</td></tr>`;
    }
}


// =================================
// FUNCIÓN PARA OBTENER MARKET MOVERS (CON LOGS DE DEPURACIÓN)
// =================================
async function fetchMarketMoversData() {
    const tableBody = document.querySelector('#movers-table tbody');
    try {
        console.log("1. Iniciando la petición a la función serverless...");
        const response = await fetch('/.netlify/functions/gemini-scraper');
        console.log("2. Respuesta recibida del servidor:", response);

        if (!response.ok) {
            throw new Error(`La respuesta del servidor no fue exitosa. Estado: ${response.status}`);
        }

        console.log("3. Intentando convertir la respuesta a JSON...");
        const movers = await response.json();
        console.log("4. JSON convertido exitosamente:", movers);

        console.log("5. Intentando mostrar los datos en la tabla...");
        displayMarketMovers(movers);
        console.log("6. ¡Datos mostrados exitosamente!");

    } catch (error) {
        console.error("ERROR FINAL DETECTADO:", error); // Esto nos mostrará el error real
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


// ==========================
// FUNCIONES AUXILIARES (Para formatear números)
// ==========================
const formatCurrency = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
const formatMarketCap = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(num);
const formatNumber = (num) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(num);
