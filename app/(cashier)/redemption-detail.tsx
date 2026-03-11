import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Benefit {
    id: number;
    nombre: string;
    costo_moneda: number;
    stock: number;
}

export default function RedemptionDetailScreen() {
    const router = useRouter();
    const { user: cashier } = useAuth();
    const { tokenAuth } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [validating, setValidating] = useState(false);
    const [employee, setEmployee] = useState<{ id: string, nombre: string, saldo_actual: number } | null>(null);
    const [catalog, setCatalog] = useState<Benefit[]>([]);
    const [search, setSearch] = useState('');
    const [selectedItems, setSelectedItems] = useState<{ id: number, name: string, cost: number, qty: number }[]>([]);
    const [confirmModal, setConfirmModal] = useState(false);

    const fetchData = useCallback(async () => {
        if (!tokenAuth) return;
        
        setLoading(true);
        try {
            const { data: tokenData, error: tokenError } = await supabase
                .from('qr_tokens')
                .select(`
                    usado,
                    expira_at,
                    perfil:perfil_id(id, nombre, saldo_actual)
                `)
                .eq('token_auth', tokenAuth)
                .single();

            if (tokenError || !tokenData) {
                Alert.alert('Error', 'Código QR no reconocido o inexistente.');
                router.back();
                return;
            }

            const now = new Date();
            const expiry = new Date(tokenData.expira_at);

            if (tokenData.usado) {
                Alert.alert('Código Inválido', 'Este código ya ha sido utilizado.');
                router.back();
                return;
            }

            if (expiry < now) {
                Alert.alert('Código Expirado', 'Este código ha expirado. El empleado debe generar uno nuevo.');
                router.back();
                return;
            }

            setEmployee(tokenData.perfil as any);

            const { data: benefits, error: benefitsError } = await supabase
                .from('beneficios')
                .select('*')
                .gt('stock', 0)
                .order('nombre');

            if (benefits) setCatalog(benefits);
            if (benefitsError) console.error('Error fetching catalog:', benefitsError);

        } catch (err) {
            console.error('Critical error in fetchData:', err);
            Alert.alert('Error', 'Hubo un problema al validar el código.');
            router.back();
        } finally {
            setLoading(false);
        }
    }, [tokenAuth]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredCatalog = catalog.filter(item =>
        item.nombre.toLowerCase().includes(search.toLowerCase())
    );

    const addItem = (item: Benefit) => {
        setSelectedItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { id: item.id, name: item.nombre, cost: item.costo_moneda, qty: 1 }];
        });
    };

    const removeItem = (id: number) => {
        setSelectedItems(prev => {
            const existing = prev.find(i => i.id === id);
            if (existing && existing.qty > 1) {
                return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
            }
            return prev.filter(i => i.id !== id);
        });
    };

    const total = selectedItems.reduce((acc, item) => acc + (item.cost * item.qty), 0);
    const employeeBalance = employee?.saldo_actual || 0;

    const handleConfirm = async () => {
        if (!employee || !cashier || !tokenAuth) return;
        
        if (total > employeeBalance) {
            Alert.alert('Saldo Insuficiente', 'El empleado no tiene suficiente saldo para este canje.');
            return;
        }

        setValidating(true);
        try {
            const { error } = await supabase.rpc('realizar_canje_seguro', {
                p_token: tokenAuth,
                p_cajero_id: cashier.id,
                p_monto_total: total,
                p_motivo: `Canje de ${selectedItems.length} beneficios`
            });

            if (error) throw error;

            setConfirmModal(false);
            router.replace({
                pathname: '/(cashier)/success',
                params: { 
                    total: total.toFixed(2), 
                    employeeName: employee.nombre,
                    newBalance: (employee.saldo_actual - total).toFixed(2),
                    timestamp: new Date().toISOString()
                }
            });

        } catch (err: any) {
            console.error('Error processing redemption:', err);
            Alert.alert('Error', err.message || 'No se pudo procesar el canje.');
        } finally {
            setValidating(false);
        }
    };

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#1a237e" />
                <ThemedText style={{ marginTop: 20 }}>Validando Token...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1a237e" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Detalle de Canje</ThemedText>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.profileCard}>
                    <View style={styles.profileMain}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person" size={40} color="#1a237e" />
                        </View>
                        <View>
                            <ThemedText style={styles.employeeName}>{employee?.nombre || 'Empleado'}</ThemedText>
                            <ThemedText style={styles.employeeDept}>Saldo Disponible para Canje</ThemedText>
                        </View>
                    </View>
                    <View style={styles.balanceRow}>
                        <ThemedText style={styles.balanceLabel}>Saldo Actual</ThemedText>
                        <ThemedText style={styles.balanceValue}>${employeeBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</ThemedText>
                    </View>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Catálogo de Beneficios DISPRO</ThemedText>
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
                                    <ThemedText style={styles.itemName}>{item.nombre}</ThemedText>
                                    <ThemedText style={styles.itemCategory}>Stock: {item.stock}</ThemedText>
                                </View>
                                <ThemedText style={styles.itemCost}>${item.costo_moneda.toLocaleString('en-US', { minimumFractionDigits: 0 })}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {selectedItems.length > 0 && (
                    <View style={styles.summaryCard}>
                        <ThemedText style={styles.summaryTitle}>Resumen de Canje</ThemedText>
                        {selectedItems.map(item => (
                            <View key={item.id} style={styles.summaryRow}>
                                <ThemedText style={styles.sumQty}>{item.qty}x</ThemedText>
                                <ThemedText style={styles.sumName}>{item.name}</ThemedText>
                                <ThemedText style={styles.sumTotal}>${(Number(item.cost) * Number(item.qty)).toFixed(2)}</ThemedText>
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
                            Se descontarán <ThemedText style={{ fontWeight: '800' }}>${total.toFixed(2)}</ThemedText> de la cuenta de {employee?.nombre}.
                        </ThemedText>

                        {validating ? (
                            <ActivityIndicator size="large" color="#1a237e" />
                        ) : (
                            <View style={styles.modalActions}>
                                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setConfirmModal(false)}>
                                    <ThemedText style={styles.cancelBtnText}>Volver</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleConfirm}>
                                    <ThemedText style={styles.confirmBtnText}>Sí, Confirmar</ThemedText>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    center: { justifyContent: 'center', alignItems: 'center' },
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
