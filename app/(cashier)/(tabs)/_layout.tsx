import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

export default function CashierTabsLayout() {
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
                    height: Platform.OS === 'ios' ? 85 : 65,
                    elevation: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                },
                tabBarPressColor: 'rgba(26, 35, 126, 0.05)',
                tabBarIcon: ({ color, focused }) => {
                    let ionIcon: any = 'help-circle';
                    if (route.name === 'index') ionIcon = 'scan';
                    else if (route.name === 'history') ionIcon = 'list';

                    return <Ionicons name={focused ? (ionIcon as any) : (`${ionIcon}-outline` as any)} size={22} color={color} />;
                },
            })}
        >
            <MaterialTopTabs.Screen
                name="index"
                options={{
                    title: 'Escanear',
                }}
            />
            <MaterialTopTabs.Screen
                name="history"
                options={{
                    title: 'Historial',
                }}
            />
        </MaterialTopTabs>
    );
}
