import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function handler() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const url = "https://es.tradingview.com/markets/stocks-usa/market-movers-large-cap/";

    const prompt = `
      Analiza la tabla "Ganadoras" en la URL: ${url}.
      Para las primeras 5 empresas, extrae únicamente: el nombre de la empresa, su símbolo (ticker) y el volumen.
      Devuelve la información estrictamente en formato JSON, como un array de objetos. No incluyas ningún texto fuera del JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (!match) throw new Error("La IA no devolvió un JSON válido.");
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: match[0],
    };
  } catch (error) {
    console.error("Error en la función Gemini:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message })};
  }
}
