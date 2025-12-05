/**
 * Zod validation schemas for Smart Bytes application
 * Provides runtime type validation for all form inputs
 */

import { z } from 'zod';

/**
 * Currency validation schema
 */
export const CurrencySchema = z.enum(['USD', 'VES', 'EUR']);

/**
 * Category validation schema
 */
export const CategorySchema = z.enum([
    'Bank',
    'Wallet',
    'Crypto',
    'Cash',
    'Debt',
    'Expense',
    'Receivable',
    'Income',
    'Shopping',
    'Savings'
]);

/**
 * Financial Item validation schema
 */
export const FinancialItemSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'El nombre es requerido').max(100, 'Nombre muy largo'),
    amount: z.number().positive('El monto debe ser positivo').finite(),
    currency: CurrencySchema,
    category: CategorySchema,
    type: z.enum(['asset', 'liability']),
    isMonthly: z.boolean(),
    dayOfMonth: z.number().int().min(1).max(31).optional(),
    note: z.string().max(500, 'Nota muy larga').optional(),
    customExchangeRate: z.number().positive().optional(),
    user_id: z.string().optional(),
    entity_id: z.string().nullable().optional(),
    target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)').nullable().optional(),
});

/**
 * Physical Asset validation schema
 */
export const PhysicalAssetSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'El nombre es requerido').max(100),
    estimatedValue: z.number().positive('El valor debe ser positivo').finite(),
    currency: CurrencySchema,
    description: z.string().max(500).optional(),
    purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    user_id: z.string().optional(),
});

/**
 * Special Event validation schema
 */
export const SpecialEventSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'El nombre es requerido').max(100),
    date: z.string().regex(/^(\d{4}-\d{2}-\d{2}|\d{2}-\d{2})$/, 'Formato de fecha inválido'),
    type: z.enum(['birthday', 'payment', 'other']),
    user_id: z.string().optional(),
});

/**
 * Shopping Item validation schema
 */
export const ShoppingItemSchema = z.object({
    id: z.string().optional(),
    description: z.string().min(1, 'La descripción es requerida').max(200),
    amount: z.number().positive('El monto debe ser positivo').finite(),
    currency: CurrencySchema,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    hasReceipt: z.boolean(),
    user_id: z.string().optional(),
    entity_id: z.string().nullable().optional(),
});

/**
 * Exchange Rates validation schema
 */
export const ExchangeRatesSchema = z.object({
    usd_bcv: z.number().positive().finite(),
    eur_bcv: z.number().positive().finite(),
    usd_binance_buy: z.number().positive().finite(),
    usd_binance_sell: z.number().positive().finite(),
    lastUpdated: z.string(),
});

/**
 * Financial Goal validation schema
 */
export const FinancialGoalSchema = z.object({
    id: z.string().optional(),
    user_id: z.string().optional(),
    name: z.string().min(1, 'El nombre es requerido').max(100),
    description: z.string().max(500).optional(),
    goal_type: z.enum(['savings', 'income', 'emergency_fund', 'specific_fund']),
    target_amount: z.number().positive('El monto objetivo debe ser positivo').finite(),
    current_amount: z.number().nonnegative('El monto actual no puede ser negativo').finite(),
    currency: CurrencySchema,
    target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    completed_at: z.string().optional(),
    status: z.enum(['active', 'completed', 'paused', 'cancelled']),
    category: z.string().optional(),
    auto_contribute: z.boolean().optional(),
    contribution_frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    contribution_amount: z.number().positive().optional(),
});

/**
 * Directory Entity validation schema
 */
export const DirectoryEntitySchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'El nombre es requerido').max(100),
    type: z.enum(['person', 'company', 'platform']),
    contact_info: z.string().max(200).optional(),
    user_id: z.string().optional(),
});

/**
 * User Profile validation schema
 */
export const UserProfileSchema = z.object({
    id: z.string(),
    email: z.string().email('Email inválido'),
    full_name: z.string().max(100).optional(),
    birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    avatar_url: z.string().url().optional(),
});

/**
 * User Financial Profile validation schema
 */
export const UserFinancialProfileSchema = z.object({
    id: z.string().optional(),
    user_id: z.string().optional(),
    age: z.number().int().min(18, 'Debe ser mayor de 18').max(120).optional(),
    marital_status: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
    num_dependents: z.number().int().nonnegative().optional(),
    num_children: z.number().int().nonnegative().optional(),
    work_schedule: z.enum(['full_time', 'part_time', 'freelance', 'retired', 'student']).optional(),
    monthly_income_range: z.enum(['low', 'medium', 'high', 'very_high']).optional(),
    hobbies: z.array(z.string()).optional(),
    main_expenses: z.array(z.string()).optional(),
    retirement_age_goal: z.number().int().min(40).max(100).optional(),
    retirement_lifestyle: z.enum(['modest', 'comfortable', 'luxurious']).optional(),
    risk_profile: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
    investment_experience: z.enum(['none', 'beginner', 'intermediate', 'advanced']).optional(),
    has_emergency_fund: z.boolean().optional(),
    emergency_fund_months: z.number().int().nonnegative().max(24).optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

/**
 * Helper function to validate data against a schema
 * Returns { success: true, data } or { success: false, errors }
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: result.error };
}

/**
 * Helper function to get user-friendly error messages from Zod errors
 */
export function getValidationErrors(error: z.ZodError): Record<string, string> {
    const errors: Record<string, string> = {};
    error.issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
    });
    return errors;
}
