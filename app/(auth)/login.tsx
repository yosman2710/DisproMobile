import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '@/lib/supabase';

const SECURE_STORE_KEY = 'user_credentials';

export default function LoginScreen() {
    const [cedula, setCedula] = useState('');
    const [emailSignUp, setEmailSignUp] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole>('empleado');
    const [isSignup, setIsSignup] = useState(false);

    const { signIn, signUp } = useAuth();
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

    const handleSignup = async () => {
        if (!emailSignUp || !password || !nombre || !cedula) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }
        setIsLoggingIn(true);
        try {
            const { error } = await signUp(emailSignUp, password, {
                nombre,
                cedula: parseInt(cedula),
                rol: selectedRole
            });
            if (error) {
                Alert.alert('Error de Registro', error.message);
            } else {
                Alert.alert('Éxito', 'Usuario registrado correctamente. Por favor verifica tu correo si es necesario.');
                setIsSignup(false);
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
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('@/assets/images/icon.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <ThemedText type="title" style={styles.title}>DisproMovil</ThemedText>
                        <ThemedText style={styles.subtitle}>
                            {isSignup ? 'Crea tu cuenta de ' + (selectedRole === 'cajero' ? 'Cajero' : 'Empleado') : 'Gestión de préstamos y clientes'}
                        </ThemedText>
                    </View>

                    <View style={styles.formContainer}>
                        {isSignup && (
                            <View style={styles.inputWrapper}>
                                <ThemedText style={styles.label}>Nombre Completo</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Tu nombre"
                                    placeholderTextColor="#888"
                                    value={nombre}
                                    onChangeText={setNombre}
                                />
                            </View>
                        )}

                        <View style={styles.inputWrapper}>
                            <ThemedText style={styles.label}>Cédula</ThemedText>
                            <TextInput
                                style={styles.input}
                                placeholder="123456789"
                                placeholderTextColor="#888"
                                value={cedula}
                                onChangeText={setCedula}
                                keyboardType="numeric"
                            />
                        </View>

                        {isSignup && (
                            <View style={styles.inputWrapper}>
                                <ThemedText style={styles.label}>Correo Electrónico (Para recuperar clave)</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    placeholder="usuario@ejemplo.com"
                                    placeholderTextColor="#888"
                                    value={emailSignUp}
                                    onChangeText={setEmailSignUp}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        )}

                        <View style={styles.inputWrapper}>
                            <ThemedText style={styles.label}>Contraseña</ThemedText>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor="#888"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        {isSignup && (
                            <View style={styles.roleSelectorContainer}>
                                <ThemedText style={styles.label}>
                                    Selecciona tu Rol
                                </ThemedText>
                                <View style={styles.roleButtonsRow}>
                                    <TouchableOpacity
                                        style={[
                                            styles.roleCard,
                                            selectedRole === 'empleado' && styles.roleCardActive
                                        ]}
                                        onPress={() => setSelectedRole('empleado')}
                                    >
                                        <View style={[styles.roleIconContainer, selectedRole === 'empleado' && styles.roleIconContainerActive]}>
                                            <Ionicons
                                                name="person-outline"
                                                size={24}
                                                color={selectedRole === 'empleado' ? 'white' : '#1a237e'}
                                            />
                                        </View>
                                        <View>
                                            <ThemedText style={[styles.roleCardTitle, selectedRole === 'empleado' && styles.roleCardTextActive]}>
                                                Empleado
                                            </ThemedText>
                                            <ThemedText style={[styles.roleCardSub, selectedRole === 'empleado' && styles.roleCardTextActive]}>
                                                Acceso a préstamos
                                            </ThemedText>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.roleCard,
                                            selectedRole === 'cajero' && styles.roleCardActive
                                        ]}
                                        onPress={() => setSelectedRole('cajero')}
                                    >
                                        <View style={[styles.roleIconContainer, selectedRole === 'cajero' && styles.roleIconContainerActive]}>
                                            <Ionicons
                                                name="cash-outline"
                                                size={24}
                                                color={selectedRole === 'cajero' ? 'white' : '#1a237e'}
                                            />
                                        </View>
                                        <View>
                                            <ThemedText style={[styles.roleCardTitle, selectedRole === 'cajero' && styles.roleCardTextActive]}>
                                                Cajero
                                            </ThemedText>
                                            <ThemedText style={[styles.roleCardSub, selectedRole === 'cajero' && styles.roleCardTextActive]}>
                                                Gestión de canjes
                                            </ThemedText>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.loginButton, (!isSignup && isBiometricSupported) && styles.loginButtonWithBiometric]}
                                onPress={isSignup ? handleSignup : handleLogin}
                                disabled={isLoggingIn}
                            >
                                {isLoggingIn ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <ThemedText style={styles.loginButtonText}>
                                        {isSignup ? 'Registrarse' : 'Iniciar Sesión'}
                                    </ThemedText>
                                )}
                            </TouchableOpacity>

                            {!isSignup && isBiometricSupported && (
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

                        <TouchableOpacity
                            style={styles.toggleSignup}
                            onPress={() => setIsSignup(!isSignup)}
                        >
                            <ThemedText style={styles.toggleSignupText}>
                                {isSignup ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                            </ThemedText>
                        </TouchableOpacity>

                        {!isSignup && (
                            <TouchableOpacity style={styles.forgotPassword}>
                                <ThemedText style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</ThemedText>
                            </TouchableOpacity>
                        )}
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
        padding: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.7,
        marginTop: 8,
    },
    formContainer: {
        width: '100%',
    },
    inputWrapper: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        height: 50,
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#ffffffff',
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 12,
    },
    loginButton: {
        flex: 1,
        height: 55,
        backgroundColor: '#007AFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    loginButtonWithBiometric: {
        flex: 0.8,
    },
    biometricButton: {
        width: 55,
        height: 55,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    toggleSignup: {
        marginTop: 20,
        alignItems: 'center',
    },
    toggleSignupText: {
        color: '#007AFF',
        fontSize: 15,
        fontWeight: '600',
    },
    forgotPassword: {
        marginTop: 15,
        alignItems: 'center',
    },
    forgotPasswordText: {
        color: '#ffffffff',
        fontSize: 14,
    },
    roleSelectorContainer: {
        marginBottom: 20,
    },
    roleButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    roleCard: {
        flex: 1,
        backgroundColor: '#f8faff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: '#e0e4ff',
        alignItems: 'center',
        gap: 12,
    },
    roleCardActive: {
        backgroundColor: '#1a237e',
        borderColor: '#1a237e',
        shadowColor: '#1a237e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    roleIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(26, 35, 126, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    roleIconContainerActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    roleCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a237e',
        textAlign: 'center',
    },
    roleCardSub: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
        marginTop: 2,
    },
    roleCardTextActive: {
        color: 'white',
    },
});
