import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/useNotifications';

// Prevenir que el SplashScreen se oculte antes de tiempo
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(employee)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, userRole, isLoading } = useAuth();
  useNotifications(); // Habilitar registro de notificaciones
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    // Cuando termine de cargar la autenticación, ocultamos la pantalla de carga
    if (!isLoading) {
      SplashScreen.hideAsync().catch(console.warn);
      setIsNavigationReady(true);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading || !isNavigationReady) return;

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

    // Evitar loop infinito: Solo navegamos si estamos completamente en un flujo equivocado para el rol
    if (segments[0] !== targetGroup && !isGlobalScreen && segments[0] !== '(auth)') {
       router.replace(targetPath as any);
    } else if (segments[0] === '(auth)') {
       // Si el usuario intentó ir al log in mientras estaba logueado
       router.replace(targetPath as any);
    }
  }, [session, userRole, isLoading, segments, isNavigationReady]);

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
