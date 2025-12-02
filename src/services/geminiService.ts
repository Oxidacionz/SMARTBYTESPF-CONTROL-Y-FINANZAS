import { GoogleGenAI } from "@google/genai";
import { FinancialItem } from '../types';

const getAiClient = () => {
  // Safe access to environment variables in various environments (Vite, Node, etc)
  let apiKey = '';
  try {
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
        apiKey = process.env.API_KEY;
    } else if (typeof import.meta !== 'undefined' && (import.meta as any).env?.API_KEY) {
        apiKey = (import.meta as any).env.API_KEY;
    }
  } catch (e) {
      console.warn("Error accessing environment variables", e);
  }

  if (!apiKey) {
    console.error("API Key missing. AI features will fail.");
    // Return a dummy client or throw specific error handled by caller
    throw new Error("API Key not found in environment");
  }
  return new GoogleGenAI({ apiKey });
};

export const getFinancialAdvice = async (
  items: FinancialItem[], 
  exchangeRate: number
): Promise<string> => {
  try {
    const ai = getAiClient();
    
    const toUSD = (item: FinancialItem) => {
      if (item.currency === 'USD') return item.amount;
      const rate = item.customExchangeRate || exchangeRate;
      return rate > 0 ? item.amount / rate : 0;
    };

    const totalAssetsUSD = items
      .filter(i => i.type === 'asset')
      .reduce((acc, curr) => acc + toUSD(curr), 0);

    const totalLiabilitiesUSD = items
      .filter(i => i.type === 'liability')
      .reduce((acc, curr) => acc + toUSD(curr), 0);
    
    const prompt = `
      Actúa como un asesor financiero experto para un venezolano. Analiza mi situación financiera actual basada en los siguientes datos:

      Tasa de Cambio Global (Bs/$): ${exchangeRate}
      Total Activos (convertido a USD): $${totalAssetsUSD.toFixed(2)}
      Total Pasivos/Deudas (convertido a USD): $${totalLiabilitiesUSD.toFixed(2)}

      Detalle de items:
      ${JSON.stringify(items.map(i => ({
        name: i.name,
        amount: i.amount,
        currency: i.currency,
        usdEquivalent: toUSD(i).toFixed(2),
        rateUsed: i.currency === 'VES' ? (i.customExchangeRate || exchangeRate) : 1,
        type: i.type,
        isRecurring: i.isMonthly,
        category: i.category
      })), null, 2)}

      Por favor, provee:
      1. Un análisis breve de mi salud financiera.
      2. 3 consejos concretos para ahorrar o pagar deudas más rápido, considerando la economía venezolana.
      3. Señala gastos hormiga o recurrentes preocupantes si los hay.
      
      Responde en formato Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "No se pudo generar el consejo en este momento.";

  } catch (error) {
    console.error("Error fetching financial advice:", error);
    return "Error conectando con el asesor IA. Verifica tu conexión.";
  }
};

export const parseFinancialDocument = async (
  rawContent: string,
  mode: 'text' | 'image',
  imageData?: string
): Promise<any[]> => {
  try {
    const ai = getAiClient();
    
    const prompt = `
      Eres un experto en extracción de datos financieros. Tu tarea es convertir el texto o imagen proporcionada (que puede ser un estado de cuenta bancario, una lista de excel o una factura) en un JSON estructurado.

      Instrucciones Críticas:
      1. Detecta cada transacción individual.
      2. Ignora encabezados, pies de página o saldos totales acumulados. Solo extrae movimientos individuales.
      3. Para cada movimiento extrae:
         - "name": Descripción corta de la transacción.
         - "amount": El número puro (si es negativo o entre paréntesis, conviértelo a positivo).
         - "original_currency_symbol": El símbolo o código de moneda que veas ($, Bs, VES, EUR, €).
         - "type_hint": Si parece un ingreso ('deposit', 'abono') o un egreso ('withdrawal', 'cargo', 'compra').
         - "category_hint": Una palabra clave sobre qué es (ej: 'comida', 'transferencia', 'nómina', 'suscripción').

      Formato de Salida:
      Devuelve ÚNICAMENTE un Array de Objetos JSON. Sin markdown, sin explicaciones.
      Ejemplo: [{"name": "Netflix", "amount": 15.00, "original_currency_symbol": "$", "type_hint": "egreso", "category_hint": "suscripción"}]
    `;

    let contents;
    if (mode === 'image' && imageData) {
        contents = {
            role: 'user',
            parts: [
                { text: prompt },
                { inlineData: { mimeType: 'image/png', data: imageData } }
            ]
        };
    } else {
        contents = {
            role: 'user',
            parts: [{ text: prompt + "\n\nCONTENIDO DEL DOCUMENTO:\n" + rawContent.substring(0, 30000) }] // Limit char count for safety
        };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("Respuesta vacía de la IA");
    
    // Limpieza agresiva del JSON por si la IA incluye bloques de código
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
        const parsed = JSON.parse(cleanJson);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("JSON parsing error", e);
        throw new Error("La IA no devolvió un JSON válido. Intenta con una imagen más clara o texto más simple.");
    }

  } catch (error) {
    console.error("Error parsing document:", error);
    throw error;
  }
};