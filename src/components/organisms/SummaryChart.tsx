
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FinancialItem } from '../../types';
import { Card } from '../atoms/Card';

interface SummaryChartProps {
  items: FinancialItem[];
  exchangeRate: number;
}

export const SummaryChart: React.FC<SummaryChartProps> = ({ items, exchangeRate }) => {
  
  const calculateUSD = (item: FinancialItem) => {
    if (item.currency === 'USD') return item.amount;
    if (item.currency === 'EUR') return item.amount * 1.08; // Approx EUR fix
    const rate = item.customExchangeRate || exchangeRate;
    return rate > 0 ? item.amount / rate : 0;
  };

  const assets = items.filter(i => i.type === 'asset').reduce((acc, i) => acc + calculateUSD(i), 0);
  const debts = items.filter(i => i.type === 'liability' && !i.isMonthly).reduce((acc, i) => acc + calculateUSD(i), 0);
  const monthly = items.filter(i => i.type === 'liability' && i.isMonthly).reduce((acc, i) => acc + calculateUSD(i), 0);

  const netWorth = assets - debts;

  let data = [];

  if (netWorth >= 0) {
      // Escenario Saludable: Tengo más de lo que debo
      // Mostramos qué parte de mis activos es realmente mía vs qué parte respalda deudas
      data = [
        { name: 'Patrimonio Neto (Tuyo)', value: parseFloat(netWorth.toFixed(2)), color: '#10B981' }, // Green
        { name: 'Respaldo de Deudas', value: parseFloat(debts.toFixed(2)), color: '#EF4444' },     // Red
        { name: 'Gastos Mensuales', value: parseFloat(monthly.toFixed(2)), color: '#F59E0B' },      // Orange
      ];
  } else {
      // Escenario Crítico: Debo más de lo que tengo
      // Mostramos activos totales y cuánto falta para cubrir la deuda
      data = [
        { name: 'Activos Totales', value: parseFloat(assets.toFixed(2)), color: '#10B981' },           // Green
        { name: 'Deuda sin Cubrir', value: parseFloat((debts - assets).toFixed(2)), color: '#991B1B' }, // Dark Red
        { name: 'Gastos Mensuales', value: parseFloat(monthly.toFixed(2)), color: '#F59E0B' },          // Orange
      ];
  }

  // Filtrar valores muy pequeños para que no rompan el gráfico
  data = data.filter(d => d.value > 0.01);

  if (data.length === 0) {
    return <Card className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">Agrega datos para ver el gráfico</Card>;
  }

  return (
    <Card className="h-96 w-full p-4 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">
        Distribución Real ({netWorth >= 0 ? 'Solvente' : 'Déficit'})
      </h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%" 
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `$${value.toFixed(2)}`}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={70} 
              wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
