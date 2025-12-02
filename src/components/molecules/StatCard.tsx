import React from 'react';
import { Card } from '../atoms/Card';

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  colorBorder?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, subtext, colorBorder = 'border-blue-500', icon }) => {
  return (
    <Card className={`p-4 border-l-4 ${colorBorder} relative overflow-hidden`}>
      <div className="relative z-10">
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</div>
        <div className="text-2xl font-bold text-gray-800 dark:text-white">{value}</div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtext}</div>
      </div>
      {icon && <div className="absolute -right-2 -bottom-4 opacity-50">{icon}</div>}
    </Card>
  );
};