import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const CASHIER_MOVEMENTS = [
    { id: '1', type: 'Canje', amount: '50.00', date: '10 Mar 2026', time: '10:30 AM', user: 'Juan Pérez', icon: 'checkmark-circle', color: '#4CAF50' },
    { id: '2', type: 'Canje', amount: '120.00', date: '10 Mar 2026', time: '09:15 AM', user: 'María López', icon: 'checkmark-circle', color: '#4CAF50' },
    { id: '3', type: 'Canje', amount: '200.00', date: '09 Mar 2026', time: '04:45 PM', user: 'Carlos Ruiz', icon: 'checkmark-circle', color: '#4CAF50' },
    { id: '4', type: 'Canje', amount: '75.00', date: '09 Mar 2026', time: '11:20 AM', user: 'Ana García', icon: 'checkmark-circle', color: '#4CAF50' },
];

export default function CashierHistoryScreen() {
    const renderItem = ({ item }: { item: typeof CASHIER_MOVEMENTS[0] }) => (
        <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: item.color + '10' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <View style={styles.cardInfo}>
                <ThemedText style={styles.userName}>{item.user}</ThemedText>
                <ThemedText style={styles.dateText}>{item.date} • {item.time}</ThemedText>
            </View>
            <ThemedText style={styles.amountText}>${item.amount}</ThemedText>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.headerTitle}>Historial de Canjes</ThemedText>
                <ThemedText style={styles.headerSubtitle}>Registros de todas las autorizaciones realizadas.</ThemedText>
            </View>

            <FlatList
                data={CASHIER_MOVEMENTS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
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
});
