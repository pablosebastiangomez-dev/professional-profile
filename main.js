console.log('main.js: Script started.');

// Global function to execute scripts in dynamically loaded HTML
function executeScripts(element) {
    const scripts = element.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.textContent = oldScript.textContent;
        // The original script tag might still be in the DOM. Replacing it ensures it runs.
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('main.js: DOMContentLoaded fired.');

    const dynamicNavbarArea = document.getElementById('dynamic-navbar-area');
    const mainContentArea = document.getElementById('main-content-area');
    const dynamicFooterArea = document.getElementById('dynamic-footer-area');

    // Map section IDs to their corresponding HTML file paths
    const sectionFileMap = {
        'hero': 'hero-section.html', // This should already be in index.html
        'indicators': 'indicators-section.html',
        'portfolio': 'portfolio-projects-content.html',
        'about': 'about-section.html',
        'skills': 'skills-section.html',
        'contact-footer': 'contact-footer.html',
        'project-tabs': 'project-tabs-section.html' // The tabs bar itself
    };

    // --- Dynamic Section Loading Logic ---
    async function loadSection(sectionId, targetElementId) {
        console.log(`main.js: Loading section: ${sectionId} into #${targetElementId}`);
        const filePath = sectionFileMap[sectionId];
        const targetElement = document.getElementById(targetElementId);

        if (!filePath || !targetElement) {
            console.error(`main.js: Invalid section ID '${sectionId}' or target element ID '${targetElementId}'.`);
            if (targetElement) targetElement.innerHTML = `<p class="error">Contenido no encontrado.</p>`;
            return;
        }

        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`Error loading section content: ${response.statusText}`);
            const html = await response.text();
            targetElement.innerHTML = html;
            executeScripts(targetElement); // Execute scripts in the loaded content
            console.log(`main.js: Section '${sectionId}' loaded successfully.`);
            return true; // Indicate successful load
        } catch (error) {
            console.error(`main.js: Error al cargar la sección '${sectionId}':`, error);
            targetElement.innerHTML = `<p class="error">Error al cargar el contenido: ${error.message}</p>`;
            return false; // Indicate failed load
        }
    }
    
    // --- Initial Load ---
    // Load navbar and footer first
    loadSection('navbar', 'dynamic-navbar-area'); // Navbar will contain initial links
    loadSection('contact-footer', 'dynamic-footer-area'); // Footer contains back to top button

    // --- Navigation Link Event Listeners ---
    // This needs to be set up AFTER the navbar is loaded
    dynamicNavbarArea.addEventListener('click', async (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (link) {
            event.preventDefault();
            const targetHash = link.getAttribute('href');
            const sectionId = targetHash.substring(1); // e.g., 'indicators', 'portfolio'

            // Hide main content area if a new section is being loaded, for smooth transition
            mainContentArea.innerHTML = ''; // Clear previous content
            
            // Special handling for portfolio and its tabs
            if (sectionId === 'portfolio') {
                // Load the tabs bar first, then the portfolio content
                await loadSection('project-tabs', 'main-content-area'); // Load tabs bar into main content area
                const portfolioContentArea = document.createElement('div');
                portfolioContentArea.id = 'portfolio-content-wrapper'; // Wrapper for portfolio-specific content
                mainContentArea.appendChild(portfolioContentArea);
                await loadSection('portfolio', 'portfolio-content-wrapper'); // Load portfolio specific content
                
                // Now setup tab logic for the loaded portfolio section
                const tabButtons = document.querySelectorAll('#project-tabs .tab-button');
                const tabContentArea = document.getElementById('tab-content-area');

                // Map tab IDs to their corresponding HTML file paths
                const tabFileMap = {
                    'crypto': 'dashboard-crypto.html',
                    'data-analysis': 'dashboard-data-analysis.html',
                    'ml-projects': 'dashboard-ml-projects.html',
                    'conversion': 'conversion-tab-content.html'
                };

                // Function to load tab content
                async function loadInnerTabContent(innerTabId) {
                    console.log(`main.js: Loading inner tab content: ${innerTabId}`);
                    const filePath = tabFileMap[innerTabId];
                    if (!filePath) {
                        console.error(`main.js: No file path found for inner tab ID: ${innerTabId}`);
                        tabContentArea.innerHTML = `<p class="error">Contenido no encontrado para esta pestaña.</p>`;
                        return;
                    }
                    try {
                        const response = await fetch(filePath);
                        if (!response.ok) throw new Error(`Error loading inner tab content: ${response.statusText}`);
                        const html = await response.text();
                        tabContentArea.innerHTML = html;
                        executeScripts(tabContentArea); // Execute scripts in the loaded inner tab content
                        console.log(`main.js: Inner tab content '${innerTabId}' loaded successfully.`);
                    } catch (error) {
                        console.error(`main.js: Error al cargar el contenido de la pestaña '${innerTabId}':`, error);
                        tabContentArea.innerHTML = `<p class="error">Error al cargar el contenido: ${error.message}</p>`;
                    }
                }

                tabButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        tabButtons.forEach(btn => btn.classList.remove('active'));
                        button.classList.add('active');
                        loadInnerTabContent(button.dataset.tab);
                    });
                });
                // Load default inner tab (e.g., crypto)
                const initialInnerTab = document.querySelector('#project-tabs .tab-button.active');
                if (initialInnerTab) {
                    loadInnerTabContent(initialInnerTab.dataset.tab);
                } else if (tabButtons.length > 0) {
                    tabButtons[0].classList.add('active');
                    loadInnerTabContent(tabButtons[0].dataset.tab);
                }

            } else {
                await loadSection(sectionId, 'main-content-area');
            }
            // Scroll to the loaded section if it's not the hero
            if (sectionId !== 'hero') {
                document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
            }
             // For indicators section, re-run F&G fetch if loaded
            if (sectionId === 'indicators') {
                const fngCanvas = document.getElementById('fng-gauge');
                if (fngCanvas) {
                    // Initial fetch and set interval if not already set
                    if (!fngCanvas.dataset.fngInterval) {
                        fetchFearAndGreedIndex();
                        fngCanvas.dataset.fngInterval = setInterval(fetchFearAndGreedIndex, 3600000);
                    }
                }
            }
            // Update active state of main navigation links
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
                if (navLink.getAttribute('href') === targetHash) {
                    navLink.classList.add('active');
                }
            });
        }
    });

    // Handle initial active link for "Inicio" (Hero section)
    const initialHeroLink = document.querySelector('a[href="#hero"]');
    if (initialHeroLink) {
        initialHeroLink.classList.add('active');
    }
    
    // Fear & Greed Index functions remain global, as they are called from indicators-section.html
    // and also need to be re-initialized when that section loads.
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
        if (fngValueElem) fngValueElem.textContent = 'Error al cargar.';
        if (fngClassificationElem) fngClassificationElem.textContent = '';
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