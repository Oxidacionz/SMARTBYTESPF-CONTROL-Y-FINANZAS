import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { FinancialItem, SpecialEvent, Currency, ShoppingItem, ExchangeRates, PhysicalAsset, UserProfile, DirectoryEntity, FinancialGoal, UserFinancialProfile, FinancialRecommendation, BudgetDistribution } from './types';
import { Dashboard } from './components/organisms/Dashboard';
import { ItemForm } from './components/organisms/forms/ItemForm';
import { EventForm } from './components/organisms/forms/EventForm';
import { PhysicalAssetForm } from './components/organisms/forms/PhysicalAssetForm';
import { LiquidationModal } from './components/organisms/modals/LiquidationModal';
import { DebtSettlementModal } from './components/organisms/modals/DebtSettlementModal';
import { ReportUploadModal } from './components/organisms/modals/ReportUploadModal';
import { AuthModal } from './components/organisms/modals/AuthModal';
import { ProfileModal } from './components/organisms/modals/ProfileModal';
import { ShoppingHistoryModal } from './components/organisms/modals/ShoppingHistoryModal';
import { FinancialAdvisor } from './components/organisms/FinancialAdvisor';
import { Header } from './components/organisms/Header';
import { MainLayout } from './components/templates/MainLayout';
import { StatCard } from './components/molecules/StatCard';
import { AgendaWidget } from './components/molecules/AgendaWidget';
import { DirectoryWidget } from './components/organisms/DirectoryWidget';
import { Button } from './components/atoms/Button';
import { Card } from './components/atoms/Card';
import { exportToExcel } from './services/exportService';
import { Tutorial } from './components/Tutorial';
import { NotificationsPanel } from './components/NotificationsPanel';
import { Notification } from './types/notification';
import { GoalsManager } from './components/organisms/GoalsManager';
import { GoalForm } from './components/organisms/forms/GoalForm';
import { ContributionModal } from './components/organisms/modals/ContributionModal';
import { FinancialProfileForm } from './components/organisms/forms/FinancialProfileForm';
import { FinancialPlanDashboard } from './components/organisms/FinancialPlanDashboard';

// DB Services
import { dbItems, dbAssets, dbEvents, dbShopping, dbRates, dbDirectory, dbGoals, dbProfile, recommendationEngine } from './services/db';
import { supabase } from './supabaseClient';
import { useExchangeRates } from './hooks/useExchangeRates';
import { MoneyMath } from './utils/moneyMath';

import {
  Calendar, Plus, Trash2, Edit, Box, TrendingUp, RefreshCw, UploadCloud, Download, Clock, Settings, ShoppingBag, PieChart, ChevronUp
} from 'lucide-react';

// Robust ID Generator (Fallback for non-secure contexts)
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

