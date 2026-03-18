import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Modal, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChangePasswordModal } from '@/components/ChangePasswordModal';
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
  motivo?: string;
  ejecutor?: { nombre: string };
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { signOut, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [balance, setBalance] = useState<number>(0);
  const [profileName, setProfileName] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [recentMovements, setRecentMovements] = useState<Transaction[]>([]);
  const [selectedItem, setSelectedItem] = useState<Transaction | null>(null);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);

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
        .select('id, tipo, monto_total, fecha, motivo, ejecutor:ejecutor_id(nombre)')
        .eq('perfil_id', user.id)
        .order('fecha', { ascending: false })
        .limit(3);

      if (transactions) {
        const formatted = (transactions as any[]).map(t => ({
          ...t,
          ejecutor: Array.isArray(t.ejecutor) ? t.ejecutor[0] : t.ejecutor
        }));
        setRecentMovements(formatted);
      }
      if (transError) console.error('Error fetching transactions:', transError);

    } catch (err) {
      console.error('Error in fetchProfileData:', err);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [fetchProfileData])
  );

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
      <TouchableOpacity
        key={item.id}
        style={styles.movementCard}
        onPress={() => setSelectedItem(item)}
        activeOpacity={0.7}
      >
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
        <Ionicons name="chevron-forward" size={16} color="#ccc" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <ThemedText style={styles.title}>DisproMovil</ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => setIsChangePasswordVisible(true)}
              style={[styles.logoutBtn, { backgroundColor: 'rgba(0, 122, 255, 0.05)', marginRight: 10 }]}
            >
              <Ionicons name="key-outline" size={22} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => signOut()}
              style={styles.logoutBtn}
            >
              <Ionicons name="log-out-outline" size={22} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>

        <ThemedText style={styles.welcomeTitle}>Hola, {profileName || 'Usuario'} 👋</ThemedText>


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

      <Modal
        visible={!!selectedItem}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Detalle de Transacción</ThemedText>
              <TouchableOpacity onPress={() => setSelectedItem(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedItem && (() => {
              const style = getMovementStyle(selectedItem.tipo);
              const date = new Date(selectedItem.fecha);
              const fullDate = date.toLocaleString('es-ES', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              });

              return (
                <View style={styles.detailsList}>
                  <DetailRow label="Tipo de Operación" value={style.label} color={style.color} />
                  <DetailRow
                    label="Monto total"
                    value={`${style.prefix}${selectedItem.monto_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    color={style.color}
                    bold
                  />
                  <DetailRow label="Fecha y Hora" value={fullDate} />
                  {selectedItem.motivo && <DetailRow label="Concepto/Motivo" value={selectedItem.motivo} />}
                  <DetailRow label="Autorizado por" value={selectedItem.ejecutor?.nombre || 'Sistema'} />

                  <View style={styles.modalDivider} />

                  <ThemedText style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
                    ID de transacción: {selectedItem.id}
                  </ThemedText>
                </View>
              );
            })()}

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setSelectedItem(null)}
            >
              <ThemedText style={styles.closeModalBtnText}>Cerrar Detalle</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>

      <ChangePasswordModal
        visible={isChangePasswordVisible}
        onClose={() => setIsChangePasswordVisible(false)}
      />
    </ThemedView>
  );
}

function DetailRow({ label, value, color, bold }: { label: string, value: string, color?: string, bold?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText style={styles.detailLabel}>{label}</ThemedText>
      <ThemedText style={[
        styles.detailValue,
        color ? { color } : {},
        bold ? { fontWeight: '700', fontSize: 18 } : {}
      ]}>
        {value}
      </ThemedText>
    </View>
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
    marginBottom: 10,
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
    paddingBottom: 20,
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
    marginBottom: 6,
  },
  balanceValue: {
    fontSize: 25,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 12,
    minHeight: '45%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a237e',
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  detailsList: {
    gap: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'right',
    flex: 1,
    marginLeft: 20,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
  },
  closeModalBtn: {
    marginTop: 30,
    backgroundColor: '#1a237e',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
  },
  closeModalBtnText: {
    color: 'white',
    fontSize: 16,
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
