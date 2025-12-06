import { supabase } from '../supabaseClient';

export interface UserMetadata {
    id: string;
    user_id: string;
    created_at: string;
    account_age_days: number;
    has_completed_tutorial: boolean;
    tutorial_completed_at: string | null;
    last_login_at: string;
    login_count: number;
    is_new_user: boolean;
    preferences: Record<string, any>;
}

export interface UserStats {
    account_age_days: number;
    login_count: number;
    is_new_user: boolean;
    has_completed_tutorial: boolean;
    days_since_tutorial: number | null;
}

class UserMetadataService {
    /**
     * Obtiene los metadatos de un usuario
     */
    async getUserMetadata(userId: string): Promise<UserMetadata | null> {
        try {
            const { data, error } = await supabase
                .from('user_metadata')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No existe metadata, crear una nueva
                    return await this.createUserMetadata(userId);
                }
                console.error('Error fetching user metadata:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getUserMetadata:', error);
            return null;
        }
    }

    /**
     * Crea metadatos para un nuevo usuario
     */
    async createUserMetadata(userId: string): Promise<UserMetadata | null> {
        try {
            const { data, error } = await supabase
                .from('user_metadata')
                .insert({
                    user_id: userId,
                    created_at: new Date().toISOString(),
                    login_count: 1
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating user metadata:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in createUserMetadata:', error);
            return null;
        }
    }

    /**
     * Actualiza el último login y incrementa el contador
     */
    async updateLastLogin(userId: string): Promise<void> {
        try {
            // Usar la función de PostgreSQL para incrementar el contador
            const { error } = await supabase.rpc('increment_login_count', {
                p_user_id: userId
            });

            if (error) {
                console.error('Error updating last login:', error);
            }
        } catch (error) {
            console.error('Error in updateLastLogin:', error);
        }
    }

    /**
     * Marca el tutorial como completado
     */
    async markTutorialComplete(userId: string): Promise<boolean> {
        try {
            const { error } = await supabase.rpc('mark_tutorial_complete', {
                p_user_id: userId
            });

            if (error) {
                console.error('Error marking tutorial complete:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in markTutorialComplete:', error);
            return false;
        }
    }

    /**
     * Obtiene estadísticas del usuario
     */
    async getUserStats(userId: string): Promise<UserStats | null> {
        try {
            const { data, error } = await supabase.rpc('get_user_stats', {
                p_user_id: userId
            });

            if (error) {
                console.error('Error getting user stats:', error);
                return null;
            }

            return data && data.length > 0 ? data[0] : null;
        } catch (error) {
            console.error('Error in getUserStats:', error);
            return null;
        }
    }

    /**
     * Determina si se debe mostrar el tutorial
     * Criterios:
     * 1. Usuario nuevo (menos de 7 días)
     * 2. No ha completado el tutorial
     */
    async shouldShowTutorial(userId: string): Promise<boolean> {
        try {
            const metadata = await this.getUserMetadata(userId);

            if (!metadata) {
                // Si no hay metadata, es un usuario nuevo, mostrar tutorial
                return true;
            }

            // Mostrar tutorial si es usuario nuevo Y no ha completado el tutorial
            return metadata.is_new_user && !metadata.has_completed_tutorial;
        } catch (error) {
            console.error('Error in shouldShowTutorial:', error);
            // En caso de error, no mostrar tutorial para no molestar al usuario
            return false;
        }
    }

    /**
     * Actualiza las preferencias del usuario
     */
    async updatePreferences(userId: string, preferences: Record<string, any>): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('user_metadata')
                .update({ preferences })
                .eq('user_id', userId);

            if (error) {
                console.error('Error updating preferences:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in updatePreferences:', error);
            return false;
        }
    }

    /**
     * Obtiene una preferencia específica
     */
    async getPreference<T = any>(userId: string, key: string, defaultValue: T): Promise<T> {
        try {
            const metadata = await this.getUserMetadata(userId);

            if (!metadata || !metadata.preferences) {
                return defaultValue;
            }

            return metadata.preferences[key] !== undefined
                ? metadata.preferences[key]
                : defaultValue;
        } catch (error) {
            console.error('Error in getPreference:', error);
            return defaultValue;
        }
    }

    /**
     * Establece una preferencia específica
     */
    async setPreference(userId: string, key: string, value: any): Promise<boolean> {
        try {
            const metadata = await this.getUserMetadata(userId);

            if (!metadata) {
                return false;
            }

            const newPreferences = {
                ...metadata.preferences,
                [key]: value
            };

            return await this.updatePreferences(userId, newPreferences);
        } catch (error) {
            console.error('Error in setPreference:', error);
            return false;
        }
    }
}

// Exportar instancia singleton
export const userMetadataService = new UserMetadataService();
