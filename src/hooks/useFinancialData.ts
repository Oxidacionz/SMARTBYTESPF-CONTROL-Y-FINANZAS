/**
 * Hook para manejar todos los datos financieros de la aplicación
 */

import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import {
    FinancialItem,
    PhysicalAsset,
    SpecialEvent,
    FinancialGoal,
    DirectoryEntity,
    ShoppingItem,
    UserFinancialProfile,
    Recommendation,
    Notification
} from '../types';
import { generateId } from '../utils/helpers';
import { dbItems } from '../db/itemsDB';
import { dbAssets } from '../db/assetsDB';
import { dbEvents } from '../db/eventsDB';
import { dbGoals } from '../db/goalsDB';
import { dbDirectory } from '../db/directoryDB';
import { dbShopping } from '../db/shoppingDB';
import { dbProfile } from '../db/profileDB';

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export const useFinancialData = (session: Session | null) => {
    // Estados principales
    const [items, setItems] = useState<FinancialItem[]>([]);
    const [physicalAssets, setPhysicalAssets] = useState<PhysicalAsset[]>([]);
    const [goals, setGoals] = useState<FinancialGoal[]>([]);
    const [directory, setDirectory] = useState<DirectoryEntity[]>([]);
    const [manualEvents, setManualEvents] = useState<SpecialEvent[]>([]);
    const [shoppingHistory, setShoppingHistory] = useState<ShoppingItem[]>([]);
    const [financialProfile, setFinancialProfile] = useState<UserFinancialProfile | null>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

    /**
     * Carga todos los datos del usuario
     */
    const loadUserData = async (userId: string) => {
        setSyncStatus('syncing');
        try {
            const [itemsData, assetsData, goalsData, directoryData, eventsData, shoppingData, profileData, recsData] = await Promise.all([
                dbItems.getAll(userId),
                dbAssets.getAll(userId),
                dbGoals.getAll(userId),
                dbDirectory.getAll(userId),
                dbEvents.getAll(userId),
                dbShopping.getAll(userId),
                dbProfile.getProfile(userId),
                dbProfile.getRecommendations(userId)
            ]);

            setItems(itemsData);
            setPhysicalAssets(assetsData);
            setGoals(goalsData);
            setDirectory(directoryData);
            setManualEvents(eventsData);
            setShoppingHistory(shoppingData);
            setFinancialProfile(profileData);
            setRecommendations(recsData);

            setSyncStatus('synced');
        } catch (error) {
            console.error('Error loading user data:', error);
            setSyncStatus('error');
        }
    };

    // Cargar datos cuando hay sesión
    useEffect(() => {
        if (session?.user?.id) {
            loadUserData(session.user.id);
        }
    }, [session?.user?.id]);

    // ==================== ITEMS HANDLERS ====================

    const handleAddItem = async (newItem: Omit<FinancialItem, 'id' | 'user_id'>) => {
        if (!session) return;

        const item: FinancialItem = {
            ...newItem,
            id: generateId(),
            user_id: session.user.id
        };

        setItems(prev => [...prev, item]);

        try {
            await dbItems.add(item);
        } catch (e) {
            console.error('Error adding item:', e);
        }
    };

    const handleUpdateItem = async (updatedItem: FinancialItem) => {
        setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));

        try {
            await dbItems.update(updatedItem);
        } catch (e) {
            console.error('Error updating item:', e);
        }
    };

    const handleDeleteItem = async (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));

        try {
            await dbItems.delete(id);
        } catch (e) {
            console.error('Error deleting item:', e);
        }
    };

    // ==================== DIRECTORY HANDLERS ====================

    const handleAddToDirectory = async (entity: Omit<DirectoryEntity, 'id' | 'user_id'>) => {
        if (!session) return;

        const newEntity: DirectoryEntity = {
            ...entity,
            id: generateId(),
            user_id: session.user.id
        };

        setDirectory(prev => [...prev, newEntity]);

        try {
            await dbDirectory.add(newEntity);
        } catch (e) {
            console.error('Error adding to directory:', e);
        }
    };

    // ==================== DEBT SETTLEMENT ====================

    const handleDebtSettlement = async (
        debtItem: FinancialItem,
        paymentMethod: 'cash' | 'asset',
        sourceId?: string,
        partialAmount?: number
    ) => {
        const amountToSettle = partialAmount || debtItem.amount;

        if (paymentMethod === 'cash' && sourceId) {
            const sourceAccount = items.find(i => i.id === sourceId);
            if (sourceAccount) {
                const updatedSource = { ...sourceAccount, amount: sourceAccount.amount - amountToSettle };
                await handleUpdateItem(updatedSource);
            }
        } else if (paymentMethod === 'asset' && sourceId) {
            const asset = physicalAssets.find(a => a.id === sourceId);
            if (asset) {
                await handleDeleteAsset(sourceId);
            }
        }

        if (partialAmount && partialAmount < debtItem.amount) {
            const updatedDebt = { ...debtItem, amount: debtItem.amount - partialAmount };
            await handleUpdateItem(updatedDebt);
        } else {
            await handleDeleteItem(debtItem.id);
        }
    };

    // ==================== SHOPPING HANDLERS ====================

    const handleAddShoppingItem = async (item: Omit<ShoppingItem, 'id' | 'user_id'>) => {
        if (!session) return;

        const newItem: ShoppingItem = {
            ...item,
            id: generateId(),
            user_id: session.user.id
        };

        setShoppingHistory(prev => [...prev, newItem]);

        try {
            await dbShopping.add(newItem);
        } catch (e) {
            console.error('Error adding shopping item:', e);
        }
    };

    // ==================== EVENTS HANDLERS ====================

    const handleAddEvent = async (newItem: Omit<SpecialEvent, 'id' | 'user_id'>) => {
        if (!session) return;

        const item: SpecialEvent = {
            ...newItem,
            id: generateId(),
            user_id: session.user.id
        };

        setManualEvents(prev => [...prev, item]);

        try {
            await dbEvents.add(item);
        } catch (e) {
            console.error('Error adding event:', e);
        }
    };

    const handleUpdateEvent = async (updatedItem: SpecialEvent) => {
        setManualEvents(prev => prev.map(e => e.id === updatedItem.id ? updatedItem : e));

        try {
            await dbEvents.update(updatedItem);
        } catch (e) {
            console.error('Error updating event:', e);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        setManualEvents(prev => prev.filter(e => e.id !== id));

        try {
            await dbEvents.delete(id);
        } catch (e) {
            console.error('Error deleting event:', e);
        }
    };

    // ==================== ASSETS HANDLERS ====================

    const handleAddAsset = async (newItem: Omit<PhysicalAsset, 'id' | 'user_id'>) => {
        if (!session) return;

        const item: PhysicalAsset = {
            ...newItem,
            id: generateId(),
            user_id: session.user.id
        };

        setPhysicalAssets(prev => [...prev, item]);

        try {
            await dbAssets.add(item);
        } catch (e) {
            console.error('Error adding asset:', e);
        }
    };

    const handleUpdateAsset = async (updatedItem: PhysicalAsset) => {
        setPhysicalAssets(prev => prev.map(a => a.id === updatedItem.id ? updatedItem : a));

        try {
            await dbAssets.update(updatedItem);
        } catch (e) {
            console.error('Error updating asset:', e);
        }
    };

    const handleDeleteAsset = async (id: string) => {
        setPhysicalAssets(prev => prev.filter(a => a.id !== id));

        try {
            await dbAssets.delete(id);
        } catch (e) {
            console.error('Error deleting asset:', e);
        }
    };

    const handleLiquidation = async (salePrice: number, targetAccountId: string, assetId: string) => {
        const account = items.find(i => i.id === targetAccountId);
        if (account) {
            const updatedAccount = { ...account, amount: account.amount + salePrice };
            await handleUpdateItem(updatedAccount);
        }

        await handleDeleteAsset(assetId);
    };

    // ==================== GOALS HANDLERS ====================

    const handleAddGoal = async (newGoal: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at' | 'current_amount' | 'status'>) => {
        if (!session) return;

        setSyncStatus('syncing');
        try {
            const goalToAdd = { ...newGoal, current_amount: 0, status: 'active' as const };
            const addedGoal = await dbGoals.add(goalToAdd);
            setGoals(prev => [addedGoal, ...prev]);
            setSyncStatus('synced');
        } catch (e) {
            console.error('Error adding goal:', e);
            setSyncStatus('error');
        }
    };

    const handleUpdateGoal = async (updatedGoal: FinancialGoal) => {
        setSyncStatus('syncing');
        try {
            await dbGoals.update(updatedGoal);
            setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
            setSyncStatus('synced');
        } catch (e) {
            console.error('Error updating goal:', e);
            setSyncStatus('error');
        }
    };

    const handleDeleteGoal = async (id: string) => {
        if (window.confirm('¿Eliminar esta meta?')) {
            setSyncStatus('syncing');
            try {
                await dbGoals.delete(id);
                setGoals(prev => prev.filter(g => g.id !== id));
                setSyncStatus('synced');
            } catch (e) {
                console.error('Error deleting goal:', e);
                setSyncStatus('error');
            }
        }
    };

    const handleAddContribution = async (goalId: string, amount: number) => {
        setSyncStatus('syncing');
        try {
            await dbGoals.addContribution(goalId, amount);
            const updatedGoal = await dbGoals.getById(goalId);

            if (updatedGoal) {
                setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));

                // Check if goal was just completed
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

            setSyncStatus('synced');
        } catch (e) {
            console.error('Error adding contribution:', e);
            setSyncStatus('error');
        }
    };

    return {
        // Estados
        items,
        physicalAssets,
        goals,
        directory,
        manualEvents,
        shoppingHistory,
        financialProfile,
        recommendations,
        notifications,
        syncStatus,

        // Setters
        setItems,
        setPhysicalAssets,
        setGoals,
        setDirectory,
        setManualEvents,
        setShoppingHistory,
        setFinancialProfile,
        setRecommendations,
        setNotifications,

        // Handlers
        loadUserData,
        handleAddItem,
        handleUpdateItem,
        handleDeleteItem,
        handleAddToDirectory,
        handleDebtSettlement,
        handleAddShoppingItem,
        handleAddEvent,
        handleUpdateEvent,
        handleDeleteEvent,
        handleAddAsset,
        handleUpdateAsset,
        handleDeleteAsset,
        handleLiquidation,
        handleAddGoal,
        handleUpdateGoal,
        handleDeleteGoal,
        handleAddContribution,
    };
};
