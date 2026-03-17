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
    user: any | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
        // Check for active session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error('Error getting session:', error.message);
                if (error.message.includes('Refresh Token Not Found') || error.message.includes('invalid refresh token')) {
                    signOut();
                    return;
                }
            }
            
            setSession(session);
            if (session) {
                setUser(session.user);
                fetchUserProfile(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'TOKEN_REFRESHED') {
                console.log('Token refreshed successfully');
            }
            
            if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setUserRole(null);
                setIsLoading(false);
                return;
            }

            setSession(session);
            if (session) {
                setIsLoading(true);
                setUser(session.user);
                fetchUserProfile(session.user.id);
            } else {
                setUserRole(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('perfiles')
                .select('rol')
                .eq('id', userId)
                .maybeSingle(); // maybeSingle handles 0 rows gracefully (returns null)

            if (data) {
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
        <AuthContext.Provider value={{ session, userRole, isLoading, signIn, signUp, signOut, user }}>
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
