

import React, { useState, useEffect } from 'react';
import { Sun, Moon, ChevronDown, CheckCircle, RefreshCw, AlertCircle, User, HelpCircle, Bell } from 'lucide-react';
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
  onOpenTutorial: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
}


export const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode, rates, setRates, syncStatus, onRefresh, userProfile, onOpenProfile, onOpenTutorial, onOpenNotifications, unreadCount }) => {
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

  const RateDisplay = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className={`${color} px-3 py-1.5 rounded-md border-2 border-slate-600/50 flex flex-col justify-center min-w-[110px] shadow-lg backdrop-blur-sm`}>
      <div className="text-[10px] text-amber-300 uppercase font-bold leading-none mb-1">{label}</div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-300 opacity-70">Bs.</span>
        <span className="text-white font-mono font-bold text-base leading-none">{value.toFixed(2)}</span>
      </div>
    </div>
  );

  return (
    <header
      className={`fixed top-0 left-0 w-full z-40 transition-transform duration-300 ease-in-out bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white shadow-2xl border-b-2 border-amber-500/20 ${isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
    >
      <div className="max-w-6xl mx-auto px-3 py-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">

          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none bg-gradient-to-r from-amber-200 to-amber-100 bg-clip-text text-transparent">SMART BYTES.PF</h1>
              <p className="text-[10px] text-slate-300">Control y Finanzas</p>
            </div>

            <button
              onClick={onOpenTutorial}
              className="p-1.5 rounded-full bg-slate-900/50 hover:bg-amber-500/20 transition-colors text-amber-400 hover:text-amber-300 border border-slate-600/50"
              title="Tutorial"
            >
              <HelpCircle size={18} />
            </button>

            <button
              onClick={onOpenNotifications}
              className="p-1.5 rounded-full bg-slate-900/50 hover:bg-amber-500/20 transition-colors text-amber-400 hover:text-amber-300 border border-slate-600/50 relative"
              title="Notificaciones"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-slate-800 shadow-lg shadow-amber-500/50"></span>
              )}
            </button>

            <button
              onClick={onRefresh}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium transition-all border ${syncStatus === 'syncing'
                ? 'bg-slate-900/50 text-amber-300 cursor-wait border-amber-500/30'
                : syncStatus === 'error'
                  ? 'bg-red-900/50 text-red-300 hover:bg-red-900 border-red-500/50'
                  : 'bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/50 border-emerald-500/30'
                }`}
            >
              {syncStatus === 'syncing' ? <RefreshCw size={12} className="animate-spin" /> : syncStatus === 'error' ? <AlertCircle size={12} /> : <CheckCircle size={12} />}
              <span className="hidden sm:inline">
                {syncStatus === 'syncing' ? 'Guardando...' : syncStatus === 'error' ? 'Error' : 'Actualizado'}
              </span>
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-full bg-slate-900/50 hover:bg-amber-500/20 transition-colors text-amber-400 hover:text-amber-300 border border-slate-600/50"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={onOpenProfile}
              className="rounded-full bg-gradient-to-br from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 transition-colors flex items-center justify-center w-8 h-8 font-bold text-xs border-2 border-amber-400/50 overflow-hidden shadow-lg shadow-amber-900/50"
              title="Mi Perfil"
            >
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : <User size={16} />
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto">
            <RateDisplay label="USD BCV" value={rates.usd_bcv} color="bg-gradient-to-br from-slate-700 to-slate-800" />
            <RateDisplay label="EUR BCV" value={rates.eur_bcv} color="bg-gradient-to-br from-slate-700 to-slate-800" />
            <RateDisplay label="BINANCE BUY" value={rates.usd_binance_buy} color="bg-gradient-to-br from-slate-800 to-slate-900" />
            <RateDisplay label="BINANCE SELL" value={rates.usd_binance_sell} color="bg-gradient-to-br from-slate-800 to-slate-900" />
          </div>
        </div>
      </div>


      {
        !isVisible && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-900/50 rounded-b-lg p-1 animate-bounce cursor-pointer" onClick={() => setIsVisible(true)}>
            <ChevronDown size={14} className="text-white" />
          </div>
        )
      }
    </header >
  );
};