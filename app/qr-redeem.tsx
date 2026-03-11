import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');
const TOKEN_EXPIRY_MINUTES = 5;

export default function QRRedeemScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<number>(0);

    const generateToken = useCallback(async () => {
        if (!user) return;
        
        setLoading(true);
        try {
            const expiryDate = new Date();
            expiryDate.setMinutes(expiryDate.getMinutes() + TOKEN_EXPIRY_MINUTES);

            const { data, error } = await supabase
                .from('qr_tokens')
                .insert({
                    perfil_id: user.id,
                    expira_at: expiryDate.toISOString(),
                })
                .select('token_auth')
                .single();

            if (data) {
                setToken(data.token_auth);
                const diff = Math.floor((expiryDate.getTime() - new Date().getTime()) / 1000);
                setTimeLeft(diff > 0 ? diff : 0);
            }
            if (error) console.error('Error generating token:', error);
        } catch (err) {
            console.error('Critical error generating token:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        generateToken();
    }, [generateToken]);

    // Timer logic
    useEffect(() => {
        if (timeLeft <= 0 || loading) {
            if (timeLeft === 0 && token) {
                generateToken(); // Refresh if expired
            }
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, loading, token, generateToken]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

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
                        {loading ? (
                            <View style={{ width: width * 0.6, height: width * 0.6, justifyContent: 'center' }}>
                                <ActivityIndicator size="large" color="#1a237e" />
                            </View>
                        ) : token ? (
                            <QRCode
                                value={token}
                                size={width * 0.6}
                                color="#1a237e"
                                backgroundColor="white"
                            />
                        ) : (
                            <ThemedText style={{ color: 'red' }}>Error al generar token</ThemedText>
                        )}
                    </View>

                    <View style={styles.tokenBox}>
                        <ThemedText style={styles.tokenLabel}>Token de Transacción:</ThemedText>
                        <ThemedText style={styles.tokenValue} numberOfLines={1}>
                            {loading ? 'Generando...' : token || '---'}
                        </ThemedText>
                    </View>

                    <View style={[styles.expiryBadge, timeLeft < 60 && { backgroundColor: '#fff1f0' }]}>
                        <Ionicons 
                            name="time-outline" 
                            size={16} 
                            color={timeLeft < 60 ? "#F44336" : "#666"} 
                        />
                        <ThemedText style={[styles.expiryText, timeLeft < 60 && { color: '#F44336' }]}>
                            Expira en {formatTime(timeLeft)}
                        </ThemedText>
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
        color: '#666',
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
