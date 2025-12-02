import { GoogleGenAI } from "@google/genai";
import { FinancialItem } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
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
    
    // Helper to handle custom rates
    const toUSD = (item: FinancialItem) => {
      if (item.currency === 'USD') return item.amount;
      const rate = item.customExchangeRate || exchangeRate;
      return rate > 0 ? item.amount / rate : 0;
    };

    // Calculate summaries to send to AI
    const totalAssetsUSD = items
      .filter(i => i.type === 'asset')
      .reduce((acc, curr) => acc + toUSD(curr), 0);

    const totalLiabilitiesUSD = items
      .filter(i => i.type === 'liability')
      .reduce((acc, curr) => acc + toUSD(curr), 0);
    
    const monthlyExpenses = items.filter(i => i.type === 'liability' && i.isMonthly);

    const prompt = `
      Actúa como un asesor financiero experto para un venezolano. Analiza mi situación financiera actual basada en los siguientes datos:

      Tasa de Cambio Global (Bs/$): ${exchangeRate}
      (Algunos items pueden tener tasas personalizadas)
      
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
      2. 3 consejos concretos para ahorrar o pagar deudas más rápido, considerando la economía venezolana (inflación, uso de divisas, etc).
      3. Si ves gastos hormiga o recurrentes preocupantes, señálalos.
      
      Responde en formato Markdown, sé empático pero directo.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster standard advice
      }
    });

    return response.text || "No se pudo generar el consejo en este momento.";

  } catch (error) {
    console.error("Error fetching financial advice:", error);
    return "Error conectando con el asesor IA. Por favor verifica tu conexión y clave API.";
  }
};