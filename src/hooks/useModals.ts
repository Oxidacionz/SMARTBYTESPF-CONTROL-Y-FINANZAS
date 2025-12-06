/**
 * Hook para manejar el estado de todos los modales de la aplicación
 */

import { useState } from 'react';
import { FinancialItem, SpecialEvent, PhysicalAsset, FinancialGoal } from '../types';

export const useModals = () => {
    // Modales de formularios
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showAssetModal, setShowAssetModal] = useState(false);
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [showProfileForm, setShowProfileForm] = useState(false);

    // Modales de acciones
    const [showDebtModal, setShowDebtModal] = useState(false);
    const [showLiquidationModal, setShowLiquidationModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showShoppingModal, setShowShoppingModal] = useState(false);
    const [showContributionModal, setShowContributionModal] = useState(false);

    // Modales de información
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Items siendo editados
    const [editingItem, setEditingItem] = useState<FinancialItem | null>(null);
    const [editingEvent, setEditingEvent] = useState<SpecialEvent | null>(null);
    const [editingAsset, setEditingAsset] = useState<PhysicalAsset | null>(null);
    const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

    // Items para acciones específicas
    const [settlingDebtItem, setSettlingDebtItem] = useState<FinancialItem | null>(null);
    const [liquidatingAsset, setLiquidatingAsset] = useState<PhysicalAsset | null>(null);
    const [contributingGoal, setContributingGoal] = useState<FinancialGoal | null>(null);

    // Menús desplegables
    const [showReportsMenu, setShowReportsMenu] = useState(false);
    const [showDistributionChart, setShowDistributionChart] = useState(false);

    return {
        // Modales de formularios
        showAddModal,
        setShowAddModal,
        showEventModal,
        setShowEventModal,
        showAssetModal,
        setShowAssetModal,
        showGoalForm,
        setShowGoalForm,
        showProfileForm,
        setShowProfileForm,

        // Modales de acciones
        showDebtModal,
        setShowDebtModal,
        showLiquidationModal,
        setShowLiquidationModal,
        showUploadModal,
        setShowUploadModal,
        showShoppingModal,
        setShowShoppingModal,
        showContributionModal,
        setShowContributionModal,

        // Modales de información
        showProfileModal,
        setShowProfileModal,
        showTutorial,
        setShowTutorial,
        showNotifications,
        setShowNotifications,

        // Items siendo editados
        editingItem,
        setEditingItem,
        editingEvent,
        setEditingEvent,
        editingAsset,
        setEditingAsset,
        editingGoal,
        setEditingGoal,

        // Items para acciones
        settlingDebtItem,
        setSettlingDebtItem,
        liquidatingAsset,
        setLiquidatingAsset,
        contributingGoal,
        setContributingGoal,

        // Menús
        showReportsMenu,
        setShowReportsMenu,
        showDistributionChart,
        setShowDistributionChart,
    };
};
