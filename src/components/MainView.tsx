import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FinancialItem, SpecialEvent, Currency, PhysicalAsset, UserProfile, FinancialGoal } from '../types';
import { Dashboard } from './organisms/Dashboard';
import { ItemForm } from './organisms/forms/ItemForm';
import { EventForm } from './organisms/forms/EventForm';
import { PhysicalAssetForm } from './organisms/forms/PhysicalAssetForm';
import { LiquidationModal } from './organisms/modals/LiquidationModal';
import { DebtSettlementModal } from './organisms/modals/DebtSettlementModal';
import { ReportUploadModal } from './organisms/modals/ReportUploadModal';
import { ProfileModal } from './organisms/modals/ProfileModal';
import { ShoppingHistoryModal } from './organisms/modals/ShoppingHistoryModal';
import { Header } from './organisms/Header';
import { MainLayout } from './templates/MainLayout';
import { StatCard } from './molecules/StatCard';
import { AgendaWidget } from './molecules/AgendaWidget';
import { DirectoryWidget } from './organisms/DirectoryWidget';
import { Button } from './atoms/Button';
import { Card } from './atoms/Card';
import { exportToExcel } from '../services/exportService';
import { Tutorial } from './Tutorial';
import { NotificationsPanel } from './NotificationsPanel';
import { Notification } from '../types/notification';
import { GoalsManager } from './organisms/GoalsManager';
import { GoalForm } from './organisms/forms/GoalForm';
import { ContributionModal } from './organisms/modals/ContributionModal';
import { FinancialProfileForm } from './organisms/forms/FinancialProfileForm';
import { FinancialPlanDashboard } from './organisms/FinancialPlanDashboard';
import { TransactionHistory } from './organisms/TransactionHistory';

// Context
import { useFinancialData } from '../context/FinancialContext';

// Hooks & Utils
import { useExchangeRates } from '../hooks/useExchangeRates';
import { useNotifications } from '../hooks/useNotifications';
import { MoneyMath } from '../utils/moneyMath';
import { formatMoney } from '../utils/formatters';
import { FinancialItemList } from './organisms/FinancialItemList';
import { dbGoals, recommendationEngine } from '../services/db';

import {
  Calendar, Plus, Trash2, Edit, Box, TrendingUp, RefreshCw, UploadCloud, Download, ShoppingBag, PieChart, ChevronUp
} from 'lucide-react';

interface MainViewProps {
  session: any;
  userProfile: UserProfile | null;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onLogout: () => void;
}

