import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as NavigationBar from 'expo-navigation-bar';
import { withLayoutContext } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Ocultar la barra de navegación en Android
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
    }

    return () => {
      // Restaurar la barra de navegación al salir
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('visible');
      }
    };
  }, []);

  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      keyboardDismissMode="on-drag"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#1a237e',
        tabBarInactiveTintColor: '#999',
        tabBarShowIcon: true,
        tabBarIndicatorStyle: {
          backgroundColor: '#1a237e',
          top: 0,
          height: 3,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          textTransform: 'none',
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          height: Platform.OS === 'ios' ? 70 : 65,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarPressColor: 'rgba(26, 35, 126, 0.05)',
        tabBarIcon: ({ color, focused }) => {
          let ionIcon: any = 'help-circle';
          if (route.name === 'index') ionIcon = 'home';
          else if (route.name === 'explore') ionIcon = 'time';

          return <Ionicons name={focused ? (ionIcon as any) : (`${ionIcon}-outline` as any)} size={22} color={color} />;
        },
      })}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: 'Inicio',
        }}
      />
      <MaterialTopTabs.Screen
        name="explore"
        options={{
          title: 'Historial',
        }}
      />
    </MaterialTopTabs>
  );
}
