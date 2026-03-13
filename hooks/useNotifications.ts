import * as Device from 'expo-device';
import type * as NotificationsType from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

// Expo Go en SDK 53+ ya no soporta push notifications, arroja un error al importarlo.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let Notifications: typeof NotificationsType | null = null;
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    Notifications?.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    console.warn('Error cargando expo-notifications', error);
  }
}

export function useNotifications() {
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<NotificationsType.Notification | null>(null);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (!user || !Notifications) return;

    // Ejecutar registro al iniciar
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        saveTokenToSupabase(user.id, token);
      }
    });

    // Escuchar notificaciones entrantes
    notificationListener.current = Notifications.addNotificationReceivedListener(notif => {
      setNotification(notif);
    });

    // Escuchar clic en la notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificación abierta:', response.notification.request.content.data);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [user?.id]);

  return { expoPushToken, notification };
}

async function saveTokenToSupabase(userId: string, token: string) {
  try {
    const { error } = await supabase
      .from('perfiles')
      .update({ push_token: token })
      .eq('id', userId);

    if (error) {
      console.error('Error guardando token en Supabase:', error);
    }
  } catch (err) {
    console.error('Error crítico al guardar token:', err);
  }
}

async function registerForPushNotificationsAsync() {
  let token;
  if (!Notifications) return token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Permiso de notificaciones denegado');
      return;
    }

    try {
      // Intento extraer el projectId de forma segura para TS
      const projectId = 
        Constants?.expoConfig?.extra?.eas?.projectId ?? 
        Constants?.easConfig?.projectId;

      if (!projectId) {
         console.warn('Project ID no encontrado en la configuración de Expo');
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId
      });
      token = tokenData.data;
    } catch (e) {
      console.error('Error obteniendo el Push Token de Expo:', e);
    }
  } else {
    console.log('Debes usar un dispositivo físico para probar notificaciones push');
  }

  return token;
}
