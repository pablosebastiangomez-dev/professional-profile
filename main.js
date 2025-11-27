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
    const centerY = canvas.height - 10; // Adjusted for a semi-circle based at the bottom
    const radius = Math.min(centerX, centerY) - 20;
    
    // Angles for the semi-circle (0 degrees to 180 degrees)
    // 0 degrees is right horizontal, Math.PI is left horizontal
    // We want the gauge to sweep from left (0 value) to right (100 value)
    // So, actual start angle for drawing should be Math.PI (left) and end angle 0 (right)
    // But for the user's mental model, 0 maps to 0deg and 100 maps to 180deg
    // We need to map the value to angles: 0 -> Math.PI, 100 -> 0 for a clockwise sweep

    // To sweep from left to right (0 to 100), we need to draw from Math.PI to 0 in a counter-clockwise manner
    // For the pointer calculation, we want 0 value to be at Math.PI (left) and 100 value to be at 0 (right)
    // Let's use 0 to Math.PI for drawing, but reverse the value mapping for the pointer
    const gaugeStartAngle = Math.PI; // Left side
    const gaugeEndAngle = 0; // Right side

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create gradient. The gradient itself is horizontal, independent of arc sweep direction.
    const gradient = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
    gradient.addColorStop(0, 'red'); // At 0 value (left side)
    gradient.addColorStop(0.5, 'yellow'); // At 50 value (middle)
    gradient.addColorStop(1, 'green'); // At 100 value (right side)

    // Draw gauge background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, gaugeStartAngle, gaugeEndAngle, false); // false for clockwise from PI to 0
    ctx.lineWidth = 20;
    ctx.strokeStyle = gradient;
    ctx.stroke();

    // Draw gauge labels
    ctx.fillStyle = 'white';
    ctx.font = '12px Montserrat';
    ctx.textAlign = 'center';
    
    // Label for 0 (leftmost)
    const label0X = centerX + (radius + 20) * Math.cos(gaugeStartAngle);
    const label0Y = centerY + (radius + 20) * Math.sin(gaugeStartAngle);
    ctx.fillText('0', label0X, label0Y);

    // Label for 50 (top middle)
    const label50X = centerX + (radius + 20) * Math.cos(gaugeStartAngle / 2); // This is Math.PI / 2 (vertical up)
    const label50Y = centerY + (radius + 20) * Math.sin(gaugeStartAngle / 2);
    ctx.fillText('50', label50X, label50Y);

    // Label for 100 (rightmost)
    const label100X = centerX + (radius + 20) * Math.cos(gaugeEndAngle);
    const label100Y = centerY + (radius + 20) * Math.sin(gaugeEndAngle);
    ctx.fillText('100', label100X, label100Y);


    // Draw pointer
    // Map value 0-100 to angle Math.PI (left) to 0 (right)
    // The angle needs to go from Math.PI to 0 as value goes from 0 to 100
    // Angle = Math.PI - (value / 100) * Math.PI
    const pointerAngle = Math.PI - (value / 100) * Math.PI;
    const pointerLength = radius - 5;
    const pointerX = centerX + pointerLength * Math.cos(pointerAngle);
    const pointerY = centerY + pointerLength * Math.sin(pointerAngle);

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