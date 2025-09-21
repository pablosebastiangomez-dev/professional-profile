// netlify/functions/gemini-scraper.js

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function handler() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const url = "[https://es.tradingview.com/markets/stocks-usa/market-movers-large-cap/](https://es.tradingview.com/markets/stocks-usa/market-movers-large-cap/)";

    const prompt = `
      Analiza el contenido de la página web: ${url}.
      Quiero que extraigas los datos de la tabla de "Ganadoras".
      Para las primeras 5 empresas de la lista, obtén la siguiente información:
      - El nombre de la empresa.
      - El símbolo (ticker).
      - El último precio.
      - El porcentaje de cambio.
      - El volumen.
      
      Devuelve la información estrictamente en formato JSON, como un array de objetos. No incluyas absolutamente ningún texto explicativo, solo el JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // --- NUEVA LIMPIEZA INTELIGENTE ---
    // Buscamos el primer '[' o '{' y el último ']' o '}' y extraemos lo que hay en medio.
    const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);

    if (!match) {
        // Si no encontramos ningún bloque JSON, lanzamos un error claro.
        throw new Error("La IA no devolvió un JSON válido en su respuesta.");
    }
    
    // Usamos el JSON que encontramos.
    const cleanJsonString = match[0];
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: cleanJsonString,
    };

  } catch (error) {
    console.error("Error en la función serverless:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No se pudo procesar la solicitud con la IA.", details: error.message }),
    };
  }
}
