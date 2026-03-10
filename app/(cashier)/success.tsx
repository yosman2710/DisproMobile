import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function RedemptionSuccessScreen() {
    const router = useRouter();
    const { total, employeeName } = useLocalSearchParams();

    return (
        <ThemedView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.successIconBox}>
                    <Ionicons name="checkmark-done-circle" size={100} color="#4CAF50" />
                </View>

                <ThemedText style={styles.successTitle}>¡Canje Exitoso!</ThemedText>
                <ThemedText style={styles.successSub}>La transacción ha sido procesada correctamente.</ThemedText>

                <View style={styles.ticketCard}>
                    <View style={styles.ticketHeader}>
                        <ThemedText style={styles.ticketLabel}>RESUMEN DE OPERACIÓN</ThemedText>
                    </View>

                    <View style={styles.ticketRow}>
                        <ThemedText style={styles.rowLabel}>Empleado</ThemedText>
                        <ThemedText style={styles.rowValue}>{employeeName}</ThemedText>
                    </View>

                    <View style={styles.ticketRow}>
                        <ThemedText style={styles.rowLabel}>Monto Descontado</ThemedText>
                        <ThemedText style={[styles.rowValue, { color: '#F44336' }]}>-${total}</ThemedText>
                    </View>

                    <View style={styles.ticketRow}>
                        <ThemedText style={styles.rowLabel}>Nuevo Saldo</ThemedText>
                        <ThemedText style={[styles.rowValue, { color: '#1a237e' }]}>$90.00</ThemedText>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.ticketRow}>
                        <ThemedText style={styles.rowLabel}>Fecha</ThemedText>
                        <ThemedText style={styles.rowValue}>10 Mar 2026</ThemedText>
                    </View>

                    <View style={styles.ticketRow}>
                        <ThemedText style={styles.rowLabel}>Hora</ThemedText>
                        <ThemedText style={styles.rowValue}>11:45 AM</ThemedText>
                    </View>

                    <View style={styles.idContainer}>
                        <ThemedText style={styles.idLabel}>ID TRANSACCIÓN: TR-8829</ThemedText>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => router.replace('/(cashier)' as any)}
                >
                    <ThemedText style={styles.primaryBtnText}>Volver al Escáner</ThemedText>
                    <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    content: { flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center' },
    successIconBox: { marginBottom: 24, elevation: 10, shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
    successTitle: { fontSize: 28, fontWeight: '900', color: '#1a237e', marginBottom: 12 },
    successSub: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
    ticketCard: {
        width: '100%',
        backgroundColor: '#f8f9fa',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#eee',
        borderStyle: 'dashed',
    },
    ticketHeader: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 16, marginBottom: 16, alignItems: 'center' },
    ticketLabel: { fontSize: 12, fontWeight: '800', color: '#888', letterSpacing: 1.5 },
    ticketRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    rowLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
    rowValue: { fontSize: 14, color: '#1a1a1a', fontWeight: '700' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
    idContainer: { marginTop: 8, alignItems: 'center' },
    idLabel: { fontSize: 10, color: '#aaa', fontWeight: '700' },
    footer: { padding: 24 },
    primaryBtn: {
        backgroundColor: '#1a237e',
        paddingVertical: 18,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
    primaryBtnText: { color: 'white', fontSize: 16, fontWeight: '800' },
});
