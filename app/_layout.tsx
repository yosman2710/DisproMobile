import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/useNotifications';

export const unstable_settings = {
  initialRouteName: '(employee)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, userRole, isLoading } = useAuth();
  useNotifications(); // Habilitar registro de notificaciones
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      if (segments[0] !== '(auth)') {
        router.replace('/(auth)/login');
      }
      return;
    }

    if (!userRole) {
      return;
    }

    const targetGroup = userRole === 'cajero' ? '(cashier)' : '(employee)';
    const targetPath = userRole === 'cajero' ? '/(cashier)' : '/(employee)';

    const isGlobalScreen = segments[0] === 'qr-redeem' || segments[0] === 'modal';

    if (segments[0] !== targetGroup && !isGlobalScreen) {
      router.replace(targetPath as any);
    }
  }, [session, userRole, isLoading, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(employee)" options={{ headerShown: false }} />
        <Stack.Screen name="(cashier)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="qr-redeem" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
