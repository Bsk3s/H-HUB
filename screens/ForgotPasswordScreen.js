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
} from 'react-native';
import BackButton from '../components/ui/BackButton';
import Button from '../components/ui/Button';
import { resetPassword } from '../src/auth/services/auth-service';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Clear error when user starts typing
    useEffect(() => {
        if (error) {
            setError('');
        }
    }, [email]);

    const handleBack = () => {
        navigation.goBack();
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleResetPassword = async () => {
        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        if (!validateEmail(email.trim())) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await resetPassword(email.trim());
            console.log('✅ Password reset email sent successfully');

            // Navigate to confirmation screen
            navigation.navigate('PasswordResetConfirmation', { email: email.trim() });
        } catch (err) {
            console.error('❌ Password reset error:', err);

            // Handle specific errors
            if (err.message.includes('User not found') || err.message.includes('not found')) {
                setError('No account found with this email address');
            } else if (err.message.includes('rate limit')) {
                setError('Too many requests. Please try again in a few minutes.');
            } else {
                setError(err.message || 'Failed to send reset email. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const isValid = email.trim().length > 0 && validateEmail(email.trim());

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <BackButton onPress={handleBack} />

                    <View style={styles.headerSection}>
                        <Text style={styles.title}>Forgot Password?</Text>
                        <Text style={styles.subtitle}>
                            No worries! Enter your email and we'll send you reset instructions.
                        </Text>
                    </View>

                    <View style={styles.formSection}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Email"
                                placeholderTextColor="#9CA3AF"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoFocus={true}
                                editable={!loading}
                            />
                        </View>
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
                            title={loading ? 'Sending...' : 'Send Reset Link'}
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
        paddingTop: 16,
    },
    headerSection: {
        marginTop: 32,
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
        marginBottom: 16,
    },
    inputContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    textInput: {
        height: 56,
        paddingHorizontal: 20,
        fontSize: 16,
        color: '#374151',
    },
    errorContainer: {
        marginTop: 8,
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
























