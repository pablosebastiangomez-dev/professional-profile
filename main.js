// main.js - Versión con errores detallados
console.log('main.js: Script started.');

document.addEventListener('DOMContentLoaded', () => {
    console.log('main.js: DOMContentLoaded fired.');
    
    // Lógica para el botón "Volver Arriba" y resaltado de la navegación
    const backToTopButton = document.getElementById('back-to-top');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar nav ul a');

    console.log('main.js: Setting up scroll event listener.');
    window.addEventListener('scroll', () => {
        // Visibilidad del botón "Volver Arriba"
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }

        // Resaltado del enlace de navegación activo
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - sectionHeight / 3) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
    console.log('main.js: Scroll event listener set.');

    // Desplazamiento suave para el botón "Volver Arriba"
    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    console.log('main.js: Back to top button event listener set.');

    // Lógica para el manejo de pestañas
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length > 0 && tabContents.length > 0) {
        console.log('main.js: Setting up tab event listeners.');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Desactivar todas las pestañas y ocultar todos los contenidos
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Activar la pestaña clicada
                button.classList.add('active');

                // Mostrar el contenido correspondiente
                const targetTabId = button.dataset.tab;
                const targetTabContent = document.getElementById(targetTabId);
                if (targetTabContent) {
                    targetTabContent.classList.add('active');
                } else {
                    console.error(`main.js: Tab content with ID '${targetTabId}' not found.`);
                }
            });
        });
        console.log('main.js: Tab event listeners set.');
    } else {
        console.log('main.js: No tab buttons or tab contents found, skipping tab logic setup.');
    }

    // Fetch and display Fear & Greed Index
    fetchFearAndGreedIndex();
    setInterval(fetchFearAndGreedIndex, 3600000); // Update every hour

    // Fetch and display converter data
    fetchConverterData(); // Fetch data for converter dropdowns and prices
    setInterval(fetchConverterData, 300000); // Update converter data every 5 minutes

    // Add event listeners for converter elements
    document.getElementById('convert-amount').addEventListener('input', performConversion);
    document.getElementById('convert-from').addEventListener('change', performConversion);
    document.getElementById('convert-to').addEventListener('change', performConversion);
});

let allCryptoPrices = {}; // Global object to store prices for conversion

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
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 25;
    const radius = Math.min(centerX, centerY) - 20;
    
    const gaugeStartAngle = Math.PI;
    const gaugeEndAngle = 0;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create gradient
    const gradient = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.5, 'yellow');
    gradient.addColorStop(1, 'green');

    // Draw gauge background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, gaugeStartAngle, gaugeEndAngle, false);
    ctx.lineWidth = 20;
    ctx.strokeStyle = gradient;
    ctx.stroke();

    // Draw gauge labels
    ctx.fillStyle = 'white';
    ctx.font = '12px Montserrat';
    ctx.textAlign = 'center';
    
    ctx.fillText('0', centerX - radius, centerY + 20);
    ctx.fillText('50', centerX, centerY - radius - 15);
    ctx.fillText('100', centerX + radius, centerY + 20);

    // Draw pointer
    const pointerAngle = Math.PI - (value / 100) * Math.PI;
    const pointerLength = radius;
    const pointerX = centerX + pointerLength * Math.cos(pointerAngle);
    const pointerY = centerY + pointerLength * Math.sin(pointerAngle) * -1; // Invert Y to point up

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(pointerX, pointerY);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
}

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