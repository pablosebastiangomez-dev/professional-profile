let allCryptoPrices = {}; // Global object to store prices for conversion

document.addEventListener('DOMContentLoaded', () => {
    console.log('dashboard-crypto.js: DOMContentLoaded fired.');
    // Logic for crypto table
    fetchCryptoData(); // Fetch data on initial load for table
    setInterval(fetchCryptoData, 60000); // Fetch data every 60 seconds for table
    
    // Logic for converter
    fetchConverterData(); // Fetch data for converter dropdowns and prices
    setInterval(fetchConverterData, 300000); // Update converter data every 5 minutes

    // Add event listeners for converter elements
    document.getElementById('convert-amount').addEventListener('input', performConversion);
    document.getElementById('convert-from').addEventListener('change', performConversion);
    document.getElementById('convert-to').addEventListener('change', performConversion);

    console.log('dashboard-crypto.js: fetchCryptoData and fetchConverterData called and intervals set.');
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


// === LÓGICA PARA EL CONVERSOR DE CRIPTOMONEDAS ===
async function fetchConverterData() {
    console.log('fetchConverterData: Starting converter data fetch.');
    const selectFrom = document.getElementById('convert-from');
    const selectTo = document.getElementById('convert-to');
    const converterApiUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'; // Fetch more coins for converter
    
    try {
        const response = await fetch(converterApiUrl);
        if (!response.ok) throw new Error(`Error fetching converter data: ${response.statusText}`);
        const coins = await response.json();

        // Add USD as a base currency
        allCryptoPrices['usd'] = 1; // 1 USD = 1 USD
        
        // Clear previous options
        selectFrom.innerHTML = '<option value="usd">USD</option>';
        selectTo.innerHTML = '<option value="usd">USD</option>';

        coins.forEach(coin => {
            allCryptoPrices[coin.id] = coin.current_price;
            const optionFrom = document.createElement('option');
            optionFrom.value = coin.id;
            optionFrom.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;
            selectFrom.appendChild(optionFrom);

            const optionTo = document.createElement('option');
            optionTo.value = coin.id;
            optionTo.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;
            selectTo.appendChild(optionTo);
        });

        // Set default selections
        selectFrom.value = 'bitcoin'; // Default to Bitcoin
        selectTo.value = 'ethereum'; // Default to Ethereum

        // Perform initial conversion
        performConversion();

        console.log('fetchConverterData: Converter data loaded and dropdowns populated.');
    } catch (error) {
        console.error("fetchConverterData: Error al cargar datos del conversor:", error);
        document.getElementById('conversion-result').textContent = 'Error al cargar monedas.';
    }
}

function performConversion() {
    const amount = parseFloat(document.getElementById('convert-amount').value);
    const fromCurrency = document.getElementById('convert-from').value;
    const toCurrency = document.getElementById('convert-to').value;
    const resultElem = document.getElementById('conversion-result');

    if (isNaN(amount) || amount <= 0) {
        resultElem.textContent = 'Ingrese un monto válido.';
        return;
    }

    const fromPrice = allCryptoPrices[fromCurrency];
    const toPrice = allCryptoPrices[toCurrency];

    if (!fromPrice || !toPrice) {
        resultElem.textContent = 'Precios no disponibles.';
        return;
    }

    const convertedValue = (amount * fromPrice) / toPrice;
    resultElem.textContent = `${amount} ${fromCurrency.toUpperCase()} = ${convertedValue.toFixed(6)} ${toCurrency.toUpperCase()}`;
}
