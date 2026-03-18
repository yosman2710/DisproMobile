import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth, UserRole } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SECURE_STORE_KEY = 'user_credentials';

export default function LoginScreen() {
    const [cedula, setCedula] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole>('empleado');

    const { signIn } = useAuth();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    useEffect(() => {
        checkBiometricSupport();
        loadSavedCredentials();
    }, []);

    const checkBiometricSupport = async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricSupported(compatible && enrolled);
    };

    const loadSavedCredentials = async () => {
        try {
            const credentials = await SecureStore.getItemAsync(SECURE_STORE_KEY);
            if (credentials) {
                const { cedula: savedCedula } = JSON.parse(credentials);
                setCedula(savedCedula);
            }
        } catch (error) {
            console.error('Error loading credentials:', error);
        }
    };

    const getEmailByCedula = async (cedulaStr: string): Promise<string | null> => {
        const { data, error } = await supabase.rpc('get_email_by_cedula', { p_cedula: parseInt(cedulaStr, 10) });
        if (error || !data) {
            console.error('Error buscando email por cédula:', error);
            return null;
        }
        return data as string;
    };

    const handleLogin = async () => {
        if (!cedula || !password) {
            Alert.alert('Error', 'Por favor ingresa tu cédula y contraseña');
            return;
        }
        setIsLoggingIn(true);

        try {
            // 1. Buscar el email usando la cédula
            const userEmail = await getEmailByCedula(cedula);

            if (!userEmail) {
                Alert.alert('Error', 'Cédula no registrada o inválida.');
                setIsLoggingIn(false);
                return;
            }

            // 2. Iniciar sesión con el email encontrado
            const { error } = await signIn(userEmail, password);

            if (error) {
                Alert.alert('Error de Inicio de Sesión', error.message);
            } else {
                // Save credentials for biometric auth
                await SecureStore.setItemAsync(SECURE_STORE_KEY, JSON.stringify({ cedula, password }));
            }
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setIsLoggingIn(false);
        }
    };


    const handleBiometricAuth = async () => {
        try {
            const credentials = await SecureStore.getItemAsync(SECURE_STORE_KEY);
            if (!credentials) {
                Alert.alert('Aviso', 'No hay credenciales guardadas. Inicia sesión manualmente primero.');
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Autenticación Biométrica',
                fallbackLabel: 'Usar contraseña',
                disableDeviceFallback: false,
            });

            if (result.success) {
                const { cedula: savedCedula, password: savedPassword } = JSON.parse(credentials);
                setIsLoggingIn(true);

                const userEmail = await getEmailByCedula(savedCedula);
                if (!userEmail) {
                    Alert.alert('Error', 'Las credenciales guardadas ya no son válidas (Cédula no encontrada).');
                    setIsLoggingIn(false);
                    return;
                }

                const { error } = await signIn(userEmail, savedPassword);
                if (error) {
                    Alert.alert('Error', 'Las credenciales guardadas ya no son válidas.');
                }
                setIsLoggingIn(false);
            }
        } catch (error) {
            Alert.alert('Error', 'Hubo un fallo en la autenticación biométrica');
        }
    };

    return (
        <ThemedView style={[styles.container, { paddingTop: insets.top, backgroundColor: '#ffffff' }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('@/assets/images/logo-disprocar.png')}
                            style={styles.logo}
                            contentFit="contain"
                        />
                        <ThemedText type="title" style={styles.title}>DisproMovil</ThemedText>
                        <ThemedText style={styles.subtitle}>
                            Gestión de administración de canjes
                        </ThemedText>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>Número de Cédula</ThemedText>
                            <View style={styles.inputContainer}>
                                <Ionicons name="card-outline" size={20} color="#007AFF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ingresa tu cédula"
                                    placeholderTextColor="#A0A0A0"
                                    value={cedula}
                                    onChangeText={setCedula}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>Contraseña</ThemedText>
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color="#007AFF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor="#A0A0A0"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>
                        </View>


                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.loginButton, isBiometricSupported && styles.loginButtonWithBiometric]}
                                onPress={handleLogin}
                                disabled={isLoggingIn}
                            >
                                {isLoggingIn ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <ThemedText style={styles.loginButtonText}>
                                        Iniciar Sesión
                                    </ThemedText>
                                )}
                            </TouchableOpacity>

                            {isBiometricSupported && (
                                <TouchableOpacity
                                    style={styles.biometricButton}
                                    onPress={handleBiometricAuth}
                                    disabled={isLoggingIn}
                                >
                                    <MaterialCommunityIcons
                                        name={Platform.OS === 'ios' ? 'face-recognition' : 'fingerprint'}
                                        size={32}
                                        color="#007AFF"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>


                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 30,
        backgroundColor: '#ffffff',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 280,
        height: 120,
        marginBottom: 20,
    },
    title: {
        fontSize: 34,
        fontWeight: '900',
        color: '#1a237e',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: '#757575',
        marginTop: 6,
        fontWeight: '500',
    },
    formContainer: {
        width: '100%',
        backgroundColor: '#ffffff',
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        marginBottom: 10,
        fontSize: 15,
        fontWeight: '700',
        color: '#424242',
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fdfdfd',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#f0f0f0',
        paddingHorizontal: 16,
        height: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    inputIcon: {
        marginRight: 12,
        opacity: 0.8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#212121',
        fontWeight: '500',
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    loginButton: {
        flex: 1,
        height: 60,
        backgroundColor: '#007AFF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    loginButtonWithBiometric: {
        flex: 1,
    },
    biometricButton: {
        width: 60,
        height: 60,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#e0e4ff',
        marginLeft: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
