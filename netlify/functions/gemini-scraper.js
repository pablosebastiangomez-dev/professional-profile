// netlify/functions/gemini-scraper.js

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function handler() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const url = "https://es.tradingview.com/markets/stocks-usa/market-movers-large-cap/";

    // --- PROMPT MEJORADO ---
    // Le damos instrucciones más específicas para manejar errores y esperas.
    const prompt = `
      Analiza el contenido de la página web: ${url}.
      Primero, espera a que la tabla de "Ganadoras" cargue todos sus datos numéricos por completo.

      Para las primeras 5 empresas de la lista en esa tabla, extrae la siguiente información:
      - El nombre de la empresa.
      - El símbolo (ticker).
      - El último precio.
      - El porcentaje de cambio.
      - El volumen.

      Reglas importantes para la extracción:
      1. Si para una empresa específica no puedes encontrar un valor numérico válido para el 'precio' o el 'porcentaje de cambio', debes usar el número 0 como valor por defecto para ese campo. No devuelvas null, NaN o texto vacío.
      2. El volumen debe ser una cadena de texto, tal como aparece en la página.

      Devuelve la información estrictamente en formato JSON, como un array de objetos. No incluyas absolutamente ningún texto explicativo, notas o comentarios fuera del JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Limpieza inteligente para extraer solo el bloque JSON
    const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (!match) {
      throw new Error("La IA no devolvió un JSON válido en su respuesta.");
    }
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
