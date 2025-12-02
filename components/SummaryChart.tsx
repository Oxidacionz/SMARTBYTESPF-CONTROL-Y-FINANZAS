import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FinancialItem } from '../types';

interface SummaryChartProps {
  items: FinancialItem[];
  exchangeRate: number;
}

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6'];

export const SummaryChart: React.FC<SummaryChartProps> = ({ items, exchangeRate }) => {
  
  const calculateUSD = (item: FinancialItem) => {
    if (item.currency === 'USD') return item.amount;
    const rate = item.customExchangeRate || exchangeRate;
    return rate > 0 ? item.amount / rate : 0;
  };

  const assets = items.filter(i => i.type === 'asset').reduce((acc, i) => acc + calculateUSD(i), 0);
  const debts = items.filter(i => i.type === 'liability' && !i.isMonthly).reduce((acc, i) => acc + calculateUSD(i), 0);
  const monthly = items.filter(i => i.type === 'liability' && i.isMonthly).reduce((acc, i) => acc + calculateUSD(i), 0);

  const data = [
    { name: 'Activos (Tengo)', value: parseFloat(assets.toFixed(2)) },
    { name: 'Deudas Totales', value: parseFloat(debts.toFixed(2)) },
    { name: 'Gastos Mensuales', value: parseFloat(monthly.toFixed(2)) },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">Agrega datos para ver el gráfico</div>;
  }

  return (
    <div className="h-72 w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 text-center">Distribución Financiera (USD)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `$${value.toFixed(2)}`}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#9ca3af' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};