import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(employee)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, userRole, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inEmployeeGroup = segments[0] === '(employee)';
    const inCashierGroup = segments[0] === '(cashier)';

    if (!session && !inAuthGroup) {
      // Redirect to the login page if the user is not authenticated
      router.replace('/(auth)/login');
    } else if (session) {
      if (inAuthGroup) {
        // Redirect to the appropriate role-based group if authenticated but in auth group
        router.replace((userRole === 'cashier' ? '/(cashier)' : '/(employee)') as any);
      } else if (userRole === 'employee' && inCashierGroup) {
        // Prevent employee from accessing cashier group
        router.replace('/(employee)' as any);
      } else if (userRole === 'cashier' && inEmployeeGroup) {
        // Prevent cashier from accessing employee group
        router.replace('/(cashier)' as any);
      }
    }
  }, [session, userRole, isLoading, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(employee)" options={{ headerShown: false }} />
        <Stack.Screen name="(cashier)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="qr-redeem" options={{ headerShown: false }} />
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
