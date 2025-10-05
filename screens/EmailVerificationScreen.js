import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    Linking,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resendVerificationEmail, checkEmailVerified } from '../src/auth/services/auth-service';
import { ensureUserProfile } from '../src/auth/services/profile-service';
import { useAuth } from '../src/auth/context';
import Button from '../components/ui/Button';

export default function EmailVerificationScreen({ route, navigation }) {
    const { email } = route.params;
    const { logout, user } = useAuth();
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isChecking, setIsChecking] = useState(true);

    // Polling: Check verification status every 3 seconds
    useEffect(() => {
        console.log('📧 EmailVerificationScreen mounted - starting polling in 2 seconds...');

        const checkVerification = async () => {
            try {
                const verified = await checkEmailVerified();
                if (verified) {
                    console.log('✅ Email verified! Creating user profile...');
                    clearInterval(pollInterval);

                    // Create user profile NOW (after verification)
                    // This ensures only verified users appear in user_profiles table
                    try {
                        if (user && user.id) {
                            await ensureUserProfile(user.id);
                            console.log('✅ User profile created for verified user');
                        }
                    } catch (profileError) {
                        console.error('⚠️ Profile creation failed:', profileError.message);
                        // Continue anyway - profile can be retried later
                    }

                    // Trigger a custom deep link to notify App.js to recheck
                    // This will cause App.js to re-evaluate and show AppStack
                    setTimeout(() => {
                        Linking.openURL('com.bsk3s.heavenlyhub://verified');
                    }, 500);
                }
            } catch (error) {
                console.error('Error checking verification:', error);
            }
        };

        // Wait 2 seconds before first check (give session time to initialize)
        const initialDelay = setTimeout(() => {
            console.log('📧 Starting verification polling now...');
            checkVerification().then(() => setIsChecking(false));

            // Then poll every 3 seconds
            pollInterval = setInterval(checkVerification, 3000);
        }, 2000);

        let pollInterval;

        return () => {
            console.log('📧 EmailVerificationScreen unmounting - stopping polling');
            clearTimeout(initialDelay);
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        };
    }, []);

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
            // Try to open the default email app
            // iOS: opens Mail app
            // Android: shows email app chooser
            const supported = await Linking.canOpenURL('mailto:');
            if (supported) {
                await Linking.openURL('mailto:');
            } else {
                Alert.alert(
                    'Cannot Open Email App',
                    'Please open your email app manually to verify your account.',
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
            await resendVerificationEmail(email);
            console.log('✅ Verification email resent');
            Alert.alert(
                'Email Sent! ✓',
                'We sent another verification link to your email.',
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

    const handleWrongEmail = () => {
        Alert.alert(
            'Wrong Email?',
            'Go back to fix your email. All your onboarding answers are saved.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Fix Email',
                    onPress: async () => {
                        try {
                            // Set flag so Landing/AuthStack knows to go to SignUpScreen
                            await AsyncStorage.setItem('returnToSignUp', 'true');
                            console.log('📝 Set returnToSignUp flag');

                            // Log out to clear the wrong account
                            console.log('🚪 Logging out to return to signup...');
                            const success = await logout();

                            if (success) {
                                console.log('✅ Logout successful - app should route to landing/signup');
                                // Give React a moment to process the state change
                                // App.js will detect no user and show AuthStack
                            } else {
                                console.error('❌ Logout failed');
                                Alert.alert('Error', 'Failed to go back. Please try again.');
                            }
                        } catch (error) {
                            console.error('❌ Error navigating back:', error);
                            Alert.alert('Error', 'Something went wrong. Please try again.');
                        }
                    }
                }
            ]
        );
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
                    We sent a verification link to
                </Text>
                <Text style={styles.email}>{email}</Text>

                {/* Instructions */}
                <Text style={styles.instructions}>
                    Tap the button in the email to verify your account and continue.
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

                {/* Status Indicator */}
                <View style={styles.statusContainer}>
                    <ActivityIndicator size="small" color="#9CA3AF" />
                    <Text style={styles.statusText}>
                        Checking for verification...
                    </Text>
                </View>

                {/* Wrong Email Link */}
                <TouchableOpacity
                    onPress={handleWrongEmail}
                    style={styles.wrongEmailContainer}
                >
                    <Text style={styles.wrongEmailText}>
                        Wrong email address?
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
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginLeft: 8,
    },
    wrongEmailContainer: {
        marginTop: 32,
        paddingVertical: 12,
    },
    wrongEmailText: {
        fontSize: 14,
        color: '#EF4444',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});

