console.log('main.js: Script started.');

// Global variables for converter data (will be used by dynamically loaded scripts)
let allCryptoPrices = {};
let allFiatPrices = {};
const availableFiatCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'BRL', 'ARS'];

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

    // Lógica para el manejo de pestañas dinámicas
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContentArea = document.getElementById('tab-content-area');

    // Map tab IDs to their corresponding HTML file paths
    const tabFileMap = {
        'crypto': 'dashboard-crypto.html',
        'data-analysis': 'dashboard-data-analysis.html',
        'ml-projects': 'dashboard-ml-projects.html',
        'conversion': 'conversion-tab-content.html'
    };

    async function loadTabContent(tabId) {
        console.log(`main.js: Loading content for tab: ${tabId}`);
        const filePath = tabFileMap[tabId];
        if (!filePath) {
            console.error(`main.js: No file path found for tab ID: ${tabId}`);
            tabContentArea.innerHTML = `<p class="error">Contenido no encontrado para esta pestaña.</p>`;
            return;
        }

        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`Error loading tab content: ${response.statusText}`);
            const html = await response.text();
            tabContentArea.innerHTML = html;

            // Execute scripts within the loaded HTML (e.g., dashboard-crypto.js, conversion-tab-logic.js)
            const scripts = tabContentArea.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.textContent = oldScript.textContent;
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });
            console.log(`main.js: Content for tab '${tabId}' loaded successfully.`);
        } catch (error) {
            console.error(`main.js: Error al cargar el contenido de la pestaña '${tabId}':`, error);
            tabContentArea.innerHTML = `<p class="error">Error al cargar el contenido: ${error.message}</p>`;
        }
    }

    // Event listeners for tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Make sections visible when a tab is clicked for the first time
            document.getElementById('project-tabs').classList.remove('hidden-initially');
            document.getElementById('portfolio').classList.remove('hidden-initially');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            loadTabContent(button.dataset.tab);
        });
    });

    // No initial tab content loading on DOMContentLoaded as per user request.
    // Content will load only when a tab is explicitly clicked.

    // Fetch and display Fear & Greed Index (this is always on index.html)
    fetchFearAndGreedIndex();
    setInterval(fetchFearAndGreedIndex, 3600000); // Update every hour
});

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
