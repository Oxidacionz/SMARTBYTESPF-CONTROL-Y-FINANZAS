import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
    FinancialItem,
    PhysicalAsset,
    SpecialEvent,
    ShoppingItem,
    DirectoryEntity,
    FinancialGoal,
    UserFinancialProfile,
    FinancialRecommendation,
    UserProfile
} from '../types';
import { dbItems, dbAssets, dbEvents, dbShopping, dbDirectory, dbGoals, dbProfile, recommendationEngine } from '../services/db';
import { supabase } from '../supabaseClient';
import { generateId } from '../utils/generators';

// Use a simplified recordTransaction since the hook is not yet created
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const recordTransaction = async (data: { type: string; amount: number; currency: string; description: string; status: string }) => {
    try {
        await fetch(`${API_BASE_URL}/transactions/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error("Error recording transaction:", error);
    }
};

interface FinancialContextType {
    // Data
    items: FinancialItem[];
    physicalAssets: PhysicalAsset[];
    manualEvents: SpecialEvent[];
    shoppingHistory: ShoppingItem[];
    directory: DirectoryEntity[];
    goals: FinancialGoal[];
    financialProfile: UserFinancialProfile | null;
    recommendations: FinancialRecommendation[];

    // Status
    isLoading: boolean;
    syncStatus: 'synced' | 'syncing' | 'error';

    // CRUD Actions
    addItem: (item: Omit<FinancialItem, 'id'>) => Promise<void>;
    updateItem: (item: FinancialItem) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    importItems: (items: Omit<FinancialItem, 'id'>[]) => Promise<void>;

    addAsset: (item: Omit<PhysicalAsset, 'id'>) => Promise<void>;
    updateAsset: (item: PhysicalAsset) => Promise<void>;
    deleteAsset: (id: string) => Promise<void>;

    addEvent: (item: Omit<SpecialEvent, 'id'>) => Promise<void>;
    updateEvent: (item: SpecialEvent) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;

    addShoppingItem: (item: Omit<ShoppingItem, 'id'>) => Promise<void>;

    addDirectoryEntity: (entity: DirectoryEntity) => Promise<DirectoryEntity | null>;

    addGoal: (goal: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at' | 'current_amount' | 'status'>) => Promise<void>;
    updateGoal: (goal: FinancialGoal) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;
    addGoalContribution: (goalId: string, amount: number) => Promise<void>;

    saveProfile: (profile: UserFinancialProfile) => Promise<void>;
    dismissRecommendation: (id: string) => Promise<void>;

    refreshData: () => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const useFinancialData = () => {
    const context = useContext(FinancialContext);
    if (!context) {
        throw new Error('useFinancialData must be used within a FinancialProvider');
    }
    return context;
};

export const FinancialProvider: React.FC<{ children: ReactNode, userProfile: UserProfile | null, session: any }> = ({ children, userProfile, session }) => {
    const [items, setItems] = useState<FinancialItem[]>([]);
    const [physicalAssets, setPhysicalAssets] = useState<PhysicalAsset[]>([]);
    const [manualEvents, setManualEvents] = useState<SpecialEvent[]>([]);
    const [shoppingHistory, setShoppingHistory] = useState<ShoppingItem[]>([]);
    const [directory, setDirectory] = useState<DirectoryEntity[]>([]);
    const [goals, setGoals] = useState<FinancialGoal[]>([]);
    const [financialProfile, setFinancialProfile] = useState<UserFinancialProfile | null>(null);
    const [recommendations, setRecommendations] = useState<FinancialRecommendation[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

    const loadData = useCallback(async () => {
        if (!session?.user) return;

        setIsLoading(true);
        setSyncStatus('syncing');

        try {
            if (session.user.id === 'demo-user') {
                setItems([
                    { id: '1', name: 'Sueldo Demo', amount: 300, currency: 'USD', category: 'Income', type: 'asset', isMonthly: true },
                    { id: '2', name: 'Alquiler Demo', amount: 120, currency: 'USD', category: 'Expense', type: 'liability', isMonthly: true }
                ]);
                setSyncStatus('synced');
                setIsLoading(false);
                return;
            }

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

            setSyncStatus('synced');
        } catch (e) {
            console.error("Critical Load Error", e);
            setSyncStatus('error');
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    useEffect(() => {
        if (session) {
            loadData();
        } else {
            // Clear data on logout
            setItems([]);
            setPhysicalAssets([]);
            setManualEvents([]);
            setShoppingHistory([]);
            setDirectory([]);
            setGoals([]);
            setFinancialProfile(null);
            setRecommendations([]);
        }
    }, [session, loadData]);

    // CRUD Implementations
    const addItem = async (newItem: Omit<FinancialItem, 'id'>) => {
        if (!session) return;
        const item: FinancialItem = { ...newItem, id: generateId(), user_id: session.user.id };
        // Optimistic update
        setItems(prev => [...prev, item]);
        setSyncStatus('syncing');
        try {
            await dbItems.add(item);
            setSyncStatus('synced');

            // Auto-record transaction logic
            if (item.type === 'asset' && item.category === 'Income') {
                recordTransaction({ type: 'INGRESO', amount: item.amount, currency: item.currency, description: `Ingreso registrado: ${item.name}`, status: 'COMPLETADO' });
            } else if (item.type === 'liability' && item.category === 'Expense') {
                recordTransaction({ type: 'GASTO', amount: item.amount, currency: item.currency, description: `Gasto registrado: ${item.name}`, status: 'COMPLETADO' });
            } else if (item.category === 'Receivable') {
                recordTransaction({ type: 'CXC', amount: item.amount, currency: item.currency, description: `Nueva deuda por cobrar: ${item.name}`, status: 'PENDIENTE' });
            }
        } catch {
            setSyncStatus('error');
            setItems(prev => prev.filter(i => i.id !== item.id));
        }
    };

    const updateItem = async (updatedItem: FinancialItem) => {
        setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
        setSyncStatus('syncing');
        try { await dbItems.update(updatedItem); setSyncStatus('synced'); } catch { setSyncStatus('error'); }
    };

    const deleteItem = async (id: string) => {
        const oldItems = [...items];
        setItems(prev => prev.filter(i => i.id !== id));
        setSyncStatus('syncing');
        try { await dbItems.delete(id); setSyncStatus('synced'); } catch { setSyncStatus('error'); setItems(oldItems); }
    };

    const importItems = async (newItems: Omit<FinancialItem, 'id'>[]) => {
        if (!session) return;
        const itemsToAdd: FinancialItem[] = newItems.map(i => ({
            ...i,
            id: generateId(),
            user_id: session.user.id
        }));
        setItems(prev => [...prev, ...itemsToAdd]);
        setSyncStatus('syncing');
        try {
            await dbItems.addBulk(itemsToAdd);
            setSyncStatus('synced');
        } catch {
            setSyncStatus('error');
            // Re-fetch to ensure consistency if bulk fail
            loadData();
        }
    };

    const addAsset = async (newItem: Omit<PhysicalAsset, 'id'>) => {
        if (!session) return;
        const item = { ...newItem, id: generateId(), user_id: session.user.id };
        setPhysicalAssets(prev => [...prev, item]);
        try { await dbAssets.add(item); } catch (e) { console.error(e); }
    };

    const updateAsset = async (updatedItem: PhysicalAsset) => {
        setPhysicalAssets(prev => prev.map(a => a.id === updatedItem.id ? updatedItem : a));
        try { await dbAssets.update(updatedItem); } catch (e) { console.error(e); }
    };

    const deleteAsset = async (id: string) => {
        setPhysicalAssets(prev => prev.filter(a => a.id !== id));
        try { await dbAssets.delete(id); } catch (e) { console.error(e); }
    };

    const addEvent = async (newItem: Omit<SpecialEvent, 'id'>) => {
        if (!session) return;
        const item = { ...newItem, id: generateId(), user_id: session.user.id };
        setManualEvents(prev => [...prev, item]);
        try { await dbEvents.add(item); } catch (e) { console.error(e); }
    };

    const updateEvent = async (updatedItem: SpecialEvent) => {
        setManualEvents(prev => prev.map(e => e.id === updatedItem.id ? updatedItem : e));
        try { await dbEvents.update(updatedItem); } catch (e) { console.error(e); }
    };

    const deleteEvent = async (id: string) => {
        setManualEvents(prev => prev.filter(e => e.id !== id));
        try { await dbEvents.delete(id); } catch (e) { console.error(e); }
    };

    const addShoppingItem = async (newItem: Omit<ShoppingItem, 'id'>) => {
        if (!session) return;
        const item = { ...newItem, id: generateId(), user_id: session.user.id };
        setShoppingHistory(prev => [item, ...prev]);
        try {
            await dbShopping.add(item);
            recordTransaction({
                type: 'GASTO',
                amount: item.amount,
                currency: item.currency,
                description: `Gasto Hormiga: ${item.description}`,
                status: 'COMPLETADO'
            });
        } catch (e) { console.error(e); }
    };

    const addDirectoryEntity = async (entity: DirectoryEntity) => {
        setSyncStatus('syncing');
        try {
            const created = await dbDirectory.add(entity);
            setDirectory(prev => [...prev, created]);
            setSyncStatus('synced');
            return created;
        } catch {
            setSyncStatus('error');
            return null;
        }
    };

    const addGoal = async (newGoal: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at' | 'current_amount' | 'status'>) => {
        if (!session) return;
        setSyncStatus('syncing');
        try {
            const goalToAdd = { ...newGoal, current_amount: 0, status: 'active' as const };
            const addedGoal = await dbGoals.add(goalToAdd);
            setGoals(prev => [addedGoal, ...prev]);
            setSyncStatus('synced');
        } catch { setSyncStatus('error'); }
    };

    const updateGoal = async (updatedGoal: FinancialGoal) => {
        setSyncStatus('syncing');
        try {
            await dbGoals.update(updatedGoal);
            setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
            setSyncStatus('synced');
        } catch { setSyncStatus('error'); }
    };

    const deleteGoal = async (id: string) => {
        setSyncStatus('syncing');
        try {
            await dbGoals.delete(id);
            setGoals(prev => prev.filter(g => g.id !== id));
            setSyncStatus('synced');
        } catch { setSyncStatus('error'); }
    };

    const addGoalContribution = async (goalId: string, amount: number) => {
        setSyncStatus('syncing');
        try {
            await dbGoals.addContribution(goalId, amount);
            const updatedGoal = await dbGoals.getById(goalId);
            if (updatedGoal) {
                setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
                recordTransaction({
                    type: 'GASTO',
                    amount: amount,
                    currency: updatedGoal.currency,
                    description: `Contribución a Meta: ${updatedGoal.name}`,
                    status: 'COMPLETADO'
                });
            }
            setSyncStatus('synced');
        } catch { setSyncStatus('error'); }
    };

    const saveProfile = async (profile: UserFinancialProfile) => {
        setSyncStatus('syncing');
        try {
            const savedProfile = await dbProfile.saveProfile(profile);
            setFinancialProfile(savedProfile);
            const newRecs = recommendationEngine.generateRecommendations(savedProfile, items, goals);
            await dbProfile.saveRecommendations(newRecs);
            const updatedRecs = await dbProfile.getRecommendations();
            setRecommendations(updatedRecs);
            setSyncStatus('synced');
        } catch { setSyncStatus('error'); }
    };

    const dismissRecommendation = async (id: string) => {
        try {
            await dbProfile.updateRecommendationStatus(id, 'dismissed');
            setRecommendations(prev => prev.filter(r => r.id !== id));
        } catch (e) { console.error(e); }
    };

    const refreshData = async () => {
        await loadData();
    };

    return (
        <FinancialContext.Provider value={{
            items, physicalAssets, manualEvents, shoppingHistory, directory, goals, financialProfile, recommendations,
            isLoading, syncStatus,
            addItem, updateItem, deleteItem, importItems,
            addAsset, updateAsset, deleteAsset,
            addEvent, updateEvent, deleteEvent,
            addShoppingItem,
            addDirectoryEntity,
            addGoal, updateGoal, deleteGoal, addGoalContribution,
            saveProfile, dismissRecommendation,
            refreshData
        }}>
            {children}
        </FinancialContext.Provider>
    );
};
