console.log('dashboard-crypto.js: Script started.');

document.addEventListener('DOMContentLoaded', () => {
    console.log('dashboard-crypto.js: DOMContentLoaded fired.');
    fetchCryptoData(); // Fetch data on initial load
    setInterval(fetchCryptoData, 60000); // Fetch data every 60 seconds
    fetchFearAndGreedIndex(); // Fetch F&G Index on initial load
    setInterval(fetchFearAndGreedIndex, 3600000); // Fetch F&G Index every hour (CoinGecko updates hourly)
    console.log('dashboard-crypto.js: fetchCryptoData and fetchFearAndGreedIndex called and intervals set.');
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

// === LÓGICA PARA EL ÍNDICE DE MIEDO Y CODICIA ===
async function fetchFearAndGreedIndex() {
    console.log('fetchFearAndGreedIndex: Starting data fetch.');
    const fngValueElem = document.getElementById('fng-value');
    const fngClassificationElem = document.getElementById('fng-classification');
    const fngGaugeCanvas = document.getElementById('fng-gauge');
    const fngApiUrl = 'https://api.alternative.me/fng/';

    try {
        const response = await fetch(fngApiUrl);
        if (!response.ok) throw new Error(`Error fetching F&G Index: ${response.statusText}`);
        const data = await response.json();
        const fngData = data.data[0]; // Get the latest data point

        const value = parseInt(fngData.value);
        const classification = fngData.value_classification;

        fngValueElem.textContent = `Valor: ${value}`;
        fngClassificationElem.textContent = `Clasificación: ${classification}`;
        
        drawGauge(fngGaugeCanvas, value);
        console.log('fetchFearAndGreedIndex: F&G Index updated.');

    } catch (error) {
        console.error("fetchFearAndGreedIndex: Error al cargar el índice de Miedo y Codicia:", error);
        fngValueElem.textContent = 'Error al cargar.';
        fngClassificationElem.textContent = '';
    }
}

function drawGauge(canvas, value) {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height; // Bottom center
    const radius = canvas.width / 2 - 10;
    const startAngle = Math.PI; // 180 degrees
    const endAngle = 0; // 0 degrees (top right)
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#333'; // Dark background for the gauge
    ctx.stroke();

    // Draw colored sections (Fear, Neutral, Greed)
    const sections = [
        { color: 'red',   start: 0,   end: 20,   label: 'Extreme Fear' },
        { color: 'orange', start: 20,  end: 40,   label: 'Fear' },
        { color: 'gray',  start: 40,  end: 60,   label: 'Neutral' },
        { color: 'yellowgreen', start: 60,  end: 80,   label: 'Greed' },
        { color: 'green', start: 80,  end: 100,  label: 'Extreme Greed' }
    ];

    sections.forEach(section => {
        const sectionStartAngle = startAngle - (startAngle - endAngle) * (section.start / 100);
        const sectionEndAngle = startAngle - (startAngle - endAngle) * (section.end / 100);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, sectionStartAngle, sectionEndAngle, true);
        ctx.strokeStyle = section.color;
        ctx.stroke();
    });

    // Draw pointer
    const angle = startAngle - (startAngle - endAngle) * (value / 100);
    const pointerLength = radius - 5;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + pointerLength * Math.cos(angle), centerY + pointerLength * Math.sin(angle));
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
}

console.log('dashboard-crypto.js: Script finished (waiting for DOMContentLoaded).');
