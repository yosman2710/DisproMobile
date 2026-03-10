import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const { width } = Dimensions.get('window');

export default function QRRedeemScreen() {
    const router = useRouter();
    const mockValue = 'DISPRO-MOCK-TOKEN-12345';

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#1a237e" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Canjear Moneda</ThemedText>
                <View style={{ width: 20 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.qrCard}>
                    <ThemedText style={styles.instruction}>
                        Muestra este código al supervisor para autorizar tu canje.
                    </ThemedText>

                    <View style={styles.qrWrapper}>
                        <QRCode
                            value={mockValue}
                            size={width * 0.6}
                            color="#1a237e"
                            backgroundColor="white"
                        />
                    </View>

                    <View style={styles.tokenBox}>
                        <ThemedText style={styles.tokenLabel}>Token de Transacción:</ThemedText>
                        <ThemedText style={styles.tokenValue}>{mockValue}</ThemedText>
                    </View>

                    <View style={styles.expiryBadge}>
                        <Ionicons name="time-outline" size={16} color="#F44336" />
                        <ThemedText style={styles.expiryText}>Expira en 09:59</ThemedText>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => router.back()}
                >
                    <ThemedText style={styles.cancelBtnText}>Cancelar Canje</ThemedText>
                </TouchableOpacity>
            </View>
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
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#f8f9fa',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1a237e',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        paddingBottom: 40,
    },
    qrCard: {
        backgroundColor: '#ffffff',
        borderRadius: 32,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    instruction: {
        textAlign: 'center',
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
        marginBottom: 30,
    },
    qrWrapper: {
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 30,
    },
    tokenBox: {
        alignItems: 'center',
        marginBottom: 24,
    },
    tokenLabel: {
        fontSize: 12,
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    tokenValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1a237e',
        letterSpacing: 0.5,
    },
    expiryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff1f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    expiryText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#F44336',
    },
    cancelBtn: {
        marginTop: 32,
        alignSelf: 'center',
        padding: 10,
    },
    cancelBtnText: {
        color: '#888',
        fontSize: 15,
        fontWeight: '600',
    },
});
