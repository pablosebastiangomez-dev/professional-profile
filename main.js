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

console.log('main.js: Script finished (waiting for DOMContentLoaded).');
