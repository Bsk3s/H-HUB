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
} from 'react-native';
import { resendVerificationEmail, checkEmailVerified, deleteCurrentUser } from '../src/auth/services/auth-service';
import { ensureUserProfile } from '../src/auth/services/profile-service';
import { useAuth } from '../src/auth/context';
import Button from '../components/ui/Button';

export default function EmailVerificationScreen({ route, navigation }) {
    const { user } = useAuth();
    // Get email from route params or from authenticated user
    const email = route.params?.email || user?.email || '';
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isChecking, setIsChecking] = useState(true);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    // Polling: Check verification status every 5 seconds
    // This is the PRIMARY verification mechanism (deep link is secondary/bonus)
    useEffect(() => {
        console.log('📧 EmailVerificationScreen mounted - starting polling in 2 seconds...');
        let pollInterval;
        let isVerified = false;

        const checkVerification = async () => {
            // Don't check if already verified (prevent race condition)
            if (isVerified) return;

            try {
                const verified = await checkEmailVerified();
                if (verified) {
                    console.log('✅ Email verified via polling! Creating user profile...');
                    isVerified = true;
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
            console.log('📧 Starting verification polling now (every 5s)...');
            checkVerification().then(() => setIsChecking(false));

            // Then poll every 5 seconds (not too aggressive for rate limiting)
            pollInterval = setInterval(checkVerification, 5000);
        }, 2000);

        return () => {
            console.log('📧 EmailVerificationScreen unmounting - stopping polling');
            isVerified = true; // Prevent any pending checks
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

    const handleWrongEmail = async () => {
        if (isDeletingAccount) return; // Prevent double-tap

        Alert.alert(
            'Change Email Address?',
            'This will delete your account and you can create a new one with the correct email.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Change Email',
                    style: 'destructive',
                    onPress: async () => {
                        setIsDeletingAccount(true);
                        try {
                            console.log('🗑️ Deleting account with wrong email...');

                            // Delete the account (will also sign out)
                            const result = await deleteCurrentUser();

                            if (result.success) {
                                if (result.deletedCompletely) {
                                    console.log('✅ Account deleted successfully');
                                } else {
                                    console.log('✅ Signed out successfully (account may still exist)');
                                }

                                // Reset navigation to proper state - removes EmailVerification from history
                                console.log('🔄 Resetting navigation to SignUpScreen with proper history');
                                navigation.reset({
                                    index: 1,
                                    routes: [
                                        { name: 'FinalScreen' },
                                        { name: 'SignUpScreen' }
                                    ],
                                });
                            }
                        } catch (error) {
                            console.error('❌ Error handling wrong email:', error);
                            Alert.alert(
                                'Error',
                                'Failed to change email. Please try again.',
                                [{ text: 'OK' }]
                            );
                        } finally {
                            setIsDeletingAccount(false);
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

                {/* Wrong Email Button - Larger, More Obvious */}
                <TouchableOpacity
                    onPress={handleWrongEmail}
                    style={styles.wrongEmailButton}
                    activeOpacity={0.7}
                    disabled={isDeletingAccount}
                >
                    <Text style={[styles.wrongEmailText, isDeletingAccount && { opacity: 0.5 }]}>
                        {isDeletingAccount ? 'Changing email...' : 'Wrong email address?'}
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
    wrongEmailButton: {
        marginTop: 32,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    wrongEmailText: {
        fontSize: 14,
        color: '#EF4444',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});

