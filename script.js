// ==========================
// CONFIGURACIÓN
// ==========================
const API_KEY = "TU_API_KEY_ALPHA"; // 🔑 poné acá tu clave de Alpha Vantage

// 8 acciones top por capitalización del S&P500
const stockSymbols = [
  "AAPL", "MSFT", "AMZN", "GOOGL",
  "META", "NVDA", "TSLA", "BRK.B"
];

// ==========================
// CRIPTOMONEDAS (CoinGecko)
// ==========================
async function loadCrypto() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false");
    const data = await res.json();

    const tbody = document.querySelector("#crypto-table tbody");
    tbody.innerHTML = "";

    data.forEach((coin, i) => {
      const row = `
        <tr>
          <td>${i + 1}</td>
          <td>${coin.name} (${coin.symbol.toUpperCase()})</td>
          <td>$${coin.current_price.toLocaleString()}</td>
          <td class="${coin.price_change_percentage_24h >= 0 ? 'color-green' : 'color-red'}">
            ${coin.price_change_percentage_24h.toFixed(2)}%
          </td>
          <td>$${coin.market_cap.toLocaleString()}</td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  } catch (error) {
    console.error("Error cargando criptos:", error);
  }
}

// ==========================
// ACCIONES (Alpha Vantage)
// ==========================
async function loadStocks() {
  const tbody = document.querySelector("#stocks-table tbody");
  tbody.innerHTML = "";

  for (let symbol of stockSymbols) {
    try {
      const res = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`);
      const data = await res.json();

      if (!data["Global Quote"]) continue;
      const quote = data["Global Quote"];

      const price = parseFloat(quote["05. price"]);
      const change = parseFloat(quote["10. change percent"]);
      const volume = parseInt(quote["06. volume"]);

      const row = `
        <tr>
          <td>${symbol}</td>
          <td>${quote["01. symbol"]}</td>
          <td>$${price.toFixed(2)}</td>
          <td class="${change >= 0 ? 'color-green' : 'color-red'}">${change.toFixed(2)}%</td>
          <td>${volume.toLocaleString()}</td>
        </tr>
      `;
      tbody.innerHTML += row;

      // Respetar rate limit de Alpha (5 req/min)
      await new Promise(resolve => setTimeout(resolve, 15000));
    } catch (error) {
      console.error("Error cargando acción:", symbol, error);
    }
  }
}

// ==========================
// INICIO
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  loadCrypto();
  loadStocks();
});
