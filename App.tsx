
import React, { useState, useEffect, useMemo } from 'react';
import { FinancialItem, SpecialEvent, Currency, ShoppingItem, ExchangeRates, PhysicalAsset, Category } from './types';
import { SummaryChart } from './components/SummaryChart';
import { ItemForm } from './components/ItemForm';
import { EventForm } from './components/EventForm';
import { PhysicalAssetForm } from './components/PhysicalAssetForm';
import { LiquidationModal } from './components/LiquidationModal';
import { DebtSettlementModal } from './components/DebtSettlementModal';
import { FinancialAdvisor } from './components/FinancialAdvisor';
import { Tutorial } from './src/components/Tutorial';
import { NotificationsPanel } from './src/components/NotificationsPanel';
import { fetchBCVRates } from './src/services/bcvService';
import { Notification } from './src/types/notification';
import {
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  Settings,
  Plus,
  Trash2,
  DollarSign,
  Landmark,
  Smartphone,
  Briefcase,
  AlertTriangle,
  Edit,
  Moon,
  Sun,
  ShoppingBag,
  Receipt,
  Package,
  Box,
  BadgeDollarSign,
  ArrowRightLeft,
  BadgeDollarSign,
  ArrowRightLeft,
  MessageSquare,
  Bell,
  HelpCircle
} from 'lucide-react';

const INITIAL_DATA: FinancialItem[] = [
  { id: '1', name: 'Banco VNZ', amount: 19108.00, currency: 'VES', category: 'Bank', type: 'asset', isMonthly: false, note: 'Tasa oficial', customExchangeRate: undefined },
  { id: '2', name: 'Binance', amount: 1.00, currency: 'USD', category: 'Crypto', type: 'asset', isMonthly: false },
  { id: '3', name: '2Captcha', amount: 0.25, currency: 'USD', category: 'Wallet', type: 'asset', isMonthly: false },
  { id: '4', name: 'Efectivo', amount: 0, currency: 'USD', category: 'Cash', type: 'asset', isMonthly: false },
  { id: '5', name: 'Cuentas de LoL', amount: 10.00, currency: 'USD', category: 'Receivable', type: 'asset', isMonthly: false },
  { id: '6', name: 'Hermana (Maria)', amount: 395.00, currency: 'USD', category: 'Debt', type: 'liability', isMonthly: false, note: 'Aparte 170 y padre 50' },
  { id: '7', name: 'Sebastian', amount: 4.80, currency: 'USD', category: 'Debt', type: 'liability', isMonthly: false },
  { id: '8', name: 'Angel Gaspar', amount: 20.00, currency: 'USD', category: 'Debt', type: 'liability', isMonthly: false },
  { id: '9', name: 'Intercable', amount: 27.00, currency: 'USD', category: 'Expense', type: 'liability', isMonthly: true, dayOfMonth: 5, note: 'Al mes' },
  { id: '10', name: 'Insumos EKA', amount: 20.00, currency: 'USD', category: 'Expense', type: 'liability', isMonthly: true, dayOfMonth: 15 },
];

const INITIAL_EVENTS: SpecialEvent[] = [
  { id: '1', name: 'Cumpleaños Mamá', date: '05-15', type: 'birthday' },
  { id: '2', name: 'Pago Tarjeta', date: '09-28', type: 'payment' },
];

const INITIAL_SHOPPING: ShoppingItem[] = [];
const INITIAL_PHYSICAL_ASSETS: PhysicalAsset[] = [
  { id: '1', name: 'Laptop', estimatedValue: 300, currency: 'USD', description: 'HP Pavilion' }
];

const INITIAL_RATES: ExchangeRates = {
  usd_bcv: 45.50,
  eur_bcv: 49.20,
  usd_binance: 47.10,
  lastUpdated: new Date().toISOString()
};

