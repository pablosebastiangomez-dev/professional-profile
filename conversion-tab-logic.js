console.log('conversion-tab-logic.js: Script started.');

// === LÓGICA PARA EL CONVERSOR DE CRIPTOMONEDAS ===
async function fetchCryptoConverterData() {
    console.log('fetchCryptoConverterData: Starting crypto converter data fetch.');
    const selectFrom = document.getElementById('convert-from');
    const selectTo = document.getElementById('convert-to');
    const converterApiUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'; // Fetch more coins for converter
    
    try {
        const response = await fetch(converterApiUrl);
        if (!response.ok) throw new Error(`Error fetching crypto converter data: ${response.statusText}`);
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
        performCryptoConversion(); // Renamed from performConversion

        console.log('fetchCryptoConverterData: Crypto converter data loaded and dropdowns populated.');
    } catch (error) {
        console.error("fetchCryptoConverterData: Error al cargar datos del conversor de criptomonedas:", error);
        document.getElementById('conversion-result').textContent = 'Error al cargar monedas.';
    }
}

function performCryptoConversion() { // Renamed from performConversion
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

// === LÓGICA PARA EL CONVERSOR DE MONEDAS FIAT ===
async function fetchFiatConverterData() {
    console.log('fetchFiatConverterData: Starting fiat converter data fetch.');
    const selectFrom = document.getElementById('fiat-from');
    const selectTo = document.getElementById('fiat-to');
    // Using Frankfurter API for free fiat exchange rates
    const fiatApiUrl = 'https://api.frankfurter.app/latest?from=USD'; // Base currency USD

    try {
        const response = await fetch(fiatApiUrl);
        if (!response.ok) throw new Error(`Error fetching fiat converter data: ${response.statusText}`);
        const data = await response.json();
        allFiatPrices = data.rates; // Store all rates relative to USD
        allFiatPrices['USD'] = 1; // Add USD itself as its rate is 1

        // Populate dropdowns
        selectFrom.innerHTML = '';
        selectTo.innerHTML = '';

        // Add USD first to ensure it's always an option
        const usdOptionFrom = document.createElement('option');
        usdOptionFrom.value = 'USD';
        usdOptionFrom.textContent = 'USD';
        selectFrom.appendChild(usdOptionFrom);

        const usdOptionTo = document.createElement('option');
        usdOptionTo.value = 'USD';
        usdOptionTo.textContent = 'USD';
        selectTo.appendChild(usdOptionTo);

        Object.keys(allFiatPrices).sort().forEach(currency => { // Sort for better UX
            if (currency === 'USD') return; // Skip USD as it's already added
            const optionFrom = document.createElement('option');
            optionFrom.value = currency;
            optionFrom.textContent = currency;
            selectFrom.appendChild(optionFrom);

            const optionTo = document.createElement('option');
            optionTo.value = currency;
            optionTo.textContent = currency;
            selectTo.appendChild(optionTo);
        });

        // Set default selections
        selectFrom.value = 'USD';
        selectTo.value = 'BRL'; // Default to Brazilian Real

        performFiatConversion();

        console.log('fetchFiatConverterData: Fiat converter data loaded and dropdowns populated.');
    } catch (error) {
        console.error("fetchFiatConverterData: Error al cargar datos del conversor de fiat:", error);
        document.getElementById('fiat-conversion-result').textContent = 'Error al cargar monedas.';
    }
}

function performFiatConversion() {
    const amount = parseFloat(document.getElementById('fiat-amount').value);
    const fromCurrency = document.getElementById('fiat-from').value;
    const toCurrency = document.getElementById('fiat-to').value;
    const resultElem = document.getElementById('fiat-conversion-result');

    if (isNaN(amount) || amount <= 0) {
        resultElem.textContent = 'Ingrese un monto válido.';
        return;
    }

    const fromRate = allFiatPrices[fromCurrency];
    const toRate = allFiatPrices[toCurrency];

    if (!fromRate || !toRate) {
        resultElem.textContent = 'Precios no disponibles.';
        return;
    }

    const convertedValue = (amount / fromRate) * toRate;
    resultElem.textContent = `${amount} ${fromCurrency} = ${convertedValue.toFixed(2)} ${toCurrency}`;
}