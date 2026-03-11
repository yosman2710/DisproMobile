import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type UserRole = 'empleado' | 'cajero' | 'admin';

type AuthContextType = {
    session: Session | null;
    userRole: UserRole | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, metadata: { cedula: number; nombre: string; rol: UserRole }) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                fetchUserProfile(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth event:', event);
            setSession(session);
            if (session) {
                setIsLoading(true); // Ensure we wait for the profile
                fetchUserProfile(session.user.id);
            } else {
                setUserRole(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserProfile = async (userId: string) => {
        console.log('Fetching profile for:', userId);
        try {
            const { data, error } = await supabase
                .from('perfiles')
                .select('rol')
                .eq('id', userId)
                .maybeSingle(); // maybeSingle handles 0 rows gracefully (returns null)

            if (data) {
                console.log('Profile found, role:', data.rol);
                setUserRole(data.rol as UserRole);
            } else {
                console.warn('No profile found in "perfiles" table for user:', userId);
                setUserRole(null);
            }
            
            if (error) {
                console.error('Database error in fetchUserProfile:', error.message, error.details);
            }
        } catch (error) {
            console.error('Unexpected error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    const signUp = async (email: string, password: string, metadata: { cedula: number; nombre: string; rol: UserRole }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });
        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, userRole, isLoading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
