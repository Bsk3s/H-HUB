import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    SafeAreaView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/ui/Button';
import { supabase } from '../src/auth/supabase-client';

export default function ResetPasswordScreen({ navigation }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('');

    // Clear error when user types
    useEffect(() => {
        if (error) {
            setError('');
        }
    }, [password, confirmPassword]);

    // Check password strength
    useEffect(() => {
        if (password.length === 0) {
            setPasswordStrength('');
            return;
        }

        let strength = 0;

        // Length check
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;

        // Character variety checks
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        if (strength <= 2) {
            setPasswordStrength('Weak');
        } else if (strength <= 4) {
            setPasswordStrength('Medium');
        } else {
            setPasswordStrength('Strong');
        }
    }, [password]);

    const validatePassword = () => {
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return false;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleResetPassword = async () => {
        if (!validatePassword()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('🔐 Updating password...');

            const { data, error: updateError } = await supabase.auth.updateUser({
                password: password,
            });

            if (updateError) throw updateError;

            console.log('✅ Password updated successfully');

            // Show success message
            Alert.alert(
                'Password Updated! ✓',
                'Your password has been changed successfully. You can now sign in with your new password.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Navigate to the app (user is already authenticated)
                            console.log('✅ Password reset complete - navigating to app');
                            // The App.js will automatically handle navigation based on auth state
                        }
                    }
                ]
            );

        } catch (err) {
            console.error('❌ Password reset error:', err);

            // Handle specific errors
            if (err.message.includes('expired')) {
                setError('Reset link has expired. Please request a new one.');
            } else if (err.message.includes('same')) {
                setError('New password must be different from your old password');
            } else {
                setError(err.message || 'Failed to reset password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStrengthColor = () => {
        switch (passwordStrength) {
            case 'Weak':
                return '#EF4444';
            case 'Medium':
                return '#F59E0B';
            case 'Strong':
                return '#10B981';
            default:
                return '#9CA3AF';
        }
    };

    const isValid = password.length >= 8 && password === confirmPassword;

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <View style={styles.headerSection}>
                        <Text style={styles.title}>Create New Password</Text>
                        <Text style={styles.subtitle}>
                            Your new password must be different from your previous password.
                        </Text>
                    </View>

                    <View style={styles.formSection}>
                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="New Password"
                                placeholderTextColor="#9CA3AF"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoFocus={true}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={24}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Password Strength Indicator */}
                        {password.length > 0 && (
                            <View style={styles.strengthContainer}>
                                <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                                    Password strength: {passwordStrength}
                                </Text>
                            </View>
                        )}

                        {/* Confirm Password Input */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Confirm New Password"
                                placeholderTextColor="#9CA3AF"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={24}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Requirements */}
                    <View style={styles.requirementsBox}>
                        <Text style={styles.requirementsTitle}>Password requirements:</Text>
                        <Text style={styles.requirementText}>• At least 8 characters</Text>
                        <Text style={styles.requirementText}>• Mix of uppercase & lowercase letters</Text>
                        <Text style={styles.requirementText}>• At least one number or special character</Text>
                    </View>

                    {/* Error message */}
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <View style={styles.buttonSection}>
                        <Button
                            onPress={handleResetPassword}
                            title={loading ? 'Updating...' : 'Reset Password'}
                            disabled={!isValid || loading}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    headerSection: {
        marginBottom: 32,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#000000',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 24,
    },
    formSection: {
        gap: 16,
        marginBottom: 24,
    },
    inputContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 16,
    },
    textInput: {
        flex: 1,
        height: 56,
        paddingHorizontal: 20,
        fontSize: 16,
        color: '#374151',
    },
    eyeIcon: {
        padding: 8,
    },
    strengthContainer: {
        marginTop: -8,
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    strengthText: {
        fontSize: 14,
        fontWeight: '600',
    },
    requirementsBox: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    requirementsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    requirementText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    errorContainer: {
        marginBottom: 16,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        textAlign: 'center',
    },
    buttonSection: {
        marginTop: 'auto',
        marginBottom: 16,
    },
});
























