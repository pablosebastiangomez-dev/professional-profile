document.addEventListener('DOMContentLoaded', () => {
    
    // --- Scroll Animations ---
    const sections = document.querySelectorAll('section[id]');
    
    const revealSections = () => {
        const windowHeight = window.innerHeight;
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            if (sectionTop < windowHeight - 100) {
                section.classList.add('visible');
            }
        });
    };

    window.addEventListener('scroll', revealSections);
    revealSections(); // Initial check on page load

    // --- Back to Top Button & Nav Highlighting ---
    const backToTopButton = document.getElementById('back-to-top');
    const navLinks = document.querySelectorAll('.navbar nav ul a');

    window.addEventListener('scroll', () => {
        // Back to top button visibility
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }

        // Active nav link highlighting
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

    // Smooth scroll for back to top button
    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- Tab Logic ---
    const tabContainers = document.querySelectorAll('.tab-container');

    tabContainers.forEach(container => {
        const tabButtons = container.querySelectorAll('.tab-button');
        const tabContents = container.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Deactivate all tabs and content within this container
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Activate the clicked tab
                button.classList.add('active');

                // Display the corresponding content
                const targetTabId = button.dataset.tab;
                const targetTabContent = container.querySelector(`#${targetTabId}`);
                if (targetTabContent) {
                    targetTabContent.classList.add('active');
                }
            });
        });
    });
    
    // --- API Calls ---
    fetchFearAndGreedIndex();
    setInterval(fetchFearAndGreedIndex, 3600000); // Update every hour

    fetchConverterData();
    setInterval(fetchConverterData, 300000); // Update every 5 minutes

    document.getElementById('convert-amount').addEventListener('input', performConversion);
    document.getElementById('convert-from').addEventListener('change', performConversion);
    document.getElementById('convert-to').addEventListener('change', performConversion);
});

let allCryptoPrices = {};

// === FEAR & GREED INDEX LOGIC ===
async function fetchFearAndGreedIndex() {
    const fngValueElem = document.getElementById('fng-value');
    const fngClassificationElem = document.getElementById('fng-classification');
    const fngGaugeCanvas = document.getElementById('fng-gauge');
    const fngApiUrl = 'https://api.alternative.me/fng/';

    try {
        const response = await fetch(fngApiUrl);
        if (!response.ok) throw new Error(`Failed to fetch F&G Index: ${response.statusText}`);
        const data = await response.json();
        const fngData = data.data[0];
        
        const value = parseInt(fngData.value);
        fngValueElem.textContent = `Valor: ${value}`;
        fngClassificationElem.textContent = `Clasificación: ${fngData.value_classification}`;
        
        drawGauge(fngGaugeCanvas, value);

    } catch (error) {
        console.error("Error loading Fear & Greed Index:", error);
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
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gradient
    const gradient = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
    gradient.addColorStop(0, '#EF4444');
    gradient.addColorStop(0.5, '#FBBF24');
    gradient.addColorStop(1, '#10B981');

    // Gauge background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0, false);
    ctx.lineWidth = 20;
    ctx.strokeStyle = gradient;
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#F9FAFB';
    ctx.font = '12px Montserrat';
    ctx.textAlign = 'center';
    ctx.fillText('0', centerX - radius, centerY + 20);
    ctx.fillText('50', centerX, centerY - radius - 15);
    ctx.fillText('100', centerX + radius, centerY + 20);

    // Pointer
    const pointerAngle = Math.PI - (value / 100) * Math.PI;
    const pointerLength = radius;
    const pointerX = centerX + pointerLength * Math.cos(pointerAngle);
    const pointerY = centerY + pointerLength * Math.sin(pointerAngle) * -1;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(pointerX, pointerY);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#F9FAFB';
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#F9FAFB';
    ctx.fill();
}

// === CRYPTO CONVERTER LOGIC ===
async function fetchConverterData() {
    const selectFrom = document.getElementById('convert-from');
    const selectTo = document.getElementById('convert-to');
    const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false';
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Failed to fetch converter data: ${response.statusText}`);
        const coins = await response.json();

        allCryptoPrices['usd'] = 1;
        
        selectFrom.innerHTML = '<option value="usd">USD</option>';
        selectTo.innerHTML = '<option value="usd">USD</option>';

        coins.forEach(coin => {
            allCryptoPrices[coin.id] = coin.current_price;
            const option = document.createElement('option');
            option.value = coin.id;
            option.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;
            selectFrom.appendChild(option.cloneNode(true));
            selectTo.appendChild(option);
        });
        
        selectFrom.value = 'bitcoin';
        selectTo.value = 'ethereum';

        performConversion();

    } catch (error) {
        console.error("Error loading converter data:", error);
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
    resultElem.textContent = `${amount.toLocaleString()} ${fromCurrency.toUpperCase()} = ${convertedValue.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${toCurrency.toUpperCase()}`;
}
