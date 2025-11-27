console.log('dashboard-crypto.js: Script started.');

document.addEventListener('DOMContentLoaded', () => {
    console.log('dashboard-crypto.js: DOMContentLoaded fired.');
    fetchCryptoData(); // Fetch data on initial load
    setInterval(fetchCryptoData, 60000); // Fetch data every 60 seconds
    console.log('dashboard-crypto.js: fetchCryptoData called and interval set.');
});

let isFetching = false;

// === LÓGICA PARA DASHBOARD DE CRIPTOMONEDAS ===
async function fetchCryptoData() {
    if (isFetching) {
        console.log('fetchCryptoData: Already fetching data. Skipping this run.');
        return;
    }
    isFetching = true;
    console.log('fetchCryptoData: Starting data fetch.');
    const cryptoTableBody = document.querySelector('#crypto-table tbody');
    const statusDiv = document.getElementById('update-status');
    if (statusDiv) statusDiv.textContent = 'Actualizando...';
    
    const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false';
    try {
        console.log('fetchCryptoData: Fetching from API:', apiUrl);
        const response = await fetch(apiUrl);
        console.log('fetchCryptoData: API response received, status:', response.status);
        if (!response.ok) throw new Error(`Error en la respuesta: ${response.statusText}`);
        const coins = await response.json();
        console.log('fetchCryptoData: Data parsed:', coins.length, 'coins.');

        // First time loading
        if (cryptoTableBody.children.length === 0 || cryptoTableBody.querySelector('.loading')) {
            cryptoTableBody.innerHTML = ''; // Clear loading message
            const fragment = document.createDocumentFragment();
            coins.forEach((coin, index) => {
                const row = document.createElement('tr');
                row.dataset.symbol = coin.symbol;
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td class="coin-name">
                        <img src="${coin.image}" alt="${coin.name} logo">
                        <span>${coin.name} <span class="symbol">${coin.symbol.toUpperCase()}</span></span>
                    </td>
                    <td>${formatCurrency(coin.current_price)}</td>
                    <td class="${coin.price_change_percentage_24h >= 0 ? 'color-green' : 'color-red'}">${coin.price_change_percentage_24h.toFixed(2)}%</td>
                    <td>${formatMarketCap(coin.market_cap)}</td>
                `;
                fragment.appendChild(row);
            });
            cryptoTableBody.appendChild(fragment);
        } else {
            // Update existing rows
            coins.forEach((coin) => {
                const row = cryptoTableBody.querySelector(`[data-symbol="${coin.symbol}"]`);
                if (row) {
                    const oldPrice = parseFloat(row.cells[2].textContent.replace(/[^0-9.-]+/g,""));
                    const newPrice = coin.current_price;
                    
                    let priceClass = '';
                    if (newPrice > oldPrice) {
                        priceClass = 'price-up';
                    } else if (newPrice < oldPrice) {
                        priceClass = 'price-down';
                    }

                    row.cells[2].textContent = formatCurrency(newPrice);
                    if (priceClass) {
                        // Reset animation
                        row.cells[2].classList.remove('price-up', 'price-down');
                        void row.cells[2].offsetWidth; // Trigger reflow
                        row.cells[2].classList.add(priceClass);
                    }
                    
                    row.cells[3].textContent = `${coin.price_change_percentage_24h.toFixed(2)}%`;
                    row.cells[3].className = coin.price_change_percentage_24h >= 0 ? 'color-green' : 'color-red';
                    row.cells[4].textContent = formatMarketCap(coin.market_cap);
                }
            });
        }
        
        console.log('fetchCryptoData: Table updated with data.');
        if (statusDiv) statusDiv.textContent = `Última actualización: ${new Date().toLocaleTimeString()}`;
    } catch (error) {
        console.error("fetchCryptoData: Error al cargar datos:", error);
        if (cryptoTableBody.children.length === 0) { // Only show error if table is empty
            cryptoTableBody.innerHTML = `<tr><td colspan="5" class="error">No se pudieron cargar los datos de criptomonedas. Error: ${error.message}</td></tr>`;
        }
        if (statusDiv) statusDiv.textContent = 'Error al actualizar.';
    } finally {
        isFetching = false;
        console.log('fetchCryptoData: Fetching finished.');
    }
}

// === FUNCIONES AUXILIARES ===
const formatCurrency = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
const formatMarketCap = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(num);

console.log('dashboard-crypto.js: Script finished (waiting for DOMContentLoaded).');
