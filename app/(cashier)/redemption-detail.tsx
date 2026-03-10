import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const CATALOG = [
    { id: '1', name: 'Almuerzo Ejecutivo', cost: 10.00, category: 'Comida' },
    { id: '2', name: 'Bono Combustible', cost: 20.00, category: 'Transporte' },
    { id: '3', name: 'Seguro Dental', cost: 15.00, category: 'Salud' },
    { id: '4', name: 'Gift Card Supermercado', cost: 50.00, category: 'Compras' },
];

export default function RedemptionDetailScreen() {
    const router = useRouter();
    const { employeeId } = useLocalSearchParams();
    const [search, setSearch] = useState('');
    const [selectedItems, setSelectedItems] = useState<{ id: string, name: string, cost: number, qty: number }[]>([]);
    const [confirmModal, setConfirmModal] = useState(false);

    const filteredCatalog = CATALOG.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const addItem = (item: typeof CATALOG[0]) => {
        setSelectedItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const removeItem = (id: string) => {
        setSelectedItems(prev => {
            const existing = prev.find(i => i.id === id);
            if (existing && existing.qty > 1) {
                return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
            }
            return prev.filter(i => i.id !== id);
        });
    };

    const total = selectedItems.reduce((acc, item) => acc + (item.cost * item.qty), 0);
    const employeeBalance = 120.00; // Mock balance

    const handleConfirm = () => {
        if (total > employeeBalance) {
            Alert.alert('Saldo Insuficiente', 'El empleado no tiene suficiente saldo para este canje.');
            return;
        }
        setConfirmModal(false);
        router.replace({
            pathname: '/(cashier)/success',
            params: { total: total.toFixed(2), employeeName: 'Juan Pérez' }
        } as any);
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1a237e" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Detalle de Canje</ThemedText>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileMain}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person" size={40} color="#1a237e" />
                        </View>
                        <View>
                            <ThemedText style={styles.employeeName}>Juan Pérez</ThemedText>
                            <ThemedText style={styles.employeeDept}>Depto. Logística • {employeeId}</ThemedText>
                        </View>
                    </View>
                    <View style={styles.balanceRow}>
                        <ThemedText style={styles.balanceLabel}>Saldo Disponible</ThemedText>
                        <ThemedText style={styles.balanceValue}>${employeeBalance.toFixed(2)}</ThemedText>
                    </View>
                </View>

                {/* Catalog Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Catálogo de Beneficios</ThemedText>
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={20} color="#888" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar beneficio..."
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>

                    <View style={styles.catalogList}>
                        {filteredCatalog.map(item => (
                            <TouchableOpacity key={item.id} style={styles.catalogItem} onPress={() => addItem(item)}>
                                <View style={styles.itemMain}>
                                    <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                                    <ThemedText style={styles.itemCategory}>{item.category}</ThemedText>
                                </View>
                                <ThemedText style={styles.itemCost}>${item.cost}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Summary (Nota de Venta) */}
                {selectedItems.length > 0 && (
                    <View style={styles.summaryCard}>
                        <ThemedText style={styles.summaryTitle}>Resumen de Canje</ThemedText>
                        {selectedItems.map(item => (
                            <View key={item.id} style={styles.summaryRow}>
                                <ThemedText style={styles.sumQty}>{item.qty}x</ThemedText>
                                <ThemedText style={styles.sumName}>{item.name}</ThemedText>
                                <ThemedText style={styles.sumTotal}>${(item.cost * item.qty).toFixed(2)}</ThemedText>
                                <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
                                    <Ionicons name="close-circle" size={20} color="#F44336" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        <View style={styles.divider} />
                        <View style={styles.totalRow}>
                            <ThemedText style={styles.totalLabel}>TOTAL A DESCONTAR</ThemedText>
                            <ThemedText style={styles.totalValue}>${total.toFixed(2)}</ThemedText>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Primary Action */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.confirmActionBtn, total === 0 && styles.disabledBtn]}
                    disabled={total === 0}
                    onPress={() => setConfirmModal(true)}
                >
                    <ThemedText style={styles.confirmActionText}>Confirmar Transacción</ThemedText>
                </TouchableOpacity>
            </View>

            <Modal visible={confirmModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.warningIcon}>
                            <Ionicons name="alert-circle" size={48} color="#FF9800" />
                        </View>
                        <ThemedText style={styles.modalTitle}>¿Confirmar Transacción?</ThemedText>
                        <ThemedText style={styles.modalSub}>
                            Se descontarán <ThemedText style={{ fontWeight: '800' }}>${total.toFixed(2)}</ThemedText> de la cuenta de Juan Pérez.
                        </ThemedText>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setConfirmModal(false)}>
                                <ThemedText style={styles.cancelBtnText}>Volver</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleConfirm}>
                                <ThemedText style={styles.confirmBtnText}>Sí, Confirmar</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 20,
        gap: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#f0f2ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#1a237e' },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
    profileCard: {
        backgroundColor: '#1a237e',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        elevation: 4,
    },
    profileMain: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 20 },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    employeeName: { color: 'white', fontSize: 18, fontWeight: '700' },
    employeeDept: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        borderRadius: 16,
    },
    balanceLabel: { color: 'white', fontSize: 14 },
    balanceValue: { color: 'white', fontSize: 20, fontWeight: '800' },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a237e', marginBottom: 12 },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 16,
    },
    searchInput: { flex: 1, height: 48, marginLeft: 8, fontSize: 16 },
    catalogList: { gap: 10 },
    catalogItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    itemName: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
    itemCategory: { fontSize: 12, color: '#888' },
    itemCost: { fontSize: 16, fontWeight: '700', color: '#1a237e' },
    summaryCard: {
        backgroundColor: '#fffcf0',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#ffecdb',
    },
    summaryTitle: { fontSize: 16, fontWeight: '700', color: '#b28900', marginBottom: 16 },
    summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
    sumQty: { width: 30, fontSize: 14, fontWeight: '700', color: '#666' },
    sumName: { flex: 1, fontSize: 14, color: '#1a1a1a' },
    sumTotal: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
    removeBtn: { padding: 4 },
    divider: { height: 1, backgroundColor: '#ffecdb', marginVertical: 12 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 13, fontWeight: '800', color: '#b28900' },
    totalValue: { fontSize: 24, fontWeight: '900', color: '#1a237e' },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    confirmActionBtn: {
        backgroundColor: '#1a237e',
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 4,
    },
    confirmActionText: { color: 'white', fontSize: 16, fontWeight: '800' },
    disabledBtn: { backgroundColor: '#ccc', elevation: 0 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
    modalContent: { backgroundColor: 'white', borderRadius: 24, padding: 32, alignItems: 'center' },
    warningIcon: { marginBottom: 16 },
    modalTitle: { fontSize: 22, fontWeight: '800', color: '#1a237e', marginBottom: 8, textAlign: 'center' },
    modalSub: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
    modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
    modalBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
    cancelBtn: { backgroundColor: '#f8f9fa' },
    confirmBtn: { backgroundColor: '#1a237e' },
    cancelBtnText: { color: '#666', fontWeight: '700' },
    confirmBtnText: { color: 'white', fontWeight: '700' },
    itemMain: { flex: 1 }
});
