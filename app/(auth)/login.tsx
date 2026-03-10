import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole>('employee');
    const { signIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        checkBiometricSupport();
    }, []);

    const checkBiometricSupport = async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricSupported(compatible && enrolled);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor ingresa tu correo y contraseña');
            return;
        }
        setIsLoggingIn(true);
        // Simulate API call
        setTimeout(() => {
            signIn(selectedRole);
            setIsLoggingIn(false);
        }, 1500);
    };

    const handleBiometricAuth = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Autenticación Biométrica',
                fallbackLabel: 'Usar contraseña',
                disableDeviceFallback: false,
            });

            if (result.success) {
                setIsLoggingIn(true);
                setTimeout(() => {
                    signIn(selectedRole);
                    setIsLoggingIn(false);
                }, 1000);
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
                <View style={styles.logoContainer}>
                    <Image
                        source={require('@/assets/images/icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <ThemedText type="title" style={styles.title}>DisproMovil</ThemedText>
                    <ThemedText style={styles.subtitle}>Gestión de préstamos y clientes</ThemedText>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputWrapper}>
                        <ThemedText style={styles.label}>Correo Electrónico</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="usuario@ejemplo.com"
                            placeholderTextColor="#888"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

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

                    <View style={styles.roleSelectorContainer}>
                        <ThemedText style={styles.label}>Seleccionar Rol</ThemedText>
                        <View style={styles.roleButtonsRow}>
                            <TouchableOpacity
                                style={[styles.roleOption, selectedRole === 'employee' && styles.roleOptionActive]}
                                onPress={() => setSelectedRole('employee')}
                            >
                                <Ionicons
                                    name="person-outline"
                                    size={18}
                                    color={selectedRole === 'employee' ? 'white' : '#1a237e'}
                                />
                                <ThemedText style={[styles.roleOptionText, selectedRole === 'employee' && styles.roleOptionTextActive]}>
                                    Empleado
                                </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.roleOption, selectedRole === 'cashier' && styles.roleOptionActive]}
                                onPress={() => setSelectedRole('cashier')}
                            >
                                <Ionicons
                                    name="cash-outline"
                                    size={18}
                                    color={selectedRole === 'cashier' ? 'white' : '#1a237e'}
                                />
                                <ThemedText style={[styles.roleOptionText, selectedRole === 'cashier' && styles.roleOptionTextActive]}>
                                    Cajero
                                </ThemedText>
                            </TouchableOpacity>
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
                                <ThemedText style={styles.loginButtonText}>Iniciar Sesión</ThemedText>
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

                    <TouchableOpacity style={styles.forgotPassword}>
                        <ThemedText style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</ThemedText>
                    </TouchableOpacity>
                </View>
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
        justifyContent: 'center',
        padding: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
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
        marginBottom: 20,
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
        color: '#333',
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
    forgotPassword: {
        marginTop: 20,
        alignItems: 'center',
    },
    forgotPasswordText: {
        color: '#007AFF',
        fontSize: 14,
    },
    roleSelectorContainer: {
        marginBottom: 20,
    },
    roleButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    roleOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#f0f2ff',
        borderWidth: 1,
        borderColor: '#e0e4ff',
        gap: 8,
    },
    roleOptionActive: {
        backgroundColor: '#1a237e',
        borderColor: '#1a237e',
    },
    roleOptionText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1a237e',
    },
    roleOptionTextActive: {
        color: 'white',
    },
});
