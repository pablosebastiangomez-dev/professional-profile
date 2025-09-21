// netlify/functions/gemini-scraper.js

// Importamos la biblioteca oficial de Google AI
import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializamos el cliente con nuestra clave secreta desde las variables de entorno de Netlify
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function handler() {
  try {
    // 1. Seleccionamos el modelo de IA. 'gemini-pro' es excelente para estas tareas.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const url = "https://es.tradingview.com/markets/stocks-usa/market-movers-large-cap/";

    // 2. Creamos el "Prompt": la instrucción que le daremos a la IA.
    // Ser muy específico aquí es la clave del éxito.
    const prompt = `
      Analiza el contenido de la página web: ${url}.
      Quiero que extraigas los datos de la tabla de "Ganadoras".
      Para las primeras 5 empresas de la lista, obtén la siguiente información:
      - El nombre de la empresa.
      - El símbolo (ticker).
      - El último precio.
      - El porcentaje de cambio.
      - El volumen.
      
      Devuelve la información estrictamente en formato JSON, como un array de objetos. No incluyas texto explicativo, solo el JSON.
      El formato debe ser el siguiente:
      [
        {
          "nombre": "Nombre de la Empresa",
          "simbolo": "TICKER",
          "precio": 123.45,
          "cambio_porcentaje": 1.23,
          "volumen": "1.234M"
        }
      ]
    `;

    // 3. Enviamos el prompt al modelo de Gemini.
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // 4. Limpiamos la respuesta de la IA.
    // A veces, los modelos envuelven el JSON en ```json ... ```. Esto lo elimina.
    text = text.replace(/^```json\s*/, '').replace(/```$/, '');
    
    // 5. Devolvemos los datos limpios al frontend.
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: text, // El texto ya es una cadena JSON
    };

  } catch (error) {
    console.error("Error al contactar la API de Gemini:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No se pudo procesar la solicitud con la IA." }),
    };
  }
}
