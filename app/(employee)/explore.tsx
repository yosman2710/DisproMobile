import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const MOVEMENTS = [
  { id: '1', type: 'Ingreso', amount: '+250.00', date: '10 Mar 2026', time: '10:30 AM', icon: 'trending-up', color: '#4CAF50', authorizer: 'Admin Principal', location: 'Oficina Central', balance: '$1,280.00' },
  { id: '2', type: 'Canje', amount: '-120.00', date: '09 Mar 2026', time: '04:15 PM', icon: 'cart', color: '#F44336', authorizer: 'Supervisor Juan', location: 'Tienda Norte', balance: '$1,030.00' },
  { id: '3', type: 'Ingreso', amount: '+100.00', date: '08 Mar 2026', time: '09:00 AM', icon: 'trending-up', color: '#4CAF50', authorizer: 'Admin Principal', location: 'Oficina Central', balance: '$1,150.00' },
  { id: '4', type: 'Canje', amount: '-50.00', date: '07 Mar 2026', time: '11:45 AM', icon: 'cart', color: '#F44336', authorizer: 'Supervisor Ana', location: 'Tienda Sur', balance: '$1,050.00' },
  { id: '5', type: 'Ingreso', amount: '+500.00', date: '05 Mar 2026', time: '08:30 AM', icon: 'trending-up', color: '#4CAF50', authorizer: 'Sistema', location: 'Bono Desempeño', balance: '$1,100.00' },
];

export default function HistoryScreen() {
  const [filter, setFilter] = useState('Todos');
  const [selectedItem, setSelectedItem] = useState<typeof MOVEMENTS[0] | null>(null);

  const filteredMovements = MOVEMENTS.filter(m =>
    filter === 'Todos' || m.type === filter
  );

  const renderItem = ({ item }: { item: typeof MOVEMENTS[0] }) => (
    <TouchableOpacity
      style={styles.movementCard}
      onPress={() => setSelectedItem(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: item.color + '10' }]}>
        <Ionicons name={item.icon as any} size={22} color={item.color} />
      </View>
      <View style={styles.cardInfo}>
        <ThemedText style={styles.typeText}>{item.type}</ThemedText>
        <ThemedText style={styles.dateText}>{item.date} • {item.time}</ThemedText>
      </View>
      <View style={styles.amountContainer}>
        <ThemedText style={[styles.amountText, { color: item.color }]}>
          {item.amount}
        </ThemedText>
        <Ionicons name="chevron-forward" size={16} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

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
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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

            {selectedItem && (
              <View style={styles.detailsList}>
                <DetailRow label="Tipo de Operación" value={selectedItem.type} color={selectedItem.color} />
                <DetailRow label="Monto total" value={selectedItem.amount} color={selectedItem.color} bold />
                <DetailRow label="Fecha y Hora" value={`${selectedItem.date} ${selectedItem.time}`} />
                <DetailRow label="Autorizado por" value={selectedItem.authorizer} />
                <DetailRow label="Lugar de operacion" value={selectedItem.location} />

                <View style={styles.modalDivider} />

                <DetailRow label="Saldo Final" value={selectedItem.balance} bold />
              </View>
            )}

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
});
