

import React, { useState, useEffect } from 'react';
import { Sun, Moon, ChevronDown, CheckCircle, RefreshCw, AlertCircle, User } from 'lucide-react';
import { ExchangeRates, UserProfile } from '../../types';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  rates: ExchangeRates;
  setRates: (rates: ExchangeRates) => void;
  syncStatus: 'synced' | 'syncing' | 'error';
  onRefresh: () => void;
  userProfile?: UserProfile | null;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode, rates, setRates, syncStatus, onRefresh, userProfile, onOpenProfile }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 50) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(currentScrollY);
      }
    };
    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);
  
  const RateInput = ({ label, value, onChange, color }: { label: string, value: number, onChange: (v: string) => void, color: string }) => (
    <div className={`${color} px-3 py-1 rounded-md border border-opacity-20 border-white flex flex-col justify-center min-w-[80px]`}>
      <div className="text-[9px] text-blue-200 uppercase font-bold leading-none mb-0.5">{label}</div>
      <div className="flex items-center gap-1">
          <span className="text-[10px] text-white opacity-70">Bs.</span>
          <input 
              type="number"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 bg-transparent border-none focus:ring-0 p-0 text-white font-mono font-bold text-sm h-4 leading-none"
          />
      </div>
    </div>
  );

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-40 transition-transform duration-300 ease-in-out bg-blue-900 dark:bg-blue-950 text-white shadow-lg ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-6xl mx-auto px-3 py-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
          
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div>
                <h1 className="text-lg font-bold tracking-tight leading-none">SMART BYTES.PF</h1>
                <p className="text-[10px] text-blue-200 dark:text-blue-300">Control y Finanzas</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={onRefresh}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium transition-all ${
                  syncStatus === 'syncing' 
                    ? 'bg-blue-800 text-blue-200 cursor-wait' 
                    : syncStatus === 'error'
                      ? 'bg-red-900/50 text-red-200 hover:bg-red-900'
                      : 'bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/50'
                }`}
              >
                {syncStatus === 'syncing' ? <RefreshCw size={12} className="animate-spin" /> : syncStatus === 'error' ? <AlertCircle size={12} /> : <CheckCircle size={12} />}
                <span className="hidden sm:inline">
                   {syncStatus === 'syncing' ? 'Guardando...' : syncStatus === 'error' ? 'Error' : 'Actualizado'}
                </span>
              </button>

              <button 
                onClick={toggleDarkMode}
                className="p-1.5 rounded-full bg-blue-800/50 hover:bg-blue-800 transition-colors"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button 
                onClick={onOpenProfile}
                className="rounded-full bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center w-8 h-8 font-bold text-xs border border-indigo-400 overflow-hidden"
                title="Mi Perfil"
              >
                {userProfile?.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : <User size={16} />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
              <RateInput label="USD BCV" value={rates.usd_bcv} onChange={(v) => setRates({...rates, usd_bcv: parseFloat(v) || 0})} color="bg-blue-800 dark:bg-blue-900" />
              <RateInput label="EUR BCV" value={rates.eur_bcv} onChange={(v) => setRates({...rates, eur_bcv: parseFloat(v) || 0})} color="bg-blue-800 dark:bg-blue-900" />
              <RateInput label="BINANCE" value={rates.usd_binance} onChange={(v) => setRates({...rates, usd_binance: parseFloat(v) || 0})} color="bg-gray-800 dark:bg-gray-800" />
          </div>
        </div>
      </div>
      
      {!isVisible && (
         <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-900/50 rounded-b-lg p-1 animate-bounce cursor-pointer" onClick={() => setIsVisible(true)}>
            <ChevronDown size={14} className="text-white" />
         </div>
      )}
    </header>
  );
};