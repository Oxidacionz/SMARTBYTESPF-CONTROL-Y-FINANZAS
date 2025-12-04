import React from 'react';
import { Card } from '../atoms/Card';

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  colorBorder?: string;
  icon?: React.ReactNode;
  valueType?: 'positive' | 'debt' | 'expense';
  numericValue?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, subtext, colorBorder = 'border-blue-500', icon, valueType = 'positive', numericValue = 0 }) => {

  // Determine text color based on value type and amount
  const getValueColor = () => {
    if (numericValue === 0) return 'text-white';

    if (valueType === 'debt' || valueType === 'expense') {
      return 'text-red-400';
    }

    return 'text-amber-400'; // positive values
  };

  return (
    <Card className={`p-4 border-l-4 ${colorBorder} border-2 border-slate-600/50 relative overflow-hidden`}>
      <div className="relative z-10">
        <div className="text-sm text-slate-400 font-medium mb-1">{label}</div>
        <div className={`text-2xl font-bold ${getValueColor()}`}>{value}</div>
        <div className="text-xs text-slate-500 mt-1">{subtext}</div>
      </div>
      {icon && <div className="absolute -right-2 -bottom-4 opacity-50">{icon}</div>}
    </Card>
  );
};