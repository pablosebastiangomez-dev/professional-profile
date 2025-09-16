document.addEventListener('DOMContentLoaded', () => {
  const alphaVantageApiKey = 'CXQ4N157HU0JLOJU';
  const numeroDeMonedas = 15;
  const cryptoApiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${numeroDeMonedas}&page=1&sparkline=false`;
  const sp500Symbols = ['AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSLA','JPM'];

  const cryptoTableBody = document.querySelector('#crypto-table tbody');
  const stocksTableBody = document.querySelector('#stocks-table tbody');

  if (cryptoTableBody) fetchCryptoData();
  if (stocksTableBody) fetchStocksData();

  async function fetchCryptoData() {
    try {
      const response = await fetch(cryptoApiUrl);
      const coins = await response.json();
      displayCryptoData(coins);
    } catch (error) {
      cryptoTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No se pudieron cargar los datos.</td></tr>`;
    }
  }

  function displayCryptoData(coins) {
    let html = '';
    coins.forEach((coin, index) => {
      const priceChange = coin.price_change_percentage_24h;
      const changeColorClass = priceChange >= 0 ? 'color-green' : 'color-red';
      html += `
        <tr>
          <td>${index + 1}</td>
          <td class="coin-name">
            <img src="${coin.image}" alt="${coin.name} logo" width="24" height="24">
            <span>${coin.name} <span class="symbol">${coin.symbol.toUpperCase()}</span></span>
          </td>
          <td>${formatCurrency(coin.current_price)}</td>
          <td class="${changeColorClass}">${priceChange.toFixed(2)}%</td>
          <td>${formatMarketCap(coin.market_cap)}</td>
        </tr>
      `;
    });
    cryptoTableBody.innerHTML = html;
  }

  async function fetchStocksData() {
    const companyNames = {
      'AAPL':'Apple Inc.','MSFT':'Microsoft Corp.','GOOGL':'Alphabet Inc.',
      'AMZN':'Amazon.com, Inc.','NVDA':'NVIDIA Corp.','META':'Meta Platforms, Inc.',
      'TSLA':'Tesla, Inc.','JPM':'JPMorgan Chase & Co.'
    };

    stocksTableBody.innerHTML = '';
    for (const symbol of sp500Symbols) {
      try {
        const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaVantageApiKey}`);
        const data = await response.json();
        if (data['Global Quote']) {
          const quote = data['Global Quote'];
          displayStockData({
            symbol,
            name: companyNames[symbol] || symbol,
            price: parseFloat(quote['05. price']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
            volume: parseInt(quote['06. volume'])
          });
        }
        await new Promise(r => setTimeout(r, 15000));
      } catch (error) {
        console.error(error);
      }
    }
  }

  function displayStockData(stock) {
    const changeColorClass = stock.changePercent >= 0 ? 'color-green' : 'color-red';
    stocksTableBody.innerHTML += `
      <tr>
        <td class="stock-name">${stock.name}</td>
        <td>${stock.symbol}</td>
        <td>${formatCurrency(stock.price)}</td>
        <td class="${changeColorClass}">${stock.changePercent.toFixed(2)}%</td>
        <td>${formatNumber(stock.volume)}</td>
      </tr>
    `;
  }

  const formatCurrency = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  const formatMarketCap = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(num);
  const formatNumber = (num) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num);
});