function App() {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [items, setItems] = useState<FinancialItem[]>([]);
  const [physicalAssets, setPhysicalAssets] = useState<PhysicalAsset[]>([]);
  // rates managed by hook
  const [manualEvents, setManualEvents] = useState<SpecialEvent[]>([]);
  const [shoppingHistory, setShoppingHistory] = useState<ShoppingItem[]>([]);
  const [directory, setDirectory] = useState<DirectoryEntity[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [financialProfile, setFinancialProfile] = useState<UserFinancialProfile | null>(null);
  const [recommendations, setRecommendations] = useState<FinancialRecommendation[]>([]);
  const [showProfileForm, setShowProfileForm] = useState(false);

  // Loading & Sync managed partly by hook, partly here for other items
  const [isLoading, setIsLoading] = useState(false);
  // syncStatus managed by hook for rates, but we use strict local one? 
  // We'll reuse the hook's status or merge logic. 
  // Ideally, app has global sync status. For now, let's keep a local one for Item CRUD.
  const [appSyncStatus, setAppSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'liabilities' | 'inventory' | 'goals' | 'advisor'>('dashboard');
  const [darkMode, setDarkMode] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showLiquidationModal, setShowLiquidationModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<FinancialGoal | null>(null);
  const [showDistributionChart, setShowDistributionChart] = useState(false);
  const [showReportsMenu, setShowReportsMenu] = useState(false);

  const [editingItem, setEditingItem] = useState<FinancialItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<SpecialEvent | null>(null);
  const [editingAsset, setEditingAsset] = useState<PhysicalAsset | null>(null);
  const [liquidatingAsset, setLiquidatingAsset] = useState<PhysicalAsset | null>(null);
  const [settlingDebtItem, setSettlingDebtItem] = useState<FinancialItem | null>(null);

  const lastLoadedUserId = useRef<string | null>(null);

  // Helper for notifications (passed to hooks)
  const addNotification = useCallback((n: Notification) => {
    setNotifications(prev => {
      const exists = prev.some(existing => existing.id === n.id);
      if (exists) return prev;
      return [n, ...prev];
    });
  }, []);

  // Custom Hook for Exchange Rates
  const {
    rates,
    setRates,
    isUpdating: isRatesUpdating,
    syncStatus: ratesSyncStatus,
    setSyncStatus: setRatesSyncStatus,
    handleRateUpdate,
    forceUpdate: handleForceRatesUpdate
  } = useExchangeRates(addNotification);

  // Derived Sync Status (Show 'syncing' if either App or Rates are syncing)
  const syncStatus = appSyncStatus === 'syncing' || ratesSyncStatus === 'syncing' ? 'syncing' :
    appSyncStatus === 'error' || ratesSyncStatus === 'error' ? 'error' : 'synced';

  // Auth & Data Load Effect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        if (session.user.id !== lastLoadedUserId.current) {
          lastLoadedUserId.current = session.user.id;
          loadUserData(session.user.id);
        }
      } else {
        const demoSessionStr = sessionStorage.getItem('demoSession');
        if (demoSessionStr) {
          try {
            const demoSession = JSON.parse(demoSessionStr);
            setSession(demoSession);
            if (demoSession.user.id !== lastLoadedUserId.current) {
              lastLoadedUserId.current = demoSession.user.id;
              loadUserData(demoSession.user.id);
            }
          } catch (e) {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const isDemoMode = sessionStorage.getItem('demoSession');
      if (isDemoMode && !session) return;

      setSession(session);

      if (event === 'SIGNED_OUT') {
        if (!isDemoMode) {
          lastLoadedUserId.current = null;
          setItems([]);
          setPhysicalAssets([]);
          setManualEvents([]);
          setShoppingHistory([]);
          setDirectory([]);
          setUserProfile(null);
          setActiveTab('dashboard');
        }
      } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session && session.user.id !== lastLoadedUserId.current) {
          lastLoadedUserId.current = session.user.id;
          loadUserData(session.user.id);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    setIsLoading(true);
    setAppSyncStatus('syncing');

    try {
      if (userId === 'demo-user') {
        setUserProfile({ id: 'demo-user', email: 'demo@smartbytes.com', full_name: 'Usuario Demo' });
        setItems([
          { id: '1', name: 'Sueldo Demo', amount: 300, currency: 'USD', category: 'Income', type: 'asset', isMonthly: true },
          { id: '2', name: 'Alquiler Demo', amount: 120, currency: 'USD', category: 'Expense', type: 'liability', isMonthly: true }
        ]);
        setAppSyncStatus('synced');
        setIsLoading(false);
        return;
      }

      // 1. Load Profile
      try {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (profile) setUserProfile(profile);
        else {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) setUserProfile({ id: user.id, email: user.email || '', full_name: user.user_metadata?.full_name || '' });
        }
      } catch (profileError) { console.warn("Profile fetch warning:", profileError); }

      // 2. Load Core Data
      const [fetchedItems, fetchedAssets, fetchedEvents, fetchedShopping] = await Promise.all([
        dbItems.getAll(),
        dbAssets.getAll(),
        dbEvents.getAll(),
        dbShopping.getAll(),
      ]);

      setItems(fetchedItems);
      setPhysicalAssets(fetchedAssets);
      setManualEvents(fetchedEvents);
      setShoppingHistory(fetchedShopping);

      // 3. Load Independent Data
      // Note: Rates are handled by useExchangeRates hook on mount, 
      // but we can optionally fetch them here to be sure or just rely on the hook.
      // Hook will run its effect independently.

      try {
        const fetchedDirectory = await dbDirectory.getAll();
        setDirectory(fetchedDirectory);
      } catch (e) { console.warn("Could not load directory", e); }

      try {
        const fetchedGoals = await dbGoals.getAll();
        setGoals(fetchedGoals);
      } catch (e) { console.warn("Could not load goals", e); }

      try {
        const fetchedProfile = await dbProfile.getProfile();
        setFinancialProfile(fetchedProfile);
        if (fetchedProfile) {
          const fetchedRecs = await dbProfile.getRecommendations();
          setRecommendations(fetchedRecs);
        }
      } catch (e) { console.warn("Could not load profile/recommendations.", e); }

      setAppSyncStatus('synced');
    } catch (e) {
      console.error("Critical Load Error", e);
      setAppSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const allEvents = useMemo(() => {
    const recurring = items
      .filter(i => i.isMonthly && i.dayOfMonth)
      .map(i => {
        const currentMonth = new Date().getMonth() + 1;
        const monthStr = currentMonth.toString().padStart(2, '0');
        const dayStr = (i.dayOfMonth || 1).toString().padStart(2, '0');

        return {
          id: `recurring-${i.id}`,
          name: `Pago: ${i.name}`,
          date: `${monthStr}-${dayStr}`,
          type: 'payment' as const
        };
      });
    return [...manualEvents, ...recurring].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }, [items, manualEvents]);

  // Tutorial Effect
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  // Notifications Logic
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: Notification[] = [];
      const today = new Date();

      const hasSeenUpdate = localStorage.getItem('hasSeenUpdate_v2');
      if (!hasSeenUpdate) {
        newNotifications.push({
          id: 'update-v2',
          title: '¡Nuevas Funciones!',
          message: 'Ahora puedes usar los botones rápidos de "Tengo", "Me Deben", "Gasto" y "Ahorro". También las tasas se actualizan solas.',
          type: 'info',
          date: 'Hoy',
          read: false
        });
        localStorage.setItem('hasSeenUpdate_v2', 'true');
      }

      allEvents.forEach(event => {
        const [month, day] = (event.date || '00-00').split('-').map(Number);
        const eventDate = new Date(today.getFullYear(), month - 1, day);

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

      if (newNotifications.length > 0) {
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
          return [...uniqueNew, ...prev];
        });
      }
    };

    generateNotifications();
  }, [allEvents]);

  const toUSD = (item: { amount: number, currency: Currency, customExchangeRate?: number }) => {
    if (item.currency === 'USD') return item.amount;
    if (item.currency === 'EUR') return MoneyMath.multiply(item.amount, 1.08);
    const rate = item.customExchangeRate || rates.usd_bcv;
    return MoneyMath.convert(item.amount, rate);
  };

  const formatMoney = (amount: number, currency: string) => {
    if (currency === 'USD') return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (currency === 'EUR') return `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    return `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`;
  };

  const totalAssets = MoneyMath.sum(items.filter(i => i.type === 'asset').map(i => toUSD(i)));
  const totalSavings = MoneyMath.sum(items.filter(i => i.type === 'asset' && i.category === 'Savings').map(i => toUSD(i)));
  const liquidAssets = MoneyMath.subtract(totalAssets, totalSavings);

  const totalLiabilities = MoneyMath.sum(items.filter(i => i.type === 'liability').map(i => toUSD(i)));
  const monthlyExpenses = MoneyMath.sum(items.filter(i => i.type === 'liability' && i.isMonthly).map(i => toUSD(i)));

  const assetsValue = MoneyMath.subtract(totalAssets, totalLiabilities);
  const physicalValue = MoneyMath.sum(physicalAssets.map(i => toUSD({ amount: i.estimatedValue, currency: i.currency })));
  const totalPatrimony = MoneyMath.add(assetsValue, physicalValue);

  // CRUD Handlers with SAFE UUID
  const handleAddItem = async (newItem: Omit<FinancialItem, 'id'>) => {
    if (!session) return;
    const item: FinancialItem = { ...newItem, id: generateId(), user_id: session.user.id };
    setItems(prev => [...prev, item]);
    setAppSyncStatus('syncing');
    try { await dbItems.add(item); setAppSyncStatus('synced'); } catch { setAppSyncStatus('error'); setItems(prev => prev.filter(i => i.id !== item.id)); }
  };

  const handleUpdateItem = async (updatedItem: FinancialItem) => {
    setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    setEditingItem(null);
    setAppSyncStatus('syncing');
    try { await dbItems.update(updatedItem); setAppSyncStatus('synced'); } catch { setAppSyncStatus('error'); }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('¿Eliminar registro?')) {
      const oldItems = [...items];
      setItems(prev => prev.filter(i => i.id !== id));
      setAppSyncStatus('syncing');
      try { await dbItems.delete(id); setAppSyncStatus('synced'); } catch { setAppSyncStatus('error'); setItems(oldItems); }
    }
  };

  const handleImportItems = async (newItems: Omit<FinancialItem, 'id'>[]) => {
    if (!session) return;

    const itemsToAdd: FinancialItem[] = newItems.map(i => ({
      ...i,
      id: generateId(),
      user_id: session.user.id
    }));

    // Optimistic update
    setItems(prev => [...prev, ...itemsToAdd]);
    setShowUploadModal(false);
    setAppSyncStatus('syncing');

    try {
      await dbItems.addBulk(itemsToAdd);
      setAppSyncStatus('synced');
    } catch (e) {
      console.error("Bulk Import Error:", e);
      setAppSyncStatus('error');
      alert("Hubo un error guardando los datos. Verifica que todos los campos sean válidos.");
      loadUserData(session.user.id);
    }
  };

  const handleDebtSettlement = async (amount: number, method: string, details: any) => {
    if (!settlingDebtItem || !session) return;
    let newDebtAmount = Math.max(0, MoneyMath.subtract(settlingDebtItem.amount, amount));
    const updatedDebtItem = { ...settlingDebtItem, amount: newDebtAmount, note: details.note };

    const updatedItemsState = items.map(i => i.id === settlingDebtItem.id ? updatedDebtItem : i);
    setItems(updatedItemsState);

    setAppSyncStatus('syncing');
    try {
      await dbItems.update(updatedDebtItem);
      if (method === 'money' && details.accountId) {
        const account = items.find(i => i.id === details.accountId);
        if (account) {
          const updatedAccount = { ...account, amount: account.type === 'asset' ? MoneyMath.subtract(account.amount, amount) : MoneyMath.add(account.amount, amount) };
          setItems(prev => prev.map(i => i.id === account.id ? updatedAccount : i));
          await dbItems.update(updatedAccount);
        }
      } else if (method === 'asset_out' && details.assetId) {
        setPhysicalAssets(prev => prev.filter(a => a.id !== details.assetId));
        await dbAssets.delete(details.assetId);
      } else if (method === 'asset_in' && details.newAsset) {
        const newAsset: PhysicalAsset = { ...details.newAsset, id: generateId(), user_id: session.user.id };
        setPhysicalAssets(prev => [...prev, newAsset]);
        await dbAssets.add(newAsset);
      }
      setAppSyncStatus('synced');
    } catch { setAppSyncStatus('error'); }
    setShowDebtModal(false);
  };

  const handleAddToDirectory = async (entity: DirectoryEntity): Promise<DirectoryEntity | null> => {
    try {
      setAppSyncStatus('syncing');
      const created = await dbDirectory.add(entity);
      setDirectory(prev => [...prev, created]);
      setAppSyncStatus('synced');
      return created;
    } catch (e) {
      setAppSyncStatus('error');
      return null;
    }
  };

  const handleAddShoppingItem = async (newItem: any) => {
    if (!session) return;
    const item = { ...newItem, id: generateId(), hasReceipt: false, user_id: session.user.id };
    setShoppingHistory(prev => [item, ...prev]);
    try { await dbShopping.add(item); } catch (e) { console.error(e); }
  };

  const handleAddEvent = async (newItem: any) => { if (!session) return; const item = { ...newItem, id: generateId(), user_id: session.user.id }; setManualEvents(prev => [...prev, item]); try { await dbEvents.add(item); } catch (e) { console.error(e); } };
  const handleUpdateEvent = async (updatedItem: any) => { setManualEvents(prev => prev.map(e => e.id === updatedItem.id ? updatedItem : e)); setEditingEvent(null); try { await dbEvents.update(updatedItem); } catch (e) { console.error(e); } };
  const handleDeleteEvent = async (id: string) => { setManualEvents(prev => prev.filter(e => e.id !== id)); try { await dbEvents.delete(id); } catch (e) { console.error(e); } };
  const handleAddAsset = async (newItem: any) => { if (!session) return; const item = { ...newItem, id: generateId(), user_id: session.user.id }; setPhysicalAssets(prev => [...prev, item]); try { await dbAssets.add(item); } catch (e) { console.error(e); } };
  const handleUpdateAsset = async (updatedItem: any) => { setPhysicalAssets(prev => prev.map(a => a.id === updatedItem.id ? updatedItem : a)); setEditingAsset(null); try { await dbAssets.update(updatedItem); } catch (e) { console.error(e); } };
  const handleDeleteAsset = async (id: string) => { setPhysicalAssets(prev => prev.filter(a => a.id !== id)); try { await dbAssets.delete(id); } catch (e) { console.error(e); } };

  // Goals Handlers
  const handleAddGoal = async (newGoal: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at' | 'current_amount' | 'status'>) => {
    if (!session) return;
    setAppSyncStatus('syncing');
    try {
      const goalToAdd = { ...newGoal, current_amount: 0, status: 'active' as const };
      const addedGoal = await dbGoals.add(goalToAdd);
      setGoals(prev => [addedGoal, ...prev]);
      setAppSyncStatus('synced');
    } catch (e) {
      console.error("Error adding goal:", e);
      setAppSyncStatus('error');
    }
  };

  const handleUpdateGoal = async (updatedGoal: FinancialGoal) => {
    setAppSyncStatus('syncing');
    try {
      await dbGoals.update(updatedGoal);
      setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
      setEditingGoal(null);
      setAppSyncStatus('synced');
    } catch (e) {
      console.error("Error updating goal:", e);
      setAppSyncStatus('error');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (window.confirm('¿Eliminar esta meta?')) {
      setAppSyncStatus('syncing');
      try {
        await dbGoals.delete(id);
        setGoals(prev => prev.filter(g => g.id !== id));
        setAppSyncStatus('synced');
      } catch (e) {
        console.error("Error deleting goal:", e);
        setAppSyncStatus('error');
      }
    }
  };

  const handleAddContribution = async (goalId: string, amount: number) => {
    setAppSyncStatus('syncing');
    try {
      await dbGoals.addContribution(goalId, amount);
      const updatedGoal = await dbGoals.getById(goalId);
      if (updatedGoal) {
        setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
        if (updatedGoal.status === 'completed' && updatedGoal.completed_at) {
          setNotifications(prev => [{
            id: `goal-completed-${goalId}`,
            title: '🎉 ¡Meta Completada!',
            message: `Has alcanzado tu meta "${updatedGoal.name}". ¡Felicidades!`,
            type: 'success',
            date: 'Ahora',
            read: false
          }, ...prev]);
        }
      }
      setAppSyncStatus('synced');
    } catch (e) {
      console.error("Error adding contribution:", e);
      setAppSyncStatus('error');
    }
  };

  // Profile Handlers
  const handleSaveProfile = async (profile: UserFinancialProfile) => {
    setAppSyncStatus('syncing');
    try {
      const savedProfile = await dbProfile.saveProfile(profile);
      setFinancialProfile(savedProfile);
      setShowProfileForm(false);

      const newRecs = recommendationEngine.generateRecommendations(savedProfile, items, goals);
      await dbProfile.saveRecommendations(newRecs);

      const updatedRecs = await dbProfile.getRecommendations();
      setRecommendations(updatedRecs);

      setAppSyncStatus('synced');
      setNotifications(prev => [{
        id: `profile-updated-${Date.now()}`,
        title: 'Perfil Actualizado',
        message: 'Se han generado nuevas recomendaciones financieras para ti.',
        type: 'info',
        date: 'Ahora',
        read: false
      }, ...prev]);
    } catch (e) {
      console.error("Error saving profile:", e);
      setAppSyncStatus('error');
    }
  };

  const handleDismissRecommendation = async (id: string) => {
    try {
      await dbProfile.updateRecommendationStatus(id, 'dismissed');
      setRecommendations(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error("Error dismissing recommendation:", e);
    }
  };

  const handleLiquidation = async (salePrice: number, targetAccountId: string) => {
    if (!liquidatingAsset) return;
    const account = items.find(i => i.id === targetAccountId);
    if (account) {
      const updatedAccount = { ...account, amount: MoneyMath.add(account.amount, salePrice) };
      setItems(prev => prev.map(i => i.id === targetAccountId ? updatedAccount : i));
      try { await dbItems.update(updatedAccount); } catch (e) { console.error(e); }
    }
    setPhysicalAssets(prev => prev.filter(a => a.id !== liquidatingAsset.id));
    try { await dbAssets.delete(liquidatingAsset.id); } catch (e) { console.error(e); }
    setShowLiquidationModal(false);
    setLiquidatingAsset(null);
  };

  const renderList = (type: 'asset' | 'liability') => (
    <Card className="overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200">
          <tr><th className="p-3">Concepto / Entidad</th><th className="p-3 text-right">Monto</th><th className="p-3 text-center">Acciones</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {items.filter(i => i.type === type).map(item => (
            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="p-3 font-medium text-gray-900 dark:text-white">
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-1 rounded">{item.category}</span>
                    {item.target_date && (
                      <span className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-1 rounded flex items-center gap-0.5">
                        <Clock size={8} /> {item.target_date}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="p-3 text-right">
                <div className="font-mono font-bold text-gray-800 dark:text-gray-200">{formatMoney(item.amount, item.currency)}</div>
                <div className="text-[10px] text-gray-400">~${toUSD(item).toFixed(2)}</div>
              </td>
              <td className="p-3 flex justify-end gap-1">
                {(item.category === 'Debt' || item.category === 'Receivable') && (
                  <Button size="sm" variant="secondary" className="px-2" onClick={() => { setSettlingDebtItem(item); setShowDebtModal(true); }} icon={<TrendingUp size={14} />} />
                )}
                <Button size="sm" variant="ghost" className="px-2" onClick={() => { setEditingItem(item); setShowAddModal(true); }} icon={<Edit size={14} />} />
                <Button size="sm" variant="ghost" className="px-2 hover:text-red-500" onClick={() => handleDeleteItem(item.id)} icon={<Trash2 size={14} />} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );

  const hasSkippedAuth = localStorage.getItem('skipAuth') === 'true';

  if (!session && !hasSkippedAuth) return <AuthModal darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />;

  if (isLoading) return <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center"><RefreshCw className="animate-spin text-blue-600 mb-4" size={48} /><p className="text-gray-600 dark:text-gray-300">Cargando...</p></div>;

  return (
    <>
      <MainLayout
        header={<Header darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} rates={rates} setRates={handleRateUpdate} syncStatus={syncStatus} onRefresh={() => loadUserData(session.user.id)} userProfile={userProfile} onOpenProfile={() => setShowProfileModal(true)} onOpenTutorial={() => setShowTutorial(true)} onOpenNotifications={() => setShowNotifications(!showNotifications)} unreadCount={notifications.filter(n => !n.read).length} onForceRefresh={handleForceRatesUpdate} isRefreshing={isRatesUpdating} />}
        summary={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Liquidez (Disp.)" value={`$${liquidAssets.toFixed(2)}`} subtext="Bancos y Efectivo" colorBorder="border-green-500" valueType="positive" numericValue={liquidAssets} />
            <StatCard label="Ahorros" value={`$${totalSavings.toFixed(2)}`} subtext="Fondos y Metas" colorBorder="border-blue-500" icon={<TrendingUp size={24} />} valueType="positive" numericValue={totalSavings} />
            <StatCard label="Patrimonio Neto" value={`$${totalPatrimony.toFixed(2)}`} subtext="Balance Total" colorBorder="border-emerald-700" valueType="positive" numericValue={totalPatrimony} />
            <StatCard label="Total Deudas" value={`$${totalLiabilities.toFixed(2)}`} subtext="Por pagar" colorBorder="border-red-500" valueType="debt" numericValue={totalLiabilities} />
            <StatCard label="Gasto Fijo" value={`$${monthlyExpenses.toFixed(2)}`} subtext="Mensual" colorBorder="border-yellow-500" icon={<Calendar size={24} />} valueType="expense" numericValue={monthlyExpenses} />
          </div>
        }
        navigation={
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {[
              { id: 'dashboard', label: 'Resumen' },
              { id: 'assets', label: 'Tengo / Me Deben' },
              { id: 'liabilities', label: 'Debo / Gastos' },
              { id: 'goals', label: '🎯 Metas' },
              { id: 'inventory', label: 'Inventario' },
              { id: 'advisor', label: 'Plan Financiero' }
            ].map(tab => (
              <Button key={tab.id} size="sm" variant={activeTab === tab.id ? 'primary' : 'secondary'} onClick={() => setActiveTab(tab.id as any)} className="h-8 px-3 text-xs">{tab.label}</Button>
            ))}
            <Button variant="secondary" size="sm" onClick={() => setShowShoppingModal(true)} icon={<ShoppingBag size={14} />} className="whitespace-nowrap bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 h-8 px-3 text-xs">Gastos Hormiga</Button>
            <Button size="sm" onClick={() => { setEditingItem(null); setShowAddModal(true); }} icon={<Plus size={16} />} className="bg-blue-600 text-white shadow-md hover:bg-blue-700 whitespace-nowrap h-8 px-3 text-xs">+ Agregar</Button>
          </div>
        }
        mainContent={
          <>
            {activeTab === 'dashboard' && (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button variant="secondary" size="sm" onClick={() => setShowDistributionChart(!showDistributionChart)} icon={showDistributionChart ? <ChevronUp size={14} /> : <PieChart size={14} />} className="whitespace-nowrap bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 h-8 px-3 text-xs">
                    {showDistributionChart ? 'Ocultar' : 'Ver'} Distribución
                  </Button>
                  <div className="relative">
                    <Button variant="secondary" size="sm" onClick={() => setShowReportsMenu(!showReportsMenu)} icon={<Download size={14} />} className="whitespace-nowrap bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 h-8 px-3 text-xs">Reportes</Button>
                    {showReportsMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowReportsMenu(false)}></div>
                        <div className="absolute right-0 mt-1 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-600/50 rounded-lg shadow-2xl z-50 min-w-[200px]">
                          <button onClick={() => { setShowUploadModal(true); setShowReportsMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-amber-400 transition-colors flex items-center gap-2 rounded-t-lg"><UploadCloud size={14} /> Subir Reporte</button>
                          <button onClick={() => { exportToExcel(items, physicalAssets, shoppingHistory); setShowReportsMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-amber-400 transition-colors flex items-center gap-2 rounded-b-lg"><Download size={14} /> Descargar Reporte</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <Dashboard items={items} exchangeRate={rates.usd_bcv} toUSD={toUSD} formatMoney={formatMoney} onSettleDebt={(item) => { setSettlingDebtItem(item); setShowDebtModal(true); }} onOpenShopping={() => setShowShoppingModal(true)} showChart={showDistributionChart} />
              </>
            )}
            {activeTab === 'assets' && renderList('asset')}
            {activeTab === 'liabilities' && renderList('liability')}
            {activeTab === 'goals' && (
              <GoalsManager goals={goals} formatMoney={formatMoney} onAddGoal={() => { setEditingGoal(null); setShowGoalForm(true); }} onEditGoal={(goal) => { setEditingGoal(goal); setShowGoalForm(true); }} onDeleteGoal={handleDeleteGoal} onAddContribution={(goal) => { setContributingGoal(goal); setShowContributionModal(true); }} calculateProgress={dbGoals.calculateProgress} getDaysRemaining={dbGoals.getDaysRemaining} />
            )}
            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center"><p className="text-sm text-gray-500 dark:text-gray-400">Objetos físicos</p><Button size="sm" onClick={() => { setEditingAsset(null); setShowAssetModal(true); }} icon={<Plus size={16} />}>Agregar</Button></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {physicalAssets.map(a => (
                    <Card key={a.id} className="p-4 flex flex-col justify-between border-l-4 border-emerald-500">
                      <div className="flex justify-between items-start mb-2"><div><h4 className="font-bold text-amber-300 flex items-center gap-2"><Box size={16} className="text-amber-400" /> {a.name}</h4><p className="text-xs text-slate-400">{a.description || 'Sin descripción'}</p></div><span className="font-mono font-bold text-amber-400">{formatMoney(a.estimatedValue, a.currency)}</span></div>
                      <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-600"><Button size="sm" variant="ghost" className="text-xs px-2" onClick={() => { setLiquidatingAsset(a); setShowLiquidationModal(true); }}>Liquidar</Button><Button size="sm" variant="ghost" className="text-xs px-2" onClick={() => { setEditingAsset(a); setShowAssetModal(true); }} icon={<Edit size={14} />} /> <Button size="sm" variant="ghost" className="text-xs px-2 hover:text-red-500" onClick={() => handleDeleteAsset(a.id)} icon={<Trash2 size={14} />} /></div>
                    </Card>
                  ))}
                  {physicalAssets.length === 0 && <div className="col-span-full py-8 text-center text-slate-400 border-2 border-dashed border-slate-600 rounded-xl">No tienes inventario registrado.</div>}
                </div>
              </div>
            )}
            {activeTab === 'advisor' && (
              financialProfile ? (
                <FinancialPlanDashboard profile={financialProfile} recommendations={recommendations} budgetDistribution={recommendationEngine.calculateBudgetDistribution(financialProfile)} onEditProfile={() => setShowProfileForm(true)} onDismissRecommendation={handleDismissRecommendation} />
              ) : (
                <Card className="p-8 text-center max-w-2xl mx-auto mt-8">
                  <div className="flex justify-center mb-4"><div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full"><TrendingUp size={48} className="text-blue-600 dark:text-blue-400" /></div></div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Descubre tu Plan Financiero Ideal</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Completa tu perfil financiero en unos minutos y obtén recomendaciones personalizadas sobre ahorro, inversión y presupuesto basadas en tu edad, metas y estilo de vida.</p>
                  <Button onClick={() => setShowProfileForm(true)} className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg">Crear mi Perfil Financiero</Button>
                </Card>
              )
            )}
          </>
        }
        sidebar={
          <>
            <DirectoryWidget directory={directory} items={items} toUSD={toUSD} />
            <AgendaWidget events={allEvents} onAddEvent={() => { setEditingEvent(null); setShowEventModal(true); }} onEditEvent={(e) => { setEditingEvent(e); setShowEventModal(true); }} />
          </>
        }
        floatingAction={<button onClick={() => { setEditingItem(null); setShowAddModal(true); }} className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-40"><Plus size={28} /></button>}
      />
      {showAddModal && <ItemForm onAdd={handleAddItem} onEdit={handleUpdateItem} initialData={editingItem || undefined} directory={directory} onAddToDirectory={handleAddToDirectory} onClose={() => setShowAddModal(false)} />}
      {showEventModal && <EventForm onAdd={handleAddEvent} onEdit={handleUpdateEvent} onDelete={handleDeleteEvent} initialData={editingEvent || undefined} onClose={() => setShowEventModal(false)} />}
      {showAssetModal && <PhysicalAssetForm onAdd={handleAddAsset} onEdit={handleUpdateAsset} onDelete={handleDeleteAsset} initialData={editingAsset || undefined} onClose={() => setShowAssetModal(false)} />}
      {showDebtModal && settlingDebtItem && <DebtSettlementModal item={settlingDebtItem} liquidAccounts={items.filter(i => i.type === 'asset')} inventory={physicalAssets} onConfirm={handleDebtSettlement} onClose={() => setShowDebtModal(false)} />}
      {showLiquidationModal && liquidatingAsset && <LiquidationModal asset={liquidatingAsset} accounts={items.filter(i => i.type === 'asset')} onConfirm={handleLiquidation} onClose={() => setShowLiquidationModal(false)} />}
      {showUploadModal && <ReportUploadModal onConfirm={handleImportItems} onClose={() => setShowUploadModal(false)} />}
      {showProfileModal && userProfile && <ProfileModal user={userProfile} onUpdate={setUserProfile} onClose={() => setShowProfileModal(false)} />}
      {showShoppingModal && <ShoppingHistoryModal history={shoppingHistory} onAddItem={handleAddShoppingItem} onClose={() => setShowShoppingModal(false)} />}
      {showGoalForm && <GoalForm onAdd={handleAddGoal} onEdit={handleUpdateGoal} initialData={editingGoal || undefined} onClose={() => { setShowGoalForm(false); setEditingGoal(null); }} />}
      {showContributionModal && contributingGoal && <ContributionModal goal={contributingGoal} onConfirm={handleAddContribution} onClose={() => { setShowContributionModal(false); setContributingGoal(null); }} formatMoney={formatMoney} />}
      {showProfileForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8">
            <FinancialProfileForm initialData={financialProfile || undefined} onSave={handleSaveProfile} onCancel={() => setShowProfileForm(false)} />
          </div>
        </div>
      )}
      {showTutorial && <Tutorial onComplete={() => { setShowTutorial(false); localStorage.setItem('hasSeenTutorial', 'true'); }} />}
      {showNotifications && <NotificationsPanel notifications={notifications} onClose={() => setShowNotifications(false)} onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))} onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} />}
    </>
  );
}

export default App;
