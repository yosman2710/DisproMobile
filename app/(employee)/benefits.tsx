import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

const BENEFITS = [
    { id: '1', name: 'Vale de Almuerzo', cost: '50.00', icon: 'fast-food', color: '#FF9800', desc: 'Canjeable en cafetería' },
    { id: '2', name: 'Día Libre', cost: '500.00', icon: 'calendar', color: '#2196F3', desc: 'Previa autorización' },
    { id: '3', name: 'Bono Cine', cost: '120.00', icon: 'film', color: '#E91E63', desc: 'Válido para 2 personas' },
    { id: '4', name: 'Gift Card $20', cost: '200.00', icon: 'gift', color: '#9C27B0', desc: 'Tiendas afiliadas' },
    { id: '5', name: 'Kit Escolar', cost: '150.00', icon: 'book', color: '#4CAF50', desc: 'Útiles básicos' },
    { id: '6', name: 'Suscripciones', cost: '300.00', icon: 'fitness', color: '#FF5722', desc: 'Gimnasio o Streaming' },
];

export default function BenefitsScreen() {
    const renderItem = ({ item }: { item: typeof BENEFITS[0] }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.9}>
            <View style={[styles.iconContainer, { backgroundColor: item.color + '10' }]}>
                <Ionicons name={item.icon as any} size={36} color={item.color} />
            </View>
            <View style={styles.cardContent}>
                <ThemedText style={styles.cardName} numberOfLines={1}>{item.name}</ThemedText>
                <ThemedText style={styles.cardDesc} numberOfLines={1}>{item.desc}</ThemedText>

                <View style={styles.costRow}>
                    <View style={styles.costBadge}>
                        <Ionicons name="flash" size={12} color="#b28900" />
                        <ThemedText style={styles.costText}>{item.cost}</ThemedText>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.headerTitle}>Beneficios</ThemedText>
                <ThemedText style={styles.headerSubtitle}>Canjea tus puntos acumulados por recompensas exclusivas.</ThemedText>
            </View>

            <FlatList
                data={BENEFITS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
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
        fontSize: 28,
        fontWeight: '800',
        color: '#1a237e',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        lineHeight: 20,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#ffffff',
        borderRadius: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    iconContainer: {
        width: '100%',
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContent: {
        padding: 14,
    },
    cardName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    cardDesc: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
        marginBottom: 10,
    },
    costRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    costBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffcf0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        gap: 4,
        borderWidth: 1,
        borderColor: '#ffecb3',
    },
    costText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#b28900',
    },

});
