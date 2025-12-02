
import React, { useState, useEffect, useMemo } from 'react';
import { FinancialItem, SpecialEvent, Currency, ShoppingItem, ExchangeRates, PhysicalAsset, UserProfile, DirectoryEntity } from './types';
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

// DB Services
import { dbItems, dbAssets, dbEvents, dbShopping, dbRates, dbDirectory } from './services/db';
import { supabase } from './supabaseClient';

import { 
  Calendar, Plus, Trash2, Edit, Box, TrendingUp, RefreshCw, UploadCloud, Download, Clock, Settings
} from 'lucide-react';

const INITIAL_RATES: ExchangeRates = {
  usd_bcv: 45.50, eur_bcv: 49.20, usd_binance: 47.10, lastUpdated: new Date().toISOString()
};

// Robust ID Generator (Fallback for non-secure contexts)
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

function App() {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [items, setItems] = useState<FinancialItem[]>([]);
  const [physicalAssets, setPhysicalAssets] = useState<PhysicalAsset[]>([]);
  const [rates, setRates] = useState<ExchangeRates>(INITIAL_RATES);
  const [manualEvents, setManualEvents] = useState<SpecialEvent[]>([]);
  const [shoppingHistory, setShoppingHistory] = useState<ShoppingItem[]>([]);
  const [directory, setDirectory] = useState<DirectoryEntity[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'liabilities' | 'inventory' | 'advisor'>('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showLiquidationModal, setShowLiquidationModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  
  const [editingItem, setEditingItem] = useState<FinancialItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<SpecialEvent | null>(null);
  const [editingAsset, setEditingAsset] = useState<PhysicalAsset | null>(null);
  const [liquidatingAsset, setLiquidatingAsset] = useState<PhysicalAsset | null>(null);
  const [settlingDebtItem, setSettlingDebtItem] = useState<FinancialItem | null>(null);

  // Auth & Data Load Effect
  useEffect(() => {
    // 1. Initial Load (Page Refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUserData(session.user.id);
      }
    });

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (event === 'SIGNED_OUT') {
        // Clear local data immediately
        setItems([]); 
        setPhysicalAssets([]); 
        setManualEvents([]); 
        setShoppingHistory([]); 
        setDirectory([]);
        setUserProfile(null);
        setActiveTab('dashboard');
      } else if (event === 'SIGNED_IN') {
        // Only load data on explicit sign-in action (not on tab focus/token refresh)
        if (session) {
           loadUserData(session.user.id);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
      setIsLoading(true);
      setSyncStatus('syncing');
      
      try {
        // 1. Load Profile (Safe)
        try {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (profile) setUserProfile(profile);
            else {
                const { data: { user } } = await supabase.auth.getUser();
                if(user) setUserProfile({ id: user.id, email: user.email || '', full_name: user.user_metadata?.full_name || '' });
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
        try {
            const fetchedRates = await dbRates.get();
            if (fetchedRates) setRates(fetchedRates);
        } catch (e) { console.warn("Could not load global rates", e); }

        try {
            const fetchedDirectory = await dbDirectory.getAll();
            setDirectory(fetchedDirectory);
        } catch (e) { console.warn("Could not load directory. Table might be missing.", e); }
        
        setSyncStatus('synced');
      } catch (e) {
        console.error("Critical Load Error", e);
        setSyncStatus('error');
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const handleRateUpdate = async (newRates: ExchangeRates) => {
    setRates(newRates);
    setSyncStatus('syncing');
    try { 
        await dbRates.update(newRates); 
        setSyncStatus('synced'); 
    } catch (e) { 
        console.warn("Rate update failed on server", e);
        setSyncStatus('synced'); 
    }
  };

  const allEvents = useMemo(() => {
    const recurring = items
      .filter(i => i.isMonthly && i.dayOfMonth)
      .map(i => {
        // Safe string conversion for date padding
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
    return [...manualEvents, ...recurring].sort((a,b) => (a.date || '').localeCompare(b.date || ''));
  }, [items, manualEvents]);

  const toUSD = (item: { amount: number, currency: Currency, customExchangeRate?: number }) => {
    if (item.currency === 'USD') return item.amount;
    if (item.currency === 'EUR') return item.amount * 1.08;
    const rate = item.customExchangeRate || rates.usd_bcv;
    return rate > 0 ? item.amount / rate : 0;
  };

  const formatMoney = (amount: number, currency: string) => {
    if (currency === 'USD') return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (currency === 'EUR') return `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    return `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`;
  };

  const totalAssets = items.filter(i => i.type === 'asset').reduce((acc, i) => acc + toUSD(i), 0);
  const totalLiabilities = items.filter(i => i.type === 'liability').reduce((acc, i) => acc + toUSD(i), 0);
  const monthlyExpenses = items.filter(i => i.type === 'liability' && i.isMonthly).reduce((acc, i) => acc + toUSD(i), 0);
  const totalPatrimony = (totalAssets - totalLiabilities) + physicalAssets.reduce((acc, i) => acc + toUSD({amount: i.estimatedValue, currency: i.currency}), 0);

  // CRUD Handlers with SAFE UUID
  const handleAddItem = async (newItem: Omit<FinancialItem, 'id'>) => {
    if(!session) return;
    const item: FinancialItem = { ...newItem, id: generateId(), user_id: session.user.id };
    setItems(prev => [...prev, item]);
    setSyncStatus('syncing');
    try { await dbItems.add(item); setSyncStatus('synced'); } catch { setSyncStatus('error'); setItems(prev => prev.filter(i => i.id !== item.id)); }
  };

  const handleUpdateItem = async (updatedItem: FinancialItem) => {
    setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    setEditingItem(null);
    setSyncStatus('syncing');
    try { await dbItems.update(updatedItem); setSyncStatus('synced'); } catch { setSyncStatus('error'); }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('¿Eliminar registro?')) {
      const oldItems = [...items];
      setItems(prev => prev.filter(i => i.id !== id));
      setSyncStatus('syncing');
      try { await dbItems.delete(id); setSyncStatus('synced'); } catch { setSyncStatus('error'); setItems(oldItems); }
    }
  };

  const handleImportItems = async (newItems: Omit<FinancialItem, 'id'>[]) => {
      if(!session) return;
      
      const itemsToAdd: FinancialItem[] = newItems.map(i => ({
        ...i, 
        id: generateId(), 
        user_id: session.user.id 
      }));

      // Optimistic update
      setItems(prev => [...prev, ...itemsToAdd]);
      setShowUploadModal(false);
      setSyncStatus('syncing');
      
      try { 
          await dbItems.addBulk(itemsToAdd); 
          setSyncStatus('synced'); 
      } catch (e) { 
          console.error("Bulk Import Error:", e);
          setSyncStatus('error'); 
          alert("Hubo un error guardando los datos. Verifica que todos los campos sean válidos.");
          loadUserData(session.user.id); // Revert to server state
      }
  };

  const handleDebtSettlement = async (amount: number, method: string, details: any) => {
      if (!settlingDebtItem || !session) return;
      let newDebtAmount = Math.max(0, settlingDebtItem.amount - amount);
      const updatedDebtItem = { ...settlingDebtItem, amount: newDebtAmount, note: details.note };
      
      const updatedItemsState = items.map(i => i.id === settlingDebtItem.id ? updatedDebtItem : i);
      setItems(updatedItemsState);
      
      setSyncStatus('syncing');
      try {
        await dbItems.update(updatedDebtItem);
        if (method === 'money' && details.accountId) {
          const account = items.find(i => i.id === details.accountId);
          if (account) {
            const updatedAccount = { ...account, amount: account.type === 'asset' ? account.amount - amount : account.amount + amount };
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
        setSyncStatus('synced');
      } catch { setSyncStatus('error'); }
      setShowDebtModal(false);
  };

  const handleAddToDirectory = async (entity: DirectoryEntity): Promise<DirectoryEntity | null> => {
     try {
         setSyncStatus('syncing');
         const created = await dbDirectory.add(entity);
         setDirectory(prev => [...prev, created]);
         setSyncStatus('synced');
         return created;
     } catch (e) {
         setSyncStatus('error');
         return null;
     }
  };

  const handleAddShoppingItem = async (newItem: any) => { 
      if(!session) return; 
      const item = { ...newItem, id: generateId(), hasReceipt: false, user_id: session.user.id }; 
      setShoppingHistory(prev=>[item, ...prev]); 
      try { await dbShopping.add(item); } catch (e) { console.error(e); } 
  };
  
  const handleAddEvent = async (newItem: any) => { if(!session) return; const item = { ...newItem, id: generateId(), user_id: session.user.id }; setManualEvents(prev=>[...prev, item]); try { await dbEvents.add(item); } catch (e) { console.error(e); } };
  const handleUpdateEvent = async (updatedItem: any) => { setManualEvents(prev => prev.map(e => e.id === updatedItem.id ? updatedItem : e)); setEditingEvent(null); try { await dbEvents.update(updatedItem); } catch (e) { console.error(e); } };
  const handleDeleteEvent = async (id: string) => { setManualEvents(prev => prev.filter(e => e.id !== id)); try { await dbEvents.delete(id); } catch (e) { console.error(e); } };
  const handleAddAsset = async (newItem: any) => { if(!session) return; const item = { ...newItem, id: generateId(), user_id: session.user.id }; setPhysicalAssets(prev=>[...prev, item]); try { await dbAssets.add(item); } catch (e) { console.error(e); } };
  const handleUpdateAsset = async (updatedItem: any) => { setPhysicalAssets(prev => prev.map(a => a.id === updatedItem.id ? updatedItem : a)); setEditingAsset(null); try { await dbAssets.update(updatedItem); } catch (e) { console.error(e); } };
  const handleDeleteAsset = async (id: string) => { setPhysicalAssets(prev => prev.filter(a => a.id !== id)); try { await dbAssets.delete(id); } catch (e) { console.error(e); } };
  
  const handleLiquidation = async (salePrice: number, targetAccountId: string) => {
    if (!liquidatingAsset) return;
    const account = items.find(i => i.id === targetAccountId);
    if(account) {
      const updatedAccount = { ...account, amount: account.amount + salePrice };
      setItems(prev => prev.map(i => i.id === targetAccountId ? updatedAccount : i));
      try { await dbItems.update(updatedAccount); } catch(e) { console.error(e); }
    }
    setPhysicalAssets(prev => prev.filter(a => a.id !== liquidatingAsset.id));
    try { await dbAssets.delete(liquidatingAsset.id); } catch(e) { console.error(e); }
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

  if (!session) return <AuthModal darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />;

  if (isLoading) return <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center"><RefreshCw className="animate-spin text-blue-600 mb-4" size={48} /><p className="text-gray-600 dark:text-gray-300">Cargando...</p></div>;

  return (
    <>
      <MainLayout
        header={<Header darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} rates={rates} setRates={handleRateUpdate} syncStatus={syncStatus} onRefresh={() => loadUserData(session.user.id)} userProfile={userProfile} onOpenProfile={() => setShowProfileModal(true)} />}
        summary={
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Liquidez (Tengo)" value={`$${totalAssets.toFixed(2)}`} subtext="Disponible" colorBorder="border-green-500" />
            <StatCard label="Patrimonio Neto" value={`$${totalPatrimony.toFixed(2)}`} subtext="Balance Total" colorBorder="border-emerald-700" />
            <StatCard label="Total Deudas" value={`$${totalLiabilities.toFixed(2)}`} subtext="Por pagar" colorBorder="border-red-500" />
            <StatCard label="Gasto Fijo" value={`$${monthlyExpenses.toFixed(2)}`} subtext="Mensual" colorBorder="border-yellow-500" icon={<Calendar size={24} />} />
          </div>
        }
        navigation={
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {[{ id: 'dashboard', label: 'Resumen' }, { id: 'assets', label: 'Tengo / Me Deben' }, { id: 'liabilities', label: 'Debo / Gastos' }, { id: 'inventory', label: 'Inventario' }, { id: 'advisor', label: 'Asesor IA' }].map(tab => (
              <Button key={tab.id} size="sm" variant={activeTab === tab.id ? 'primary' : 'secondary'} onClick={() => setActiveTab(tab.id as any)}>{tab.label}</Button>
            ))}
          </div>
        }
        mainContent={
          <>
            {activeTab === 'dashboard' && <Dashboard items={items} exchangeRate={rates.usd_bcv} toUSD={toUSD} formatMoney={formatMoney} onSettleDebt={(item) => { setSettlingDebtItem(item); setShowDebtModal(true); }} onOpenShopping={() => setShowShoppingModal(true)} />}
            {activeTab === 'assets' && renderList('asset')}
            {activeTab === 'liabilities' && renderList('liability')}
            {activeTab === 'inventory' && (
                <div className="space-y-4">
                   <div className="flex justify-between items-center"><p className="text-sm text-gray-500 dark:text-gray-400">Objetos físicos</p><Button size="sm" onClick={() => { setEditingAsset(null); setShowAssetModal(true); }} icon={<Plus size={16}/>}>Agregar</Button></div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {physicalAssets.map(a => (
                        <Card key={a.id} className="p-4 flex flex-col justify-between border-l-4 border-emerald-500">
                           <div className="flex justify-between items-start mb-2"><div><h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2"><Box size={16}/> {a.name}</h4><p className="text-xs text-gray-500">{a.description || 'Sin descripción'}</p></div><span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{formatMoney(a.estimatedValue, a.currency)}</span></div>
                           <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700"><Button size="sm" variant="ghost" className="text-xs px-2" onClick={() => { setLiquidatingAsset(a); setShowLiquidationModal(true); }}>Liquidar</Button><Button size="sm" variant="ghost" className="text-xs px-2" onClick={() => { setEditingAsset(a); setShowAssetModal(true); }} icon={<Edit size={14} />}/> <Button size="sm" variant="ghost" className="text-xs px-2 hover:text-red-500" onClick={() => handleDeleteAsset(a.id)} icon={<Trash2 size={14} />}/></div>
                        </Card>
                      ))}
                      {physicalAssets.length === 0 && <div className="col-span-full py-8 text-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">No tienes inventario registrado.</div>}
                   </div>
                </div>
            )}
            {activeTab === 'advisor' && <FinancialAdvisor items={items} exchangeRate={rates.usd_bcv} />}
          </>
        }
        sidebar={
          <>
            <div className="grid grid-cols-2 gap-2">
                <Button fullWidth size="lg" onClick={() => { setEditingItem(null); setShowAddModal(true); }} icon={<Plus size={20} />} className="shadow-lg">Agregar</Button>
                <div className="grid grid-rows-2 gap-1"><Button fullWidth size="sm" variant="secondary" onClick={() => setShowUploadModal(true)} icon={<UploadCloud size={16} />} className="text-xs">Subir Reporte</Button><Button fullWidth size="sm" variant="secondary" onClick={() => exportToExcel(items, physicalAssets, shoppingHistory)} icon={<Download size={16} />} className="text-xs">Descargar</Button></div>
            </div>
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
    </>
  );
}
export default App;
