import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, StyleSheet, View, RefreshControl, ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

import { Transaction } from '@/types/database';
import { formatDate, formatTime, formatCurrency } from '@/utils/format';

const TransactionCard = React.memo(({ item }: { item: Transaction }) => (
    <View style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: '#4CAF5010' }]}>
            <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
        </View>
        <View style={styles.cardInfo}>
            <ThemedText style={styles.userName}>{item.perfil?.nombre || 'Empleado'}</ThemedText>
            <ThemedText style={styles.dateText}>{formatDate(item.fecha)} • {formatTime(item.fecha)}</ThemedText>
        </View>
        <ThemedText style={styles.amountText}>{formatCurrency(item.monto_total)}</ThemedText>
    </View>
));

export default function CashierHistoryScreen() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHistory = useCallback(async () => {
        if (!user) return;
        
        try {
            const { data, error } = await supabase
                .from('transacciones')
                .select(`
                    id,
                    monto_total,
                    fecha,
                    tipo,
                    perfil:perfil_id(nombre)
                `)
                .eq('ejecutor_id', user.id)
                .order('fecha', { ascending: false });

            if (error) throw error;
            
            const mappedData: Transaction[] = (data || []).map((item: any) => ({
                ...item,
                perfil: Array.isArray(item.perfil) ? item.perfil[0] : item.perfil
            }));

            setTransactions(mappedData);
        } catch (err) {
            console.error('Error fetching cashier history:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchHistory();
    }, [fetchHistory]);

    const renderItem = useCallback(({ item }: { item: Transaction }) => (
        <TransactionCard item={item} />
    ), []);

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.headerTitle}>Historial de Canjes</ThemedText>
                <ThemedText style={styles.headerSubtitle}>Registros de todas las autorizaciones realizadas por ti.</ThemedText>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#1a237e" />
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a237e']} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={64} color="#ccc" />
                            <ThemedText style={styles.emptyText}>No has realizado canjes aún</ThemedText>
                        </View>
                    }
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        backgroundColor: '#ffffff',
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1a237e',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        flexGrow: 1,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    cardInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    dateText: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    amountText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1a237e',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 16,
        color: '#999',
        fontSize: 16,
        fontWeight: '600',
    },
});