export const MainView: React.FC<MainViewProps> = ({ session, userProfile, darkMode, setDarkMode, onLogout }) => {
  // Context Data
  const {
    items, physicalAssets, manualEvents, shoppingHistory, directory, goals, financialProfile, recommendations,
    addItem, updateItem, deleteItem, importItems,
    addAsset, updateAsset, deleteAsset,
    addEvent, updateEvent, deleteEvent,
    addShoppingItem, addDirectoryEntity,
    addGoal, updateGoal, deleteGoal, addGoalContribution,
    saveProfile, dismissRecommendation, refreshData,
    syncStatus: contextSyncStatus
  } = useFinancialData();

  // Local UI State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'liabilities' | 'inventory' | 'goals' | 'advisor' | 'history'>('dashboard');

  // Modal States
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
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showDistributionChart, setShowDistributionChart] = useState(false);
  const [showReportsMenu, setShowReportsMenu] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  // Edit/Action States
  const [editingItem, setEditingItem] = useState<FinancialItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<SpecialEvent | null>(null);
  const [editingAsset, setEditingAsset] = useState<PhysicalAsset | null>(null);
  const [liquidatingAsset, setLiquidatingAsset] = useState<PhysicalAsset | null>(null);
  const [settlingDebtItem, setSettlingDebtItem] = useState<FinancialItem | null>(null);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<FinancialGoal | null>(null);

  // Event Logic (Moved up because useNotifications depends on it)
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

  // Notifications Hook
  const { notifications, addNotification, markAsRead, markAllAsRead } = useNotifications(allEvents);

  // Exchange Rates Hook (Now has access to addNotification)
  const {
    rates,
    handleRateUpdate,
    forceUpdate: handleForceRatesUpdate,
    isUpdating: isRatesUpdating,
    syncStatus: ratesSyncStatus
  } = useExchangeRates(addNotification);

  // Combined Sync Status
  const syncStatus = contextSyncStatus === 'syncing' || ratesSyncStatus === 'syncing' ? 'syncing' :
    contextSyncStatus === 'error' || ratesSyncStatus === 'error' ? 'error' : 'synced';

  // Derived Values
  const toUSD = (item: { amount: number, currency: Currency, customExchangeRate?: number }) => {
    if (item.currency === 'USD') return item.amount;
    if (item.currency === 'EUR') return MoneyMath.multiply(item.amount, 1.08);
    const rate = item.customExchangeRate || rates.usd_bcv;
    return MoneyMath.convert(item.amount, rate);
  };

  const totalAssets = MoneyMath.sum(items.filter(i => i.type === 'asset').map(i => toUSD(i)));
  const totalSavings = MoneyMath.sum(items.filter(i => i.type === 'asset' && i.category === 'Savings').map(i => toUSD(i)));
  const liquidAssets = MoneyMath.subtract(totalAssets, totalSavings);
  const totalLiabilities = MoneyMath.sum(items.filter(i => i.type === 'liability').map(i => toUSD(i)));
  const monthlyExpenses = MoneyMath.sum(items.filter(i => i.type === 'liability' && i.isMonthly).map(i => toUSD(i)));
  const assetsValue = MoneyMath.subtract(totalAssets, totalLiabilities);
  const physicalValue = MoneyMath.sum(physicalAssets.map(i => toUSD({ amount: i.estimatedValue, currency: i.currency })));
  const totalPatrimony = MoneyMath.add(assetsValue, physicalValue);

  // Effects
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) setShowTutorial(true);
  }, []);

  // Complex Logic Wrappers
  const handleLiquidation = async (salePrice: number, targetAccountId: string) => {
    if (!liquidatingAsset) return;
    const account = items.find(i => i.id === targetAccountId);
    if (account) {
      const updatedAccount = { ...account, amount: MoneyMath.add(account.amount, salePrice) };
      await updateItem(updatedAccount);
    }
    await deleteAsset(liquidatingAsset.id);
    setShowLiquidationModal(false);
    setLiquidatingAsset(null);
  };

  const handleDebtSettlementWrapper = async (amount: number, method: string, details: any) => {
    if (!settlingDebtItem) return;
    let newDebtAmount = Math.max(0, MoneyMath.subtract(settlingDebtItem.amount, amount));
    const updatedDebtItem = { ...settlingDebtItem, amount: newDebtAmount, note: details.note };

    await updateItem(updatedDebtItem);

    if (method === 'money' && details.accountId) {
      const account = items.find(i => i.id === details.accountId);
      if (account) {
        const updatedAccount = { ...account, amount: account.type === 'asset' ? MoneyMath.subtract(account.amount, amount) : MoneyMath.add(account.amount, amount) };
        await updateItem(updatedAccount);
      }
    } else if (method === 'asset_out' && details.assetId) {
      await deleteAsset(details.assetId);
    } else if (method === 'asset_in' && details.newAsset) {
      await addAsset(details.newAsset);
    } else if (method === 'delete_debt') {
      // No additional action needed, just the debt update above handles the "record" in history implicitly by the item update
      // We might want to ensure 'note' is preserved which is handled in updatedDebtItem
    }
    setShowDebtModal(false);
  };

  const onProfileSave = async (profile: UserFinancialProfile) => {
    await saveProfile(profile);
    setShowProfileForm(false);
    addNotification({
      id: `profile-updated-${Date.now()}`,
      title: 'Perfil Actualizado',
      message: 'Se han generado nuevas recomendaciones financieras para ti.',
      type: 'info',
      date: 'Ahora',
      read: false
    });
  };

  return (
    <>
      <MainLayout
        header={<Header darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} rates={rates} setRates={handleRateUpdate} syncStatus={syncStatus} onRefresh={refreshData} userProfile={userProfile} onOpenProfile={() => setShowProfileModal(true)} onOpenTutorial={() => setShowTutorial(true)} onOpenNotifications={() => setShowNotifications(!showNotifications)} unreadCount={notifications.filter(n => !n.read).length} onForceRefresh={handleForceRatesUpdate} isRefreshing={isRatesUpdating} />}
        summary={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 summary-cards">
            <StatCard label="Liquidez (Disp.)" value={`$${liquidAssets.toFixed(2)}`} subtext="Bancos y Efectivo" colorBorder="border-green-500" valueType="positive" numericValue={liquidAssets} />
            <StatCard label="Ahorros" value={`$${totalSavings.toFixed(2)}`} subtext="Fondos y Metas" colorBorder="border-blue-500" icon={<TrendingUp size={24} />} valueType="positive" numericValue={totalSavings} />
            <StatCard label="Patrimonio Neto" value={`$${totalPatrimony.toFixed(2)}`} subtext="Balance Total" colorBorder="border-emerald-700" valueType="positive" numericValue={totalPatrimony} />
            <StatCard label="Total Deudas" value={`$${totalLiabilities.toFixed(2)}`} subtext="Por pagar" colorBorder="border-red-500" valueType="debt" numericValue={totalLiabilities} />
            <StatCard label="Gasto Fijo" value={`$${monthlyExpenses.toFixed(2)}`} subtext="Mensual" colorBorder="border-yellow-500" icon={<Calendar size={24} />} valueType="expense" numericValue={monthlyExpenses} />
          </div>
        }
        navigation={
          <div className="flex justify-start mb-6">
            <div className="flex items-center bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 max-w-full overflow-hidden">

              <nav className="flex items-center gap-1 mr-2 overflow-x-auto no-scrollbar">
                {[
                  { id: 'dashboard', label: 'Resumen' },
                  { id: 'assets', label: 'Tengo/Me Deben' },
                  { id: 'liabilities', label: 'Gasto/Deuda' },
                  { id: 'goals', label: 'Metas' },
                  { id: 'inventory', label: 'Inventario' },
                  { id: 'advisor', label: 'Asesor' },
                  { id: 'history', label: 'Historial' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 flex-shrink-0"></div>

              <div className="flex items-center gap-2 pl-2 flex-shrink-0">
                <button
                  onClick={() => setShowShoppingModal(true)}
                  className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 border border-orange-200 dark:border-orange-500/20 transition-all flex items-center justify-center"
                  title="Gasto Hormiga"
                >
                  <ShoppingBag size={16} />
                </button>

                <button
                  onClick={() => { setEditingItem({ type: 'asset', category: 'Income' } as any); setShowAddModal(true); }}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-emerald-500 dark:hover:bg-emerald-500 text-emerald-600 dark:text-emerald-500 hover:text-white dark:hover:text-white transition-all group"
                  title="Registrar Ingreso (Tengo)"
                >
                  <TrendingUp size={16} className="group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={() => { setEditingItem({ type: 'asset', category: 'Receivable' } as any); setShowAddModal(true); }}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-blue-500 dark:hover:bg-blue-500 text-blue-600 dark:text-blue-500 hover:text-white dark:hover:text-white transition-all group"
                  title="Registrar Cuenta por Cobrar"
                >
                  <Plus size={16} className="group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={() => { setEditingItem({ type: 'liability', category: 'Expense' } as any); setShowAddModal(true); }}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-red-500 dark:hover:bg-red-500 text-red-600 dark:text-red-500 hover:text-white dark:hover:text-white transition-all group"
                  title="Registrar Gasto"
                >
                  <span className="text-lg font-bold leading-none group-hover:scale-110 transition-transform">-</span>
                </button>

                <button
                  onClick={() => { setEditingItem({ type: 'asset', category: 'Savings' } as any); setShowAddModal(true); }}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-indigo-500 dark:hover:bg-indigo-500 text-indigo-600 dark:text-indigo-500 hover:text-white dark:hover:text-white transition-all group"
                  title="Registrar Ahorro"
                >
                  <Box size={16} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
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
            {activeTab === 'assets' && (
              <FinancialItemList
                items={items}
                type="asset"
                toUSD={toUSD}
                onSettlingDebt={(item) => { setSettlingDebtItem(item); setShowDebtModal(true); }}
                onEdit={(item) => { setEditingItem(item); setShowAddModal(true); }}
                onDelete={deleteItem}
              />
            )}
            {activeTab === 'liabilities' && (
              <FinancialItemList
                items={items}
                type="liability"
                toUSD={toUSD}
                onSettlingDebt={(item) => { setSettlingDebtItem(item); setShowDebtModal(true); }}
                onEdit={(item) => { setEditingItem(item); setShowAddModal(true); }}
                onDelete={deleteItem}
              />
            )}
            {activeTab === 'goals' && (
              <GoalsManager goals={goals} formatMoney={formatMoney} onAddGoal={() => { setEditingGoal(null); setShowGoalForm(true); }} onEditGoal={(goal) => { setEditingGoal(goal); setShowGoalForm(true); }} onDeleteGoal={deleteGoal} onAddContribution={(goal) => { setContributingGoal(goal); setShowContributionModal(true); }} calculateProgress={dbGoals.calculateProgress} getDaysRemaining={dbGoals.getDaysRemaining} />
            )}
            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center"><p className="text-sm text-gray-500 dark:text-gray-400">Objetos físicos</p><Button size="sm" onClick={() => { setEditingAsset(null); setShowAssetModal(true); }} icon={<Plus size={16} />}>Agregar</Button></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {physicalAssets.map(a => (
                    <Card key={a.id} className="p-4 flex flex-col justify-between border-l-4 border-emerald-500">
                      <div className="flex justify-between items-start mb-2"><div><h4 className="font-bold text-amber-300 flex items-center gap-2"><Box size={16} className="text-amber-400" /> {a.name}</h4><p className="text-xs text-slate-400">{a.description || 'Sin descripción'}</p></div><span className="font-mono font-bold text-amber-400">{formatMoney(a.estimatedValue, a.currency)}</span></div>
                      <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-600"><Button size="sm" variant="ghost" className="text-xs px-2" onClick={() => { setLiquidatingAsset(a); setShowLiquidationModal(true); }}>Liquidar</Button><Button size="sm" variant="ghost" className="text-xs px-2" onClick={() => { setEditingAsset(a); setShowAssetModal(true); }} icon={<Edit size={14} />} /> <Button size="sm" variant="ghost" className="text-xs px-2 hover:text-red-500" onClick={() => deleteAsset(a.id)} icon={<Trash2 size={14} />} /></div>
                    </Card>
                  ))}
                  {physicalAssets.length === 0 && <div className="col-span-full py-8 text-center text-slate-400 border-2 border-dashed border-slate-600 rounded-xl">No tienes inventario registrado.</div>}
                </div>
              </div>
            )}
            {activeTab === 'advisor' && (
              financialProfile ? (
                <FinancialPlanDashboard profile={financialProfile} recommendations={recommendations} budgetDistribution={recommendationEngine.calculateBudgetDistribution(financialProfile)} onEditProfile={() => setShowProfileForm(true)} onDismissRecommendation={dismissRecommendation} />
              ) : (
                <Card className="p-8 text-center max-w-2xl mx-auto mt-8">
                  <div className="flex justify-center mb-4"><div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full"><TrendingUp size={48} className="text-blue-600 dark:text-blue-400" /></div></div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Descubre tu Plan Financiero Ideal</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Completa tu perfil financiero en unos minutos y obtén recomendaciones personalizadas sobre ahorro, inversión y presupuesto basadas en tu edad, metas y estilo de vida.</p>
                  <Button onClick={() => setShowProfileForm(true)} className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg">Crear mi Perfil Financiero</Button>
                </Card>
              )
            )}
            {activeTab === 'history' && <TransactionHistory formatMoney={formatMoney} />}

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
      {showAddModal && <ItemForm onAdd={(i) => { addItem(i); setShowAddModal(false); }} onEdit={(i) => { updateItem(i); setShowAddModal(false); setEditingItem(null); }} initialData={editingItem || undefined} directory={directory} onAddToDirectory={addDirectoryEntity} onClose={() => setShowAddModal(false)} />}
      {showEventModal && <EventForm onAdd={(e) => { addEvent(e); setShowEventModal(false); }} onEdit={(e) => { updateEvent(e); setShowEventModal(false); setEditingEvent(null); }} onDelete={(id) => { deleteEvent(id); setShowEventModal(false); }} initialData={editingEvent || undefined} onClose={() => setShowEventModal(false)} />}
      {showAssetModal && <PhysicalAssetForm onAdd={(a) => { addAsset(a); setShowAssetModal(false); }} onEdit={(a) => { updateAsset(a); setShowAssetModal(false); setEditingAsset(null); }} onDelete={(id) => { deleteAsset(id); setShowAssetModal(false); }} initialData={editingAsset || undefined} onClose={() => setShowAssetModal(false)} />}
      {showDebtModal && settlingDebtItem && <DebtSettlementModal item={settlingDebtItem} liquidAccounts={items.filter(i => i.type === 'asset')} inventory={physicalAssets} onConfirm={handleDebtSettlementWrapper} onClose={() => setShowDebtModal(false)} />}
      {showLiquidationModal && liquidatingAsset && <LiquidationModal asset={liquidatingAsset} accounts={items.filter(i => i.type === 'asset')} onConfirm={handleLiquidation} onClose={() => setShowLiquidationModal(false)} />}
      {showUploadModal && <ReportUploadModal onConfirm={(items) => { importItems(items); setShowUploadModal(false); }} onClose={() => setShowUploadModal(false)} />}
      {showShoppingModal && <ShoppingHistoryModal history={shoppingHistory} onAddItem={(i) => { addShoppingItem(i); }} onClose={() => setShowShoppingModal(false)} />}
      {showGoalForm && <GoalForm onAdd={(g) => { addGoal(g); setShowGoalForm(false); }} onEdit={(g) => { updateGoal(g); setShowGoalForm(false); setEditingGoal(null); }} initialData={editingGoal || undefined} onClose={() => { setShowGoalForm(false); setEditingGoal(null); }} />}
      {showContributionModal && contributingGoal && <ContributionModal goal={contributingGoal} onConfirm={(gId, amount) => { addGoalContribution(gId, amount); setShowContributionModal(false); }} onClose={() => { setShowContributionModal(false); setContributingGoal(null); }} formatMoney={formatMoney} />}
      {showProfileForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8">
            <FinancialProfileForm initialData={financialProfile || undefined} onSave={onProfileSave} onCancel={() => setShowProfileForm(false)} />
          </div>
        </div>
      )}
      {showProfileModal && userProfile && <ProfileModal user={userProfile} onUpdate={() => { }} onClose={() => setShowProfileModal(false)} />}
      {showTutorial && <Tutorial onComplete={() => { setShowTutorial(false); localStorage.setItem('hasSeenTutorial', 'true'); }} />}
      {showNotifications && <NotificationsPanel notifications={notifications} onClose={() => setShowNotifications(false)} onMarkAsRead={markAsRead} onMarkAllAsRead={markAllAsRead} />}
    </>
  );
};
