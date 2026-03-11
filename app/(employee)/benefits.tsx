import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, ImageBackground, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

interface Benefit {
    id: number;
    nombre: string;
    costo_moneda: number;
    stock: number;
    descripcion?: string;
    imagen_url?: string;
}

// Mapeo de imágenes locales para resolver strings de la base de datos
const IMAGE_MAPPING: Record<string, any> = {
    'almuerzos': require('@/assets/images/almuerzos.png'),
    'cine': require('@/assets/images/cine.png'),
    'gift_card': require('@/assets/images/gift_card.png'),
};

export default function BenefitsScreen() {
    const [benefits, setBenefits] = useState<Benefit[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBenefits = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('beneficios')
                .select('*')
                .order('nombre');

            if (error) {
                console.error('Database error fetching benefits:', error);
            } else {
                setBenefits(data || []);
            }
        } catch (err) {
            console.error('Critical error in fetchBenefits:', err);
        }
    }, []);

    useEffect(() => {
        fetchBenefits();
    }, [fetchBenefits]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchBenefits();
        setRefreshing(false);
    }, [fetchBenefits]);

    const renderItem = ({ item }: { item: Benefit }) => {
        const localSource = IMAGE_MAPPING[item.imagen_url || ''] || IMAGE_MAPPING['gift_card'];

        return (
            <TouchableOpacity style={styles.card} activeOpacity={0.9}>
                <ImageBackground
                    source={localSource}
                    style={styles.cardImage}
                    imageStyle={styles.imageRadius}
                >
                    <LinearGradient
                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)']}
                        style={styles.cardGradient}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.stockBadge}>
                                <ThemedText style={styles.stockText}>{item.stock} disp.</ThemedText>
                            </View>
                        </View>

                        <View style={styles.cardFooter}>
                            <ThemedText style={styles.cardName} numberOfLines={1}>{item.nombre}</ThemedText>
                            <View style={styles.footerRow}>
                                <View style={styles.costContainer}>
                                    <ThemedText style={styles.costText}>
                                        ${item.costo_moneda.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                    </ThemedText>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </ImageBackground>
            </TouchableOpacity>
        );
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <ThemedText style={styles.headerTitle}>Beneficios</ThemedText>
                    <TouchableOpacity onPress={() => onRefresh()} style={styles.refreshIcon}>
                        <Ionicons name="refresh" size={20} color="#1a237e" />
                    </TouchableOpacity>
                </View>
                <ThemedText style={styles.headerSubtitle}>Tus puntos acumulados te esperan. Elige tu recompensa favorita.</ThemedText>
            </View>

            <FlatList
                data={benefits}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a237e']} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyStateContainer}>
                        <Ionicons name="gift-outline" size={80} color="#f0f0f0" />
                        <ThemedText style={styles.emptyStateTitle}>¡Aún no hay beneficios!</ThemedText>
                        <ThemedText style={styles.emptyStateText}>Estamos preparando las mejores recompensas para ti. Vuelve pronto.</ThemedText>
                    </View>
                }
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
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    refreshIcon: {
        padding: 8,
        backgroundColor: '#f0f2ff',
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1a237e',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        lineHeight: 20,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.5,
        borderRadius: 28,
        marginBottom: 20,
        backgroundColor: '#f8f9fa',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        overflow: 'hidden',
    },
    cardImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    imageRadius: {
        borderRadius: 28,
    },
    cardGradient: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    stockBadge: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    stockText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '800',
    },
    cardFooter: {
        gap: 8,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardName: {
        fontSize: 18,
        fontWeight: '900',
        color: '#ffffff',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    costContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    costText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFD700',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        paddingHorizontal: 40,
    },
    emptyStateTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#333',
        marginTop: 20,
        marginBottom: 8,
    },
    emptyStateText: {
        color: '#999',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
});
