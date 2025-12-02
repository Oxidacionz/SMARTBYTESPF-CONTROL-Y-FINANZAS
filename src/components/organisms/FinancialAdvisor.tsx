import React, { useState } from 'react';
import { FinancialItem } from '../../types';
import { getFinancialAdvice } from '../../services/geminiService';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';

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
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Sparkles className="text-yellow-500" />
          Asesor Financiero IA
        </h2>
        <Button
          onClick={handleGetAdvice}
          disabled={loading}
          variant="primary"
          className="bg-gradient-to-r from-blue-600 to-indigo-600"
          icon={loading ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
        >
          {loading ? 'Analizando...' : 'Analizar Finanzas'}
        </Button>
      </div>

      {!advice && !loading && (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-gray-500 dark:text-gray-300 mb-2">Solicita un análisis de tu situación financiera actual.</p>
        </div>
      )}

      {loading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      )}

      {advice && !loading && (
        <div className="prose prose-blue dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">
            <ReactMarkdown>{advice}</ReactMarkdown>
        </div>
      )}
      
      <div className="mt-4 flex items-start gap-2 text-xs text-gray-400 dark:text-gray-500 bg-blue-50 dark:bg-gray-700/50 p-2 rounded">
        <AlertCircle size={14} className="mt-0.5 text-blue-400" />
        <p>Generado por IA. No sustituye a un asesor profesional.</p>
      </div>
    </Card>
  );
};