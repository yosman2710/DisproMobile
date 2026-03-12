import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { ActivityIndicator, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';

export default function CashierScannerScreen() {
    const router = useRouter();
    const { signOut, user } = useAuth();
    const [permission, requestPermission] = useCameraPermissions();
    const [manualIdModal, setManualIdModal] = useState(false);
    const [manualId, setManualId] = useState('');
    const [isScanning, setIsScanning] = useState(true);

    if (!permission) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#1a237e" />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Ionicons name="camera-outline" size={64} color="#1a237e" />
                    <ThemedText style={styles.permissionTitle}>Permiso de Cámara</ThemedText>
                    <ThemedText style={styles.permissionSub}>Necesitamos acceso a tu cámara para escanear los códigos QR de los empleados.</ThemedText>
                    <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                        <ThemedText style={styles.permissionBtnText}>Conceder Permiso</ThemedText>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        );
    }

    const handleBarCodeScanned = useCallback(({ data }: { data: string }) => {
        if (!isScanning) return;
        setIsScanning(false);
        router.push({
            pathname: '/(cashier)/redemption-detail',
            params: { tokenAuth: data }
        } as any);

        setTimeout(() => setIsScanning(true), 2000);
    }, [isScanning, router]);

    const handleManualEntry = useCallback(() => {
        if (!manualId) return;
        setManualIdModal(false);
        router.push({
            pathname: '/(cashier)/redemption-detail',
            params: { tokenAuth: manualId }
        } as any);
        setManualId('');
    }, [manualId, router]);

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <ThemedText style={styles.title}>DisproMovil</ThemedText>
                        <ThemedText style={styles.roleSub}>Hola, {user?.user_metadata.nombre} 👋</ThemedText>
                        <ThemedText style={styles.roleSub}>Bienvenido al Panel de Caja 💰</ThemedText>
                    </View>
                    <TouchableOpacity onPress={() => signOut()} style={styles.logoutBtn}>
                        <Ionicons name="log-out-outline" size={22} color="#F44336" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.scannerContainer}>
                <CameraView
                    style={styles.camera}
                    facing="back"
                    onBarcodeScanned={handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                    }}
                />
                <View style={styles.overlay}>
                    <View style={styles.unfocusedContainer} />
                    <View style={styles.middleContainer}>
                        <View style={styles.unfocusedContainer} />
                        <View style={styles.focusedContainer}>
                            <View style={styles.cornerTopLeft} />
                            <View style={styles.cornerTopRight} />
                            <View style={styles.cornerBottomLeft} />
                            <View style={styles.cornerBottomRight} />
                        </View>
                        <View style={styles.unfocusedContainer} />
                    </View>
                    <View style={styles.unfocusedContainer}>
                        <ThemedText style={styles.scanText}>Alinea el código QR dentro del recuadro</ThemedText>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.manualBtn}
                    onPress={() => setManualIdModal(true)}
                >
                    <Ionicons name="create-outline" size={24} color="#1a237e" />
                    <ThemedText style={styles.manualBtnText}>Ingreso Manual</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.historyBtn}
                    onPress={() => router.push('/(cashier)/history' as any)}
                >
                    <Ionicons name="time-outline" size={24} color="#666" />
                    <ThemedText style={styles.historyBtnText}>Turno Actual</ThemedText>
                </TouchableOpacity>
            </View>

            <Modal
                visible={manualIdModal}
                transparent
                animationType="fade"
                onRequestClose={() => setManualIdModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ThemedText style={styles.modalTitle}>Ingreso Manual</ThemedText>
                        <ThemedText style={styles.modalSub}>Ingresa el ID del empleado que aparece bajo su QR.</ThemedText>

                        <TextInput
                            style={styles.input}
                            placeholder="Ej: EMP-001"
                            value={manualId}
                            onChangeText={setManualId}
                            autoFocus
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setManualIdModal(false)}
                            >
                                <ThemedText style={styles.cancelBtnText}>Cancelar</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.confirmBtn]}
                                onPress={handleManualEntry}
                            >
                                <ThemedText style={styles.confirmBtnText}>Buscar</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: '#ffffff',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#2835cbff',
    },
    roleSub: {
        fontSize: 13,
        color: '#888',
        fontWeight: '600',
    },
    logoutBtn: {
        padding: 10,
        backgroundColor: '#fff1f0',
        borderRadius: 12,
    },
    scannerContainer: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    unfocusedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    middleContainer: {
        flexDirection: 'row',
        height: 250,
    },
    focusedContainer: {
        width: 250,
        height: 250,
        backgroundColor: 'transparent',
        position: 'relative',
    },
    scanText: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 20,
        fontWeight: '500',
    },
    cornerTopLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 40,
        height: 40,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#ffffff',
    },
    cornerTopRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 40,
        height: 40,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: '#ffffff',
    },
    cornerBottomLeft: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#ffffff',
    },
    cornerBottomRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: '#ffffff',
    },
    footer: {
        padding: 24,
        flexDirection: 'row',
        gap: 12,
    },
    manualBtn: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f2ff',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: '#e0e4ff',
    },
    manualBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1a237e',
    },
    historyBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    historyBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginTop: 2,
    },
    permissionContainer: {
        flex: 1,
        padding: 40,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
    permissionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1a237e',
        marginVertical: 16,
    },
    permissionSub: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    permissionBtn: {
        backgroundColor: '#1a237e',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        elevation: 4,
    },
    permissionBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1a237e',
        marginBottom: 8,
    },
    modalSub: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 24,
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: '#f8f9fa',
    },
    cancelBtnText: {
        color: '#666',
        fontWeight: '700',
    },
    confirmBtn: {
        backgroundColor: '#1a237e',
    },
    confirmBtnText: {
        color: 'white',
        fontWeight: '700',
    },
});
