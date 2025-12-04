
import { supabase } from '../supabaseClient';
import { UserFinancialProfile, FinancialRecommendation, RecommendationStatus } from '../types';

// Helper de seguridad
const getAuthenticatedUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
        throw new Error("Violación de seguridad: Intento de acceso sin sesión válida.");
    }
    return session.user;
};

export const dbProfile = {
    // --- Perfil Financiero ---
    getProfile: async (): Promise<UserFinancialProfile | null> => {
        const user = await getAuthenticatedUser();
        const { data, error } = await supabase
            .from('user_financial_profile')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignorar error si no existe perfil
        return data;
    },

    saveProfile: async (profile: Partial<UserFinancialProfile>): Promise<UserFinancialProfile> => {
        const user = await getAuthenticatedUser();

        // Verificar si existe para hacer update o insert
        const existing = await dbProfile.getProfile();

        let result;
        if (existing) {
            const { data, error } = await supabase
                .from('user_financial_profile')
                .update({ ...profile, updated_at: new Date().toISOString() })
                .eq('user_id', user.id)
                .select()
                .single();
            if (error) throw error;
            result = data;
        } else {
            const { data, error } = await supabase
                .from('user_financial_profile')
                .insert({ ...profile, user_id: user.id })
                .select()
                .single();
            if (error) throw error;
            result = data;
        }
        return result;
    },

    // --- Recomendaciones ---
    getRecommendations: async (): Promise<FinancialRecommendation[]> => {
        const user = await getAuthenticatedUser();
        const { data, error } = await supabase
            .from('financial_recommendations')
            .select('*')
            .eq('user_id', user.id)
            .neq('status', 'dismissed')
            .order('priority', { ascending: false }) // High priority first
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    saveRecommendations: async (recommendations: Omit<FinancialRecommendation, 'id' | 'created_at' | 'user_id'>[]): Promise<void> => {
        const user = await getAuthenticatedUser();

        // Preparar datos con user_id
        const recsToInsert = recommendations.map(rec => ({
            ...rec,
            user_id: user.id,
            status: rec.status || 'pending'
        }));

        // Insertar nuevas recomendaciones
        const { error } = await supabase
            .from('financial_recommendations')
            .insert(recsToInsert);

        if (error) throw error;
    },

    updateRecommendationStatus: async (id: string, status: RecommendationStatus): Promise<void> => {
        const user = await getAuthenticatedUser();
        const updateData: any = { status };

        if (status === 'dismissed') {
            updateData.dismissed_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('financial_recommendations')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;
    },

    clearOldRecommendations: async (): Promise<void> => {
        const user = await getAuthenticatedUser();
        // Eliminar recomendaciones pendientes antiguas (ej. > 30 días)
        // O marcarlas como dismissed
        // Esta lógica podría ser más compleja o manejada por un trigger/cron
    }
};
