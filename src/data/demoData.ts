import { FinancialItem, PhysicalAsset, SpecialEvent, FinancialGoal, DirectoryEntity } from '../types';

/**
 * Datos de ejemplo para el Modo Demo
 * Estos datos se cargan automáticamente cuando un usuario entra en modo demo
 */

export const DEMO_ITEMS: Omit<FinancialItem, 'id' | 'user_id'>[] = [
    // ACTIVOS
    {
        name: 'Banco Principal',
        amount: 500,
        currency: 'USD',
        category: 'Bank',
        type: 'asset',
        isMonthly: false,
        note: 'Cuenta de ahorros principal'
    },
    {
        name: 'Efectivo en Casa',
        amount: 150,
        currency: 'USD',
        category: 'Cash',
        type: 'asset',
        isMonthly: false
    },
    {
        name: 'Billetera Digital',
        amount: 75,
        currency: 'USD',
        category: 'Wallet',
        type: 'asset',
        isMonthly: false,
        note: 'PayPal y Zelle'
    },
    {
        name: 'Juan me debe',
        amount: 50,
        currency: 'USD',
        category: 'Receivable',
        type: 'asset',
        isMonthly: false,
        note: 'Préstamo personal'
    },

    // PASIVOS
    {
        name: 'Préstamo Personal',
        amount: 200,
        currency: 'USD',
        category: 'Debt',
        type: 'liability',
        isMonthly: false,
        note: 'Pagar en 3 meses'
    },
    {
        name: 'Alquiler',
        amount: 300,
        currency: 'USD',
        category: 'Expense',
        type: 'liability',
        isMonthly: true,
        dayOfMonth: 5,
        note: 'Pago mensual'
    },
    {
        name: 'Servicios',
        amount: 80,
        currency: 'USD',
        category: 'Expense',
        type: 'liability',
        isMonthly: true,
        dayOfMonth: 15,
        note: 'Luz, agua, internet'
    },
    {
        name: 'Supermercado',
        amount: 150,
        currency: 'USD',
        category: 'Expense',
        type: 'liability',
        isMonthly: true,
        dayOfMonth: 1,
        note: 'Compras mensuales'
    }
];

export const DEMO_PHYSICAL_ASSETS: Omit<PhysicalAsset, 'id' | 'user_id'>[] = [
    {
        name: 'Laptop',
        estimatedValue: 800,
        currency: 'USD',
        description: 'MacBook Pro 2020',
        purchaseDate: '2020-06-15'
    },
    {
        name: 'Teléfono',
        estimatedValue: 400,
        currency: 'USD',
        description: 'iPhone 12',
        purchaseDate: '2021-03-20'
    },
    {
        name: 'Bicicleta',
        estimatedValue: 250,
        currency: 'USD',
        description: 'Bicicleta de montaña',
        purchaseDate: '2022-01-10'
    }
];

export const DEMO_EVENTS: Omit<SpecialEvent, 'id' | 'user_id'>[] = [
    {
        name: 'Cumpleaños de María',
        date: '12-25',
        type: 'birthday'
    },
    {
        name: 'Pago de Tarjeta',
        date: '01-15',
        type: 'payment'
    },
    {
        name: 'Renovación de Seguro',
        date: '03-01',
        type: 'other'
    }
];

export const DEMO_GOALS: Omit<FinancialGoal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_amount' | 'status'>[] = [
    {
        name: 'Fondo de Emergencia',
        target_amount: 1000,
        target_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 meses
        description: 'Ahorrar para emergencias',
        category: 'Savings'
    },
    {
        name: 'Vacaciones',
        target_amount: 500,
        target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 meses
        description: 'Viaje a la playa',
        category: 'Savings'
    }
];

export const DEMO_DIRECTORY: Omit<DirectoryEntity, 'id' | 'user_id' | 'created_at'>[] = [
    {
        name: 'Banco Nacional',
        type: 'bank',
        balance: 500,
        currency: 'USD',
        notes: 'Cuenta principal'
    },
    {
        name: 'Juan Pérez',
        type: 'person',
        balance: 50,
        currency: 'USD',
        notes: 'Me debe dinero'
    },
    {
        name: 'Tienda Local',
        type: 'business',
        balance: -30,
        currency: 'USD',
        notes: 'Crédito pendiente'
    }
];

/**
 * Genera IDs únicos para los datos de demo
 */
export function generateDemoId(): string {
    return `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Convierte los datos de demo a formato completo con IDs
 */
export function prepareDemoData(demoUserId: string = 'demo-user') {
    return {
        items: DEMO_ITEMS.map(item => ({
            ...item,
            id: generateDemoId(),
            user_id: demoUserId
        })),
        physicalAssets: DEMO_PHYSICAL_ASSETS.map(asset => ({
            ...asset,
            id: generateDemoId(),
            user_id: demoUserId
        })),
        events: DEMO_EVENTS.map(event => ({
            ...event,
            id: generateDemoId(),
            user_id: demoUserId
        })),
        goals: DEMO_GOALS.map(goal => ({
            ...goal,
            id: generateDemoId(),
            user_id: demoUserId,
            current_amount: Math.random() * goal.target_amount * 0.3, // 0-30% de progreso
            status: 'active' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })),
        directory: DEMO_DIRECTORY.map(entity => ({
            ...entity,
            id: generateDemoId(),
            user_id: demoUserId,
            created_at: new Date().toISOString()
        }))
    };
}
