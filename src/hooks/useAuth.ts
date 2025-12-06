/**
 * Hook para manejar autenticación y sesión de usuario
 */

import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';

export const useAuth = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Obtener sesión inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsLoading(false);
        });

        // Escuchar cambios de autenticación
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    /**
     * Carga el perfil del usuario desde Supabase
     */
    const loadUserProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;

            if (data) {
                setUserProfile(data as UserProfile);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    };

    /**
     * Actualiza el perfil del usuario
     */
    const updateUserProfile = async (profile: Partial<UserProfile>) => {
        if (!session?.user?.id) return;

        try {
            const { error } = await supabase
                .from('user_profiles')
                .update(profile)
                .eq('user_id', session.user.id);

            if (error) throw error;

            setUserProfile(prev => prev ? { ...prev, ...profile } : null);
        } catch (error) {
            console.error('Error updating user profile:', error);
        }
    };

    /**
     * Cierra sesión
     */
    const signOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUserProfile(null);
    };

    return {
        session,
        userProfile,
        isLoading,
        loadUserProfile,
        updateUserProfile,
        setUserProfile,
        signOut,
    };
};
