import React, { useState } from 'react';
import { FinancialItem } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface FinancialAdvisorProps {
  items: FinancialItem[];
  exchangeRate: number;
}

export const FinancialAdvisor: React.FC<FinancialAdvisorProps> = ({ items, exchangeRate }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetAdvice = async () => {
    setLoading(true);
    const result = await getFinancialAdvice(items, exchangeRate);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Sparkles className="text-yellow-500" />
          Asesor Financiero IA
        </h2>
        <button
          onClick={handleGetAdvice}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            loading 
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md'
          }`}
        >
          {loading ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {loading ? 'Analizando...' : 'Analizar Finanzas'}
        </button>
      </div>

      {!advice && !loading && (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-gray-500 dark:text-gray-300 mb-2">Solicita un análisis de tu situación financiera actual.</p>
          <p className="text-sm text-gray-400 dark:text-gray-400">La IA tomará en cuenta la tasa del dólar, tus deudas y activos.</p>
        </div>
      )}

      {loading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      )}

      {advice && !loading && (
        <div className="prose prose-blue dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mt-4 mb-2" {...props} />,
                h2: ({node, ...props}) => <h4 className="text-md font-bold text-blue-800 dark:text-blue-400 mt-3 mb-2" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 mb-4" {...props} />,
                li: ({node, ...props}) => <li className="text-gray-700 dark:text-gray-300" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-gray-900 dark:text-white" {...props} />
              }}
            >
              {advice}
            </ReactMarkdown>
        </div>
      )}
      
      <div className="mt-4 flex items-start gap-2 text-xs text-gray-400 dark:text-gray-500 bg-blue-50 dark:bg-gray-700/50 p-2 rounded">
        <AlertCircle size={14} className="mt-0.5 text-blue-400" />
        <p>Este consejo es generado por Inteligencia Artificial y no sustituye a un asesor financiero profesional. Verifica siempre los datos antes de tomar decisiones importantes.</p>
      </div>
    </div>
  );
};