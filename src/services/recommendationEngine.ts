
import { UserFinancialProfile, FinancialRecommendation, BudgetDistribution, FinancialItem, FinancialGoal } from '../types';

// Algoritmo de Recomendación - Opción A (Basado en Reglas)

export const recommendationEngine = {

    calculateBudgetDistribution: (profile: UserFinancialProfile): BudgetDistribution => {
        let savings = 20;
        let investment = 10;
        let expenses = 70;
        let emergency = 0;

        // Reglas por Edad
        if (profile.age) {
            if (profile.age < 30) {
                savings = 25; investment = 15; expenses = 60;
            } else if (profile.age < 45) {
                savings = 20; investment = 20; expenses = 60;
            } else if (profile.age < 60) {
                savings = 25; investment = 15; expenses = 60;
            } else {
                savings = 10; investment = 10; expenses = 80;
            }
        }

        // Reglas por Familia
        if (profile.marital_status === 'single' && !profile.num_children) {
            investment += 5; expenses -= 5;
        } else if (profile.num_children && profile.num_children > 0) {
            investment -= 5; expenses += 5;
        }

        // Reglas por Perfil de Riesgo (Ajuste fino)
        if (profile.risk_profile === 'conservative') {
            investment -= 5; savings += 5;
        } else if (profile.risk_profile === 'aggressive') {
            investment += 5; savings -= 5;
        }

        // Ajuste por Fondo de Emergencia incompleto
        if (!profile.has_emergency_fund) {
            emergency = 10; // Destinar 10% a fondo de emergencia
            expenses -= 5;
            investment -= 5;
        }

        // Normalizar para asegurar que sume 100%
        const total = savings + investment + expenses + emergency;
        if (total !== 100) {
            expenses = 100 - (savings + investment + emergency);
        }

        return { savings, investment, expenses, emergency_fund: emergency };
    },

    generateRecommendations: (
        profile: UserFinancialProfile,
        currentItems: FinancialItem[],
        goals: FinancialGoal[]
    ): Omit<FinancialRecommendation, 'id' | 'created_at' | 'user_id'>[] => {
        const recommendations: Omit<FinancialRecommendation, 'id' | 'created_at' | 'user_id'>[] = [];

        // 1. Análisis de Fondo de Emergencia
        if (!profile.has_emergency_fund) {
            const monthsRecommended = profile.risk_profile === 'conservative' ? 6 : 3;
            recommendations.push({
                recommendation_type: 'emergency_fund',
                title: 'Prioridad: Fondo de Emergencia',
                description: `Tu perfil sugiere tener al menos ${monthsRecommended} meses de gastos cubiertos. Configura una meta de ahorro específica para esto.`,
                priority: 'high',
                status: 'pending'
            });
        }

        // 2. Análisis de Retiro
        if (profile.age && profile.retirement_age_goal) {
            const yearsLeft = profile.retirement_age_goal - profile.age;
            if (yearsLeft < 10 && (!profile.investment_experience || profile.investment_experience === 'none')) {
                recommendations.push({
                    recommendation_type: 'investment',
                    title: 'Planificación de Retiro Urgente',
                    description: `Te quedan ${yearsLeft} años para tu meta de retiro. Es crucial comenzar a invertir o maximizar tus aportes ahora.`,
                    priority: 'high',
                    status: 'pending'
                });
            }
        }

        // 3. Análisis de Deudas vs Inversión
        const totalDebt = currentItems.filter(i => i.type === 'liability').reduce((acc, i) => acc + i.amount, 0); // Simplificado, idealmente usar USD
        const totalAssets = currentItems.filter(i => i.type === 'asset').reduce((acc, i) => acc + i.amount, 0);

        if (totalDebt > totalAssets * 0.5) {
            recommendations.push({
                recommendation_type: 'debt_reduction',
                title: 'Nivel de Deuda Elevado',
                description: 'Tus deudas superan el 50% de tus activos. Considera pausar nuevas inversiones y enfocar el excedente en pagar deudas (Método Bola de Nieve).',
                priority: 'high',
                status: 'pending'
            });
        }

        // 4. Diversificación (Si tiene muchos ahorros pero poca inversión)
        if (profile.risk_profile !== 'conservative' && totalAssets > 10000) { // Umbral arbitrario
            // Aquí se podría chequear si tiene activos de inversión, por ahora es genérico
            recommendations.push({
                recommendation_type: 'investment',
                title: 'Oportunidad de Inversión',
                description: 'Tienes liquidez disponible. Considera mover parte de tus ahorros a instrumentos de inversión acorde a tu perfil moderado/agresivo.',
                priority: 'medium',
                status: 'pending'
            });
        }

        return recommendations;
    }
};
