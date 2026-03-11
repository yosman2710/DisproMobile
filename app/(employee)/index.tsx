import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

const RECENTS = [
  { id: '1', type: 'Ingreso', amount: '+250.00', date: 'Hoy, 10:30 AM', icon: 'trending-up', color: '#4CAF50' },
  { id: '2', type: 'Canje', amount: '-120.00', date: 'Ayer, 04:15 PM', icon: 'cart', color: '#F44336' },
  { id: '3', type: 'Ingreso', amount: '+100.00', date: '08 Mar, 09:00 AM', icon: 'trending-up', color: '#4CAF50' },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { signOut } = useAuth();

  const renderMovement = (item: typeof RECENTS[0]) => (
    <View key={item.id} style={styles.movementCard}>
      <View style={[styles.iconContainer, { backgroundColor: item.color + '10' }]}>
        <Ionicons name={item.icon as any} size={22} color={item.color} />
      </View>
      <View style={styles.movementInfo}>
        <ThemedText style={styles.movementTypeText}>{item.type}</ThemedText>
        <ThemedText style={styles.movementDateText}>{item.date}</ThemedText>
      </View>
      <ThemedText style={[styles.movementAmountText, { color: item.color }]}>
        {item.amount}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>DisproMovil</ThemedText>
        <View style={styles.headerTop}>
          <ThemedText style={styles.welcomeTitle}>Hola, Usuario 👋</ThemedText>
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
            <ThemedText style={styles.balanceValue}>$1,280.00</ThemedText>
          </LinearGradient>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
          {RECENTS.map(renderMovement)}
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
});
