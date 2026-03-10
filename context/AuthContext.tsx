import React, { createContext, useContext, useEffect, useState } from 'react';

export type UserRole = 'employee' | 'cashier';

type AuthContextType = {
    session: string | null;
    userRole: UserRole | null;
    isLoading: boolean;
    signIn: (role?: UserRole) => void;
    signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate checking for an existing session
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, []);

    const signIn = (role: UserRole = 'employee') => {
        // Simulate a sign in
        setSession('fake-jwt-token');
        setUserRole(role);
    };

    const signOut = () => {
        setSession(null);
        setUserRole(null);
    };

    return (
        <AuthContext.Provider value={{ session, userRole, isLoading, signIn, signOut }}>
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
