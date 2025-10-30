import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    Linking,
    Alert,
} from 'react-native';
import Button from '../components/ui/Button';
import { resetPassword } from '../src/auth/services/auth-service';

export default function PasswordResetConfirmationScreen({ route, navigation }) {
    const { email } = route.params;
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Cooldown timer for resend button
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleOpenEmailApp = async () => {
        try {
            const supported = await Linking.canOpenURL('mailto:');
            if (supported) {
                await Linking.openURL('mailto:');
            } else {
                Alert.alert(
                    'Cannot Open Email App',
                    'Please open your email app manually to reset your password.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error opening email app:', error);
            Alert.alert(
                'Error',
                'Could not open email app. Please open it manually.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleResendEmail = async () => {
        if (resendCooldown > 0) return;

        setIsResending(true);
        try {
            await resetPassword(email);
            console.log('✅ Password reset email resent');
            Alert.alert(
                'Email Sent! ✓',
                'We sent another reset link to your email.',
                [{ text: 'OK' }]
            );
            setResendCooldown(60); // 60 second cooldown
        } catch (error) {
            console.error('Error resending email:', error);
            Alert.alert(
                'Error',
                error.message || 'Failed to resend email. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsResending(false);
        }
    };

    const handleBackToSignIn = () => {
        // Navigate back to sign in screen
        navigation.navigate('EmailSignIn');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Email Icon */}
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>📧</Text>
                </View>

                {/* Heading */}
                <Text style={styles.title}>Check Your Email</Text>

                {/* Email Display */}
                <Text style={styles.subtitle}>
                    We sent password reset instructions to
                </Text>
                <Text style={styles.email}>{email}</Text>

                {/* Instructions */}
                <Text style={styles.instructions}>
                    Click the link in the email to reset your password. The link will expire in 1 hour.
                </Text>

                {/* Spam Folder Tip */}
                <View style={styles.tipBox}>
                    <Text style={styles.tipIcon}>💡</Text>
                    <Text style={styles.tipText}>
                        <Text style={styles.tipBold}>Pro tip:</Text> Check your spam or junk folder if you don't see it.
                    </Text>
                </View>

                {/* Primary Button */}
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={handleOpenEmailApp}
                        title="Open Email App"
                    />
                </View>

                {/* Resend Link */}
                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>Didn't receive it? </Text>
                    <TouchableOpacity
                        onPress={handleResendEmail}
                        disabled={resendCooldown > 0 || isResending}
                    >
                        <Text
                            style={[
                                styles.resendLink,
                                (resendCooldown > 0 || isResending) && styles.resendLinkDisabled
                            ]}
                        >
                            {isResending
                                ? 'Sending...'
                                : resendCooldown > 0
                                    ? `Resend (${resendCooldown}s)`
                                    : 'Resend Email'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Back to Sign In */}
                <TouchableOpacity
                    onPress={handleBackToSignIn}
                    style={styles.backToSignInContainer}
                >
                    <Text style={styles.backToSignInText}>
                        ← Back to sign in
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 24,
    },
    icon: {
        fontSize: 80,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 8,
    },
    email: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 24,
        textAlign: 'center',
    },
    instructions: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    tipBox: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 12,
        marginBottom: 32,
        alignItems: 'flex-start',
    },
    tipIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    tipBold: {
        fontWeight: '600',
        color: '#374151',
    },
    buttonContainer: {
        width: '100%',
        marginBottom: 24,
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    resendText: {
        fontSize: 14,
        color: '#6B7280',
    },
    resendLink: {
        fontSize: 14,
        color: '#4F46E5',
        fontWeight: '600',
    },
    resendLinkDisabled: {
        color: '#9CA3AF',
    },
    backToSignInContainer: {
        marginTop: 32,
        paddingVertical: 12,
    },
    backToSignInText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
});
