function App() {
  const [items, setItems] = useState<FinancialItem[]>(INITIAL_DATA);
  const [physicalAssets, setPhysicalAssets] = useState<PhysicalAsset[]>(INITIAL_PHYSICAL_ASSETS);
  const [rates, setRates] = useState<ExchangeRates>(INITIAL_RATES);
  const [manualEvents, setManualEvents] = useState<SpecialEvent[]>(INITIAL_EVENTS);
  const [shoppingHistory, setShoppingHistory] = useState<ShoppingItem[]>(INITIAL_SHOPPING);

  // Modals visibility
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showLiquidationModal, setShowLiquidationModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Preselected category for categorized add buttons
  const [preselectedType, setPreselectedType] = useState<'asset' | 'liability' | undefined>(undefined);
  const [preselectedCategory, setPreselectedCategory] = useState<Category | undefined>(undefined);

  // Selection State
  const [editingItem, setEditingItem] = useState<FinancialItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<SpecialEvent | null>(null);
  const [editingAsset, setEditingAsset] = useState<PhysicalAsset | null>(null);
  const [liquidatingAsset, setLiquidatingAsset] = useState<PhysicalAsset | null>(null);
  const [settlingDebtItem, setSettlingDebtItem] = useState<FinancialItem | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'liabilities' | 'shopping' | 'inventory' | 'advisor'>('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  // New Shopping Form State
  const [newShoppingItem, setNewShoppingItem] = useState({ desc: '', amount: '', currency: 'VES' as Currency, date: new Date().toISOString().split('T')[0] });

  // Dark Mode Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Tutorial Effect - Check if user has seen tutorial
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  // BCV Auto-fetch Effect
  useEffect(() => {
    const loadBCVRates = async () => {
      const response = await fetchBCVRates();
      if (response.success && response.data) {
        setRates(prev => ({
          ...prev,
          usd_bcv: response.data!.usd_bcv,
          eur_bcv: response.data!.eur_bcv,
          lastUpdated: response.data!.timestamp
        }));
      }
    };
    loadBCVRates();
    loadBCVRates();
  }, []);

  // Notifications Logic
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: Notification[] = [];
      const today = new Date();

      // 1. System Update Notification (Static)
      const hasSeenUpdate = localStorage.getItem('hasSeenUpdate_v1');
      if (!hasSeenUpdate) {
        newNotifications.push({
          id: 'update-v1',
          title: '¡Nuevas Funciones!',
          message: 'Ahora puedes usar los botones rápidos de "Tengo", "Me Deben", "Gasto" y "Ahorro". También las tasas se actualizan solas.',
          type: 'info',
          date: 'Hoy',
          read: false
        });
        localStorage.setItem('hasSeenUpdate_v1', 'true');
      }

      // 2. Event Notifications (Upcoming 7 days)
      allEvents.forEach(event => {
        const [month, day] = event.date.split('-').map(Number);
        const eventDate = new Date(today.getFullYear(), month - 1, day);

        // Handle year wrap for dates early in the year when currently late in year
        if (eventDate < today && (today.getMonth() > 10 && month < 2)) {
          eventDate.setFullYear(today.getFullYear() + 1);
        }

        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 7) {
          newNotifications.push({
            id: `event-${event.id}-${today.getFullYear()}`,
            title: event.type === 'birthday' ? '🎂 Cumpleaños Cercano' : '📅 Pago Próximo',
            message: `${event.name} es ${diffDays === 0 ? 'hoy' : diffDays === 1 ? 'mañana' : `en ${diffDays} días`}.`,
            type: 'event',
            date: diffDays === 0 ? 'Hoy' : `${day}/${month}`,
            read: false
          });
        }
      });

      // 3. Savings Achievements
      if (liquidNetWorth > 100 && !localStorage.getItem('achievement_100')) {
        newNotifications.push({
          id: 'ach-100',
          title: '🏆 ¡Primer Hito!',
          message: 'Has superado los $100 en liquidez neta. ¡Sigue así!',
          type: 'success',
          date: 'Hoy',
          read: false
        });
        localStorage.setItem('achievement_100', 'true');
      }

      if (totalPatrimony > 1000 && !localStorage.getItem('achievement_1000')) {
        newNotifications.push({
          id: 'ach-1000',
          title: '🚀 ¡Patrimonio en Crecimiento!',
          message: 'Tu patrimonio total ha superado los $1,000. ¡Gran trabajo!',
          type: 'success',
          date: 'Hoy',
          read: false
        });
        localStorage.setItem('achievement_1000', 'true');
      }

      if (newNotifications.length > 0) {
        setNotifications(prev => {
          // Avoid duplicates
          const existingIds = new Set(prev.map(n => n.id));
          const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
          return [...uniqueNew, ...prev];
        });
      }
    };

    generateNotifications();
  }, [allEvents, liquidNetWorth, totalPatrimony]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Derived Events (Manual + Recurring Expenses)
  const allEvents = useMemo(() => {
    const recurringEvents: SpecialEvent[] = items
      .filter(i => i.isMonthly && i.dayOfMonth)
      .map(i => ({
        id: `recurring-${i.id}`,
        name: `Pago: ${i.name}`,
        date: i.dayOfMonth ? `${new Date().getMonth() + 1}`.padStart(2, '0') + `-${i.dayOfMonth.toString().padStart(2, '0')}` : '00-00',
        type: 'payment'
      }));

    // Simple sort by date (MM-DD)
    return [...manualEvents, ...recurringEvents].sort((a, b) => {
      const da = a.date.split('-').slice(-2).join('-');
      const db = b.date.split('-').slice(-2).join('-');
      return da.localeCompare(db);
    });
  }, [items, manualEvents]);

  // Helper to format currency
  const formatMoney = (amount: number, currency: Currency) => {
    if (currency === 'USD') return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (currency === 'EUR') return `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    return `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`;
  };

  // Convert to USD for totals
  const toUSD = (item: { amount: number, currency: Currency, customExchangeRate?: number }) => {
    if (item.currency === 'USD') return item.amount;
    if (item.currency === 'EUR') return item.amount * 1.08; // Approx EUR to USD
    const rate = item.customExchangeRate || rates.usd_bcv;
    return rate > 0 ? item.amount / rate : 0;
  };

  // Calculations
  const totalAssets = items.filter(i => i.type === 'asset').reduce((acc, i) => acc + toUSD(i), 0);
  const totalPhysicalAssets = physicalAssets.reduce((acc, i) => acc + toUSD({ amount: i.estimatedValue, currency: i.currency }), 0);
  const totalLiabilities = items.filter(i => i.type === 'liability').reduce((acc, i) => acc + toUSD(i), 0);

  const liquidNetWorth = totalAssets - totalLiabilities;
  const totalPatrimony = liquidNetWorth + totalPhysicalAssets;

  const monthlyExpenses = items.filter(i => i.type === 'liability' && i.isMonthly).reduce((acc, i) => acc + toUSD(i), 0);

  // Handlers
  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar registro?')) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const handleAddItem = (newItem: Omit<FinancialItem, 'id'>) => {
    const item: FinancialItem = { ...newItem, id: Math.random().toString(36).substr(2, 9) };
    setItems([...items, item]);
  };

  const handleUpdateItem = (updatedItem: FinancialItem) => {
    setItems(items.map(i => i.id === updatedItem.id ? updatedItem : i));
    setEditingItem(null);
  };

  const handleAddEvent = (newEvent: Omit<SpecialEvent, 'id'>) => {
    const event: SpecialEvent = { ...newEvent, id: Math.random().toString(36).substr(2, 9) };
    setManualEvents([...manualEvents, event]);
  }

  const handleUpdateEvent = (updatedEvent: SpecialEvent) => {
    setManualEvents(manualEvents.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    setEditingEvent(null);
  }

  const handleDeleteEvent = (id: string) => {
    setManualEvents(manualEvents.filter(e => e.id !== id));
    setEditingEvent(null);
  }

  // Physical Asset Handlers
  const handleAddAsset = (newAsset: Omit<PhysicalAsset, 'id'>) => {
    const asset: PhysicalAsset = { ...newAsset, id: Math.random().toString(36).substr(2, 9) };
    setPhysicalAssets([...physicalAssets, asset]);
  }

  const handleUpdateAsset = (updatedAsset: PhysicalAsset) => {
    setPhysicalAssets(physicalAssets.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    setEditingAsset(null);
  }

  const handleDeleteAsset = (id: string) => {
    setPhysicalAssets(physicalAssets.filter(a => a.id !== id));
    setEditingAsset(null);
  }

  const handleLiquidation = (salePrice: number, targetAccountId: string) => {
    if (!liquidatingAsset) return;
    setItems(prev => prev.map(item => {
      if (item.id === targetAccountId) return { ...item, amount: item.amount + salePrice };
      return item;
    }));
    setPhysicalAssets(prev => prev.filter(a => a.id !== liquidatingAsset.id));
    setShowLiquidationModal(false);
    setLiquidatingAsset(null);
  };

  const handleDebtSettlement = (
    amount: number,
    method: 'money' | 'asset_out' | 'asset_in',
    details: { accountId?: string; assetId?: string; newAsset?: Partial<PhysicalAsset>, note?: string }
  ) => {
    if (!settlingDebtItem) return;

    const isDebt = settlingDebtItem.type === 'liability';

    // 1. Update the Debt/Receivable Amount
    const newDebtAmount = Math.max(0, settlingDebtItem.amount - amount);
    setItems(prev => prev.map(item => {
      if (item.id === settlingDebtItem.id) {
        return {
          ...item,
          amount: newDebtAmount,
          note: details.note || item.note // Update note with last transaction
        };
      }
      // 2. Handle Money updates
      if (method === 'money' && details.accountId && item.id === details.accountId) {
        if (isDebt) {
          return { ...item, amount: item.amount - amount }; // Paying: Money decreases
        } else {
          return { ...item, amount: item.amount + amount }; // Collecting: Money increases
        }
      }
      return item;
    }));

    // 3. Handle Asset updates
    if (method === 'asset_out' && details.assetId) {
      // Paying with asset: Remove from inventory
      setPhysicalAssets(prev => prev.filter(a => a.id !== details.assetId));
    } else if (method === 'asset_in' && details.newAsset) {
      // Collecting with asset: Add to inventory
      const newAsset: PhysicalAsset = {
        id: Math.random().toString(36).substr(2, 9),
        name: details.newAsset.name || 'Nuevo Activo',
        estimatedValue: details.newAsset.estimatedValue || 0,
        currency: details.newAsset.currency || 'USD',
        description: details.newAsset.description || 'Recibido por pago de deuda'
      };
      setPhysicalAssets(prev => [...prev, newAsset]);
    }

    setShowDebtModal(false);
    setSettlingDebtItem(null);
  };

  const addShoppingItem = () => {
    if (!newShoppingItem.desc || !newShoppingItem.amount) return;
    const item: ShoppingItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: newShoppingItem.desc,
      amount: parseFloat(newShoppingItem.amount),
      currency: newShoppingItem.currency,
      date: newShoppingItem.date,
      hasReceipt: true // Placeholder
    };
    setShoppingHistory([item, ...shoppingHistory]);
    setNewShoppingItem({ desc: '', amount: '', currency: 'VES', date: new Date().toISOString().split('T')[0] });
  };

  // Modal Openers
  const openEditModal = (item: FinancialItem) => { setEditingItem(null); setPreselectedType(undefined); setPreselectedCategory(undefined); setEditingItem(item); setShowAddModal(true); };
  const openAddModal = () => { setEditingItem(null); setPreselectedType(undefined); setPreselectedCategory(undefined); setShowAddModal(true); };

  // Categorized Add Modal Openers
  const openTengoModal = () => { setEditingItem(null); setPreselectedType('asset'); setPreselectedCategory('Bank'); setShowAddModal(true); };
  const openMeDebenModal = () => { setEditingItem(null); setPreselectedType('asset'); setPreselectedCategory('Receivable'); setShowAddModal(true); };
  const openGastoModal = () => { setEditingItem(null); setPreselectedType('liability'); setPreselectedCategory('Expense'); setShowAddModal(true); };
  const openAhorroModal = () => { setEditingItem(null); setPreselectedType('asset'); setPreselectedCategory('Savings'); setShowAddModal(true); };

  const openEditEventModal = (event: SpecialEvent) => {
    if (event.id.startsWith('recurring-')) return;
    setEditingEvent(event);
    setShowEventModal(true);
  };
  const openAddEventModal = () => { setEditingEvent(null); setShowEventModal(true); };

  const openEditAssetModal = (asset: PhysicalAsset) => { setEditingAsset(asset); setShowAssetModal(true); };
  const openAddAssetModal = () => { setEditingAsset(null); setShowAssetModal(true); };
  const openLiquidationModal = (asset: PhysicalAsset) => { setLiquidatingAsset(asset); setShowLiquidationModal(true); };

  const openDebtSettlement = (item: FinancialItem) => {
    setSettlingDebtItem(item);
    setShowDebtModal(true);
  };


  // Render Helpers
  const getIcon = (category: string) => {
    switch (category) {
      case 'Bank': return <Landmark size={18} className="text-blue-600 dark:text-blue-400" />;
      case 'Crypto': return <Smartphone size={18} className="text-yellow-500 dark:text-yellow-400" />;
      case 'Wallet': return <Wallet size={18} className="text-purple-500 dark:text-purple-400" />;
      case 'Cash': return <DollarSign size={18} className="text-green-600 dark:text-green-400" />;
      case 'Debt': return <TrendingDown size={18} className="text-red-500 dark:text-red-400" />;
      case 'Receivable': return <Briefcase size={18} className="text-indigo-500 dark:text-indigo-400" />;
      default: return <CreditCard size={18} className="text-gray-500 dark:text-gray-400" />;
    }
  };

  const renderList = (type: 'asset' | 'liability') => {
    const filtered = items.filter(i => i.type === type);
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 font-medium">
              <tr>
                <th className="px-3 py-3 w-[30%]">Concepto</th>
                <th className="px-2 py-3 hidden md:table-cell">Categoría</th>
                <th className="px-3 py-3 text-right">Monto</th>
                <th className="px-3 py-3 text-right hidden sm:table-cell">USD</th>
                <th className="px-3 py-3 text-center w-[20%]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map(item => {
                const usdValue = toUSD(item);
                const rateUsed = item.customExchangeRate || rates.usd_bcv;
                const isSettlable = (item.category === 'Debt' || item.category === 'Receivable') && item.amount > 0;

                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-3 py-3">
                      <div className="font-medium text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-none">{item.name}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.note && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                            <MessageSquare size={8} />
                            {item.note}
                          </span>
                        )}
                        {item.isMonthly && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                            Mensual
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {getIcon(item.category)}
                        <span className="text-gray-600 dark:text-gray-300 text-xs">{item.category}</span>
                      </div>
                    </td>
                    <td className={`px-3 py-3 text-right font-mono ${item.type === 'asset' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatMoney(item.amount, item.currency)}
                    </td>
                    <td className="px-3 py-3 text-right hidden sm:table-cell">
                      <div className="font-mono text-gray-700 dark:text-gray-300 text-xs">${usdValue.toFixed(2)}</div>
                      {item.currency === 'VES' && (
                        <div className="text-[9px] text-gray-400">@{rateUsed.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-end gap-1">
                        {isSettlable && (
                          <button
                            onClick={() => openDebtSettlement(item)}
                            className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1.5 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors mr-1"
                            title="Liquidar / Pagar / Cobrar"
                          >
                            <ArrowRightLeft size={16} />
                          </button>
                        )}
                        <button onClick={() => openEditModal(item)} className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-1.5"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1.5"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Helper to get liquid accounts for the modal
  const liquidAccounts = items.filter(i => i.type === 'asset' && ['Bank', 'Wallet', 'Crypto', 'Cash'].includes(i.category));

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-[#f3f4f6] dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-blue-900 dark:bg-blue-950 text-white p-4 shadow-lg sticky top-0 z-30 transition-colors">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight">SMART BYTES.PF FINANZAS</h1>
              <p className="text-xs text-blue-200 dark:text-blue-300">Control personal & Ahorro</p>
            </div>
            <div className="flex gap-2 items-center relative">
              {/* Tutorial Button */}
              <button
                onClick={() => setShowTutorial(true)}
                className="hidden md:flex items-center gap-1 bg-blue-800 hover:bg-blue-700 text-blue-100 hover:text-white px-3 py-1.5 rounded-full text-xs font-medium transition-colors border border-blue-700"
              >
                <HelpCircle size={14} />
                Tutorial
              </button>

              {/* Mobile Tutorial Icon */}
              <button
                onClick={() => setShowTutorial(true)}
                className="md:hidden p-2 rounded-full hover:bg-blue-800 dark:hover:bg-blue-900 transition-colors text-blue-200 hover:text-white"
              >
                <HelpCircle size={20} />
              </button>

              {/* Notifications Button */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-blue-800 dark:hover:bg-blue-900 transition-colors text-blue-200 hover:text-white relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-blue-900"></span>
                )}
              </button>

              {/* Notifications Panel */}
              {showNotifications && (
                <NotificationsPanel
                  notifications={notifications}
                  onClose={() => setShowNotifications(false)}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                />
              )}

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-blue-800 dark:hover:bg-blue-900 transition-colors text-blue-200 hover:text-white"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>

          {/* Tasas Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rates-dashboard">
            {/* Dolar BCV */}
            <div className="bg-blue-800 dark:bg-blue-900 p-2 rounded-lg border border-blue-700">
              <div className="text-[10px] text-blue-300 uppercase font-bold">Dólar BCV</div>
              <div className="flex items-center gap-1">
                <span className="text-xs">Bs.</span>
                <input
                  type="number"
                  value={rates.usd_bcv}
                  onChange={(e) => setRates({ ...rates, usd_bcv: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-white font-mono font-bold text-sm"
                />
              </div>
            </div>
            {/* Euro BCV */}
            <div className="bg-blue-800 dark:bg-blue-900 p-2 rounded-lg border border-blue-700">
              <div className="text-[10px] text-blue-300 uppercase font-bold">Euro BCV</div>
              <div className="flex items-center gap-1">
                <span className="text-xs">Bs.</span>
                <input
                  type="number"
                  value={rates.eur_bcv}
                  onChange={(e) => setRates({ ...rates, eur_bcv: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-white font-mono font-bold text-sm"
                />
              </div>
            </div>
            {/* Binance */}
            <div className="bg-gray-800 dark:bg-gray-800 p-2 rounded-lg border border-gray-700">
              <div className="text-[10px] text-yellow-500 uppercase font-bold">Binance USDT</div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Bs.</span>
                <input
                  type="number"
                  value={rates.usd_binance}
                  onChange={(e) => setRates({ ...rates, usd_binance: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-white font-mono font-bold text-sm"
                />
              </div>
            </div>
            {/* Disclaimer */}
            <div className="flex items-center justify-center">
              <p className="text-[9px] text-blue-300 leading-tight text-center">
                *Actualiza las tasas manualmente. El bloqueo de seguridad del navegador impide la conexión automática con el BCV.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">

        {/* Top Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 summary-cards">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-green-500 transition-colors">
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Liquidez (Tengo)</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">${totalAssets.toFixed(2)}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Dinero disponible en cuentas/efectivo
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-emerald-700 transition-colors">
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Patrimonio Físico</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">${totalPhysicalAssets.toFixed(2)}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Inventario de bienes materiales
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-red-500 transition-colors">
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Deudas</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">${totalLiabilities.toFixed(2)}</div>
            <div className="text-xs text-red-400 dark:text-red-300 mt-1 font-medium">
              Patrimonio Neto: <span className={totalPatrimony >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>${totalPatrimony.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-yellow-500 relative overflow-hidden transition-colors">
            <div className="relative z-10">
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Gasto Fijo Mensual</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">${monthlyExpenses.toFixed(2)}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Suscripciones, Alquiler, etc.</div>
            </div>
            <Calendar className="absolute -right-2 -bottom-4 text-yellow-50 dark:text-yellow-900/10 opacity-50 w-24 h-24" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide nav-tabs">
          <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'dashboard' ? 'bg-blue-900 text-white dark:bg-blue-700' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>Resumen</button>
          <button onClick={() => setActiveTab('assets')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'assets' ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>Tengo / Me Deben</button>
          <button onClick={() => setActiveTab('liabilities')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'liabilities' ? 'bg-red-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>Debo / Fijos</button>
          <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'inventory' ? 'bg-emerald-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}><Box size={14} /> Inventario</button>
          <button onClick={() => setActiveTab('shopping')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'shopping' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}><ShoppingBag size={14} /> Gastos (Historial)</button>
          <button onClick={() => setActiveTab('advisor')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'advisor' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}><Settings size={14} /> Asesor IA</button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">

            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <SummaryChart items={items} exchangeRate={rates.usd_bcv} />

                {/* Alertas */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 transition-colors">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-orange-500" />
                    Deudas Pendientes
                  </h3>
                  <div className="space-y-2">
                    {items.filter(i => i.type === 'liability' && !i.isMonthly && toUSD(i) > 0).map(debt => (
                      <div key={debt.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{debt.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-red-700 dark:text-red-400">{formatMoney(debt.amount, debt.currency)}</span>
                          <button
                            onClick={() => openDebtSettlement(debt)}
                            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                          >
                            Pagar
                          </button>
                        </div>
                      </div>
                    ))}
                    {items.filter(i => i.type === 'liability' && !i.isMonthly).length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No tienes deudas registradas.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assets' && renderList('asset')}
            {activeTab === 'liabilities' && renderList('liability')}

            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Objetos de valor que no afectan tu liquidez diaria.</p>
                  <button onClick={openAddAssetModal} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-1">
                    <Plus size={16} /> Agregar Objeto
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 font-medium">
                        <tr>
                          <th className="px-4 py-3">Nombre</th>
                          <th className="px-4 py-3 hidden sm:table-cell">Descripción</th>
                          <th className="px-4 py-3 text-right">Valor Est.</th>
                          <th className="px-4 py-3 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {physicalAssets.map(asset => (
                          <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                              <div className="flex items-center gap-2">
                                <Box size={16} className="text-emerald-500" />
                                {asset.name}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 truncate max-w-xs hidden sm:table-cell">{asset.description || '-'}</td>
                            <td className="px-4 py-3 text-right font-mono text-gray-800 dark:text-gray-200">
                              {formatMoney(asset.estimatedValue, asset.currency)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openLiquidationModal(asset)}
                                  title="Liquidar (Vender)"
                                  className="text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-1.5 rounded-md transition-colors"
                                >
                                  <BadgeDollarSign size={16} />
                                </button>
                                <button onClick={() => openEditAssetModal(asset)} className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-1"><Edit size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {physicalAssets.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                              No tienes activos físicos registrados.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shopping' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-100 dark:border-orange-900/30">
                  <h3 className="font-bold text-orange-800 dark:text-orange-300 mb-2 flex items-center gap-2">
                    <Plus size={16} /> Registrar Compra / Gasto Hormiga
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Descripción (ej: Harina PAN)"
                      className="flex-grow p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      value={newShoppingItem.desc}
                      onChange={e => setNewShoppingItem({ ...newShoppingItem, desc: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Monto"
                      className="w-24 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      value={newShoppingItem.amount}
                      onChange={e => setNewShoppingItem({ ...newShoppingItem, amount: e.target.value })}
                    />
                    <select
                      className="w-24 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      value={newShoppingItem.currency}
                      onChange={e => setNewShoppingItem({ ...newShoppingItem, currency: e.target.value as Currency })}
                    >
                      <option value="VES">Bs.S</option>
                      <option value="USD">USD</option>
                    </select>
                    <input
                      type="date"
                      className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      value={newShoppingItem.date}
                      onChange={e => setNewShoppingItem({ ...newShoppingItem, date: e.target.value })}
                    />
                    <button onClick={addShoppingItem} className="bg-orange-500 text-white px-4 py-2 rounded font-medium text-sm hover:bg-orange-600">
                      Agregar
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Historial Reciente</h4>
                  <div className="space-y-3">
                    {shoppingHistory.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full text-orange-600 dark:text-orange-400">
                            <Receipt size={16} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 dark:text-gray-200">{item.description}</div>
                            <div className="text-xs text-gray-400">{item.date} • {item.hasReceipt ? 'Factura/Foto' : 'Sin soporte'}</div>
                          </div>
                        </div>
                        <div className="font-mono font-medium text-gray-700 dark:text-gray-300">
                          {formatMoney(item.amount, item.currency)}
                        </div>
                      </div>
                    ))}
                    {shoppingHistory.length === 0 && (
                      <p className="text-center text-gray-400 py-4 text-sm">No has registrado compras todavía.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advisor' && (
              <FinancialAdvisor items={items} exchangeRate={rates.usd_bcv} />
            )}
          </div>

          {/* Sidebar (Right col) */}
          <div className="space-y-6">
            {/* Categorized Add Buttons */}
            <div className="space-y-3 add-buttons-section">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Agregar</h3>

              <button
                onClick={openTengoModal}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Tengo
              </button>

              <button
                onClick={openMeDebenModal}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Me Deben
              </button>

              <button
                onClick={openGastoModal}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Gasto / Deuda
              </button>

              <button
                onClick={openAhorroModal}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Ahorro
              </button>
            </div>

            {/* Events Widget */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Calendar size={18} className="text-blue-500" />
                  Agenda / Pagos
                </h3>
                <button onClick={openAddEventModal} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-200 transition-colors">
                  + Evento
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {allEvents.map(event => (
                  <div
                    key={event.id}
                    className={`group flex items-center gap-3 p-2 rounded-lg transition-colors border border-transparent ${event.id.startsWith('recurring') ? 'bg-gray-50 dark:bg-gray-700/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600 cursor-pointer'}`}
                    onClick={() => !event.id.startsWith('recurring') && openEditEventModal(event)}
                  >
                    <div className={`w-10 h-10 rounded-full flex flex-col items-center justify-center text-white text-[10px] font-bold leading-none ${event.type === 'birthday' ? 'bg-pink-400' : event.type === 'payment' ? 'bg-blue-400' : 'bg-gray-400'}`}>
                      <span>{event.date.split('-')[1]}</span>
                      <span className="opacity-75 text-[8px] uppercase">Mes {event.date.split('-')[0]}</span>
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">{event.name}</div>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-400 capitalize">{event.type === 'birthday' ? 'Cumpleaños' : 'Pago/Vencimiento'}</div>
                        {!event.id.startsWith('recurring') && <Edit size={12} className="text-gray-300 opacity-0 group-hover:opacity-100" />}
                      </div>
                    </div>
                  </div>
                ))}
                {allEvents.length === 0 && <p className="text-xs text-gray-400 text-center">Sin eventos próximos</p>}
              </div>
            </div>

            {/* Tips Widget */}
            <div className="bg-gradient-to-br from-indigo-900 to-blue-900 dark:from-indigo-950 dark:to-blue-950 rounded-xl shadow-md p-5 text-white">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <TrendingUp size={18} /> Tip de Ahorro
              </h3>
              <p className="text-sm text-blue-100 opacity-90 leading-relaxed">
                "En economías inflacionarias, trata de mantener tu fondo de emergencia en moneda dura (USD/USDT). Usa Bolívares solo para gastos inmediatos."
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* Floating Action Button (Mobile Only) */}
      <button
        onClick={openAddModal}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 dark:bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-colors"
      >
        <Plus size={28} />
      </button>

      {showAddModal && (
        <ItemForm
          onAdd={handleAddItem}
          onEdit={handleUpdateItem}
          initialData={editingItem || undefined}
          preselectedType={preselectedType}
          preselectedCategory={preselectedCategory}
          onClose={() => { setShowAddModal(false); setPreselectedType(undefined); setPreselectedCategory(undefined); }}
        />
      )}

      {showTutorial && (
        <Tutorial
          onComplete={() => {
            localStorage.setItem('hasSeenTutorial', 'true');
            setShowTutorial(false);
          }}
        />
      )}

      {showEventModal && (
        <EventForm
          onAdd={handleAddEvent}
          onEdit={handleUpdateEvent}
          onDelete={handleDeleteEvent}
          initialData={editingEvent || undefined}
          onClose={() => setShowEventModal(false)}
        />
      )}

      {showAssetModal && (
        <PhysicalAssetForm
          onAdd={handleAddAsset}
          onEdit={handleUpdateAsset}
          onDelete={handleDeleteAsset}
          initialData={editingAsset || undefined}
          onClose={() => setShowAssetModal(false)}
        />
      )}

      {showLiquidationModal && liquidatingAsset && (
        <LiquidationModal
          asset={liquidatingAsset}
          accounts={items.filter(i => i.type === 'asset')}
          onConfirm={handleLiquidation}
          onClose={() => setShowLiquidationModal(false)}
        />
      )}

      {showDebtModal && settlingDebtItem && (
        <DebtSettlementModal
          item={settlingDebtItem}
          liquidAccounts={liquidAccounts}
          inventory={physicalAssets}
          onConfirm={handleDebtSettlement}
          onClose={() => setShowDebtModal(false)}
        />
      )}
    </div>
  );
}

export default App;
