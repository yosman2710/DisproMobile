import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, RefreshControl } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: number;
  tipo: 'deposito' | 'canje';
  monto_total: number;
  fecha: string;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [profileName, setProfileName] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [recentMovements, setRecentMovements] = useState<Transaction[]>([]);

  const fetchProfileData = useCallback(async () => {
    if (!user) return;
    
    try {
      // Fetch profile and balance
      const { data: profile, error: profileError } = await supabase
        .from('perfiles')
        .select('nombre, saldo_actual')
        .eq('id', user.id)
        .single();

      if (profile) {
        setBalance(profile.saldo_actual);
        setProfileName(profile.nombre);
      }
      if (profileError) console.error('Error fetching profile balance:', profileError);

      // Fetch last 3 transactions
      const { data: transactions, error: transError } = await supabase
        .from('transacciones')
        .select('id, tipo, monto_total, fecha')
        .eq('perfil_id', user.id)
        .order('fecha', { ascending: false })
        .limit(3);

      if (transactions) {
        setRecentMovements(transactions);
      }
      if (transError) console.error('Error fetching transactions:', transError);

    } catch (err) {
      console.error('Error in fetchProfileData:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  }, [fetchProfileData]);

  const getMovementStyle = (tipo: string) => {
    return tipo === 'deposito' 
      ? { icon: 'trending-up', color: '#4CAF50', label: 'Depósito', prefix: '+' }
      : { icon: 'cart', color: '#F44336', label: 'Canje', prefix: '-' };
  };

  const renderMovement = (item: Transaction) => {
    const style = getMovementStyle(item.tipo);
    const date = new Date(item.fecha);
    const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) + ', ' + 
                    date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    return (
      <View key={item.id} style={styles.movementCard}>
        <View style={[styles.iconContainer, { backgroundColor: style.color + '10' }]}>
          <Ionicons name={style.icon as any} size={22} color={style.color} />
        </View>
        <View style={styles.movementInfo}>
          <ThemedText style={styles.movementTypeText}>{style.label}</ThemedText>
          <ThemedText style={styles.movementDateText}>{dateStr}</ThemedText>
        </View>
        <ThemedText style={[styles.movementAmountText, { color: style.color }]}>
          {style.prefix}{item.monto_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </ThemedText>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>DisproMovil</ThemedText>
        <View style={styles.headerTop}>
          <ThemedText style={styles.welcomeTitle}>Hola, {profileName || 'Usuario'} 👋</ThemedText>
          <TouchableOpacity
            onPress={() => signOut()}
            style={styles.logoutBtn}
          >
            <Ionicons name="log-out-outline" size={22} color="#F44336" />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <LinearGradient
            colors={['#ffffff', '#f8f9fa']}
            style={styles.balanceGradient}
          >
            <ThemedText style={styles.balanceLabel}>Saldo Disponible</ThemedText>
            <ThemedText style={styles.balanceValue}>
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </ThemedText>
          </LinearGradient>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a237e']} />
        }
      >
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/qr-redeem')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#1a237e', '#3f51b5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionGradient}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="qr-code" size={28} color="white" />
            </View>
            <View>
              <ThemedText style={styles.actionTitle}>Canjear Moneda</ThemedText>
              <ThemedText style={styles.actionSub}>Genera tu código QR ahora</ThemedText>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Últimos Movimientos</ThemedText>
          <TouchableOpacity onPress={() => router.push('/explore')}>
            <ThemedText style={styles.seeAllLink}>Ver todo</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.movementsContainer}>
          {recentMovements.length > 0 ? (
            recentMovements.map(renderMovement)
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="receipt-outline" size={48} color="#ccc" />
              <ThemedText style={styles.emptyStateText}>No tienes transacciones en este momento</ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2835cbff',
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#98999fff',
  },
  logoutBtn: {
    padding: 10,
    backgroundColor: '#fff1f0',
    borderRadius: 12,
  },
  balanceCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  balanceGradient: {
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 30,
    fontWeight: '800',
    color: '#232121ff',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffcf0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#ffecb3',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#b28900',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  actionCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    elevation: 6,
    shadowColor: '#3f51b5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  actionSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a237e',
  },
  seeAllLink: {
    fontSize: 14,
    color: '#3f51b5',
    fontWeight: '600',
  },
  movementsContainer: {
    gap: 12,
  },
  movementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  movementInfo: {
    flex: 1,
  },
  movementTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  movementDateText: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  movementAmountText: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyStateText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
});
