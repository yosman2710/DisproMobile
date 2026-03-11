import { Stack } from 'expo-router';
import React from 'react';

export default function CashierLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="redemption-detail" />
            <Stack.Screen name="success" />
        </Stack>
    );
}
