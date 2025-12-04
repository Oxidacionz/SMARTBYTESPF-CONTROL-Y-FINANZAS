
import { supabase } from '../supabaseClient';
import { FinancialGoal } from '../types';

// Helper de seguridad: Obtener usuario autenticado o fallar
const getAuthenticatedUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
        throw new Error("Violación de seguridad: Intento de acceso sin sesión válida.");
    }
    return session.user;
};

// --- Financial Goals ---
export const dbGoals = {
    getAll: async (): Promise<FinancialGoal[]> => {
        const user = await getAuthenticatedUser();
        const { data, error } = await supabase
            .from('financial_goals')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    getActive: async (): Promise<FinancialGoal[]> => {
        const user = await getAuthenticatedUser();
        const { data, error } = await supabase
            .from('financial_goals')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('target_date', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    getById: async (id: string): Promise<FinancialGoal | null> => {
        const user = await getAuthenticatedUser();
        const { data, error } = await supabase
            .from('financial_goals')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (error) return null;
        return data;
    },

    add: async (goal: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialGoal> => {
        const user = await getAuthenticatedUser();
        const safeGoal = { ...goal, user_id: user.id };
        const { data, error } = await supabase
            .from('financial_goals')
            .insert(safeGoal)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    update: async (goal: FinancialGoal): Promise<void> => {
        const user = await getAuthenticatedUser();
        const { error } = await supabase
            .from('financial_goals')
            .update(goal)
            .eq('id', goal.id)
            .eq('user_id', user.id);

        if (error) throw error;
    },

    updateProgress: async (id: string, currentAmount: number): Promise<void> => {
        const user = await getAuthenticatedUser();
        const { error } = await supabase
            .from('financial_goals')
            .update({ current_amount: currentAmount })
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;
    },

    addContribution: async (id: string, amount: number): Promise<void> => {
        const user = await getAuthenticatedUser();

        // Get current goal
        const goal = await dbGoals.getById(id);
        if (!goal) throw new Error('Meta no encontrada');

        const newAmount = goal.current_amount + amount;
        await dbGoals.updateProgress(id, newAmount);
    },

    delete: async (id: string): Promise<void> => {
        const user = await getAuthenticatedUser();
        const { error } = await supabase
            .from('financial_goals')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;
    },

    // Calcular progreso de una meta
    calculateProgress: (goal: FinancialGoal): number => {
        if (goal.target_amount === 0) return 0;
        const progress = (goal.current_amount / goal.target_amount) * 100;
        return Math.min(progress, 100);
    },

    // Calcular días restantes
    getDaysRemaining: (goal: FinancialGoal): number | null => {
        if (!goal.target_date) return null;
        const today = new Date();
        const targetDate = new Date(goal.target_date);
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    // Calcular contribución sugerida
    getSuggestedContribution: (goal: FinancialGoal): number | null => {
        const daysRemaining = dbGoals.getDaysRemaining(goal);
        if (!daysRemaining || daysRemaining <= 0) return null;

        const amountNeeded = goal.target_amount - goal.current_amount;
        if (amountNeeded <= 0) return 0;

        // Calcular contribución diaria necesaria
        const dailyContribution = amountNeeded / daysRemaining;

        // Convertir a frecuencia configurada
        if (goal.contribution_frequency === 'weekly') {
            return dailyContribution * 7;
        } else if (goal.contribution_frequency === 'monthly') {
            return dailyContribution * 30;
        }

        return dailyContribution;
    }
};
