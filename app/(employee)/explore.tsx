import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, TouchableOpacity, View, RefreshControl } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: number;
  tipo: 'deposito' | 'canje';
  monto_total: number;
  fecha: string;
  motivo?: string;
  ejecutor?: { nombre: string };
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('Todos');
  const [movements, setMovements] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Transaction | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('transacciones')
        .select(`
          id, 
          tipo, 
          monto_total, 
          fecha,
          motivo,
          ejecutor:ejecutor_id(nombre)
        `)
        .eq('perfil_id', user.id)
        .order('fecha', { ascending: false });

      if (data) {
        setMovements(data as unknown as Transaction[]);
      }
      if (error) console.error('Error fetching transactions:', error);
    } catch (err) {
      console.error('Error in fetchTransactions:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  }, [fetchTransactions]);

  const filteredMovements = movements.filter(m => {
    if (filter === 'Todos') return true;
    if (filter === 'Ingresos') return m.tipo === 'deposito';
    if (filter === 'Canjes') return m.tipo === 'canje';
    return true;
  });

  const getStyle = (tipo: string) => {
    return tipo === 'deposito' 
      ? { icon: 'trending-up', color: '#4CAF50', label: 'Depósito', prefix: '+' }
      : { icon: 'cart', color: '#F44336', label: 'Canje', prefix: '-' };
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const style = getStyle(item.tipo);
    const date = new Date(item.fecha);
    const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity
        style={styles.movementCard}
        onPress={() => setSelectedItem(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: style.color + '10' }]}>
          <Ionicons name={style.icon as any} size={22} color={style.color} />
        </View>
        <View style={styles.cardInfo}>
          <ThemedText style={styles.typeText}>{style.label}</ThemedText>
          <ThemedText style={styles.dateText}>{dateStr} • {timeStr}</ThemedText>
        </View>
        <View style={styles.amountContainer}>
          <ThemedText style={[styles.amountText, { color: style.color }]}>
            {style.prefix}{item.monto_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </ThemedText>
          <Ionicons name="chevron-forward" size={16} color="#ccc" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Historial</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}>
          {['Todos', 'Ingresos', 'Canjes'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            >
              <ThemedText style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredMovements}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a237e']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Ionicons name="receipt-outline" size={64} color="#eee" />
            <ThemedText style={styles.emptyStateText}>No tienes transacciones en este momento</ThemedText>
          </View>
        }
      />

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
              const style = getStyle(selectedItem.tipo);
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
              style={styles.printBtn}
              onPress={() => setSelectedItem(null)}
            >
              <ThemedText style={styles.printBtnText}>Cerrar Detalle</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>
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
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a237e',
    marginBottom: 20,
  },
  filterBar: {
    gap: 12,
    paddingRight: 24,
  },
  filterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#eee',
  },
  filterBtnActive: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  movementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  dateText: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
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
    minHeight: '50%',
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
    gap: 20,
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
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
  },
  printBtn: {
    marginTop: 40,
    backgroundColor: '#1a237e',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  printBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 16,
  },
  emptyStateText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});
