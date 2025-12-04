import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-lg border-2 border-slate-600/50 transition-colors ${className}`}>
      {children}
    </div>
  );
};