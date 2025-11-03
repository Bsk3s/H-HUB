import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity, SafeAreaView, Linking, ScrollView } from 'react-native';
import { usePlacement, useSuperwall } from 'expo-superwall';
import { useAuth } from '../src/auth/context';
import { updatePremiumAccess } from '../src/auth/services/auth-service';
import { supabase } from '../src/auth/supabase-client';

export default function PaywallScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [paywallDismissed, setPaywallDismissed] = useState(false);
    const { subscriptionStatus } = useSuperwall();

    const { registerPlacement, state } = usePlacement({
        onError: (err) => {
            console.error('💰 Paywall Error:', err);
        },
        onPresent: (info) => {
            console.log('💰 Paywall Presented:', info);
        },
        onDismiss: async (info, result) => {
            console.log('💰 Paywall Dismissed!');
            console.log('💰 Dismiss Info:', JSON.stringify(info, null, 2));
            console.log('💰 Dismiss Result:', JSON.stringify(result, null, 2));

            // Log ALL properties to see what Superwall is actually sending
            console.log('💰 Result keys:', Object.keys(result || {}));
            console.log('💰 Info keys:', Object.keys(info || {}));

            // Check if user successfully subscribed
            if (result?.type === 'purchased' || result?.purchased) {
                console.log('✅ User subscribed! Updating Supabase...');

                // Update premium access in Supabase
                if (user?.id) {
                    const success = await updatePremiumAccess(user.id, true);
                    if (success) {
                        console.log('✅ Premium access updated in Supabase');
                        console.log('🔄 Refreshing auth session to trigger navigation...');

                        // Refresh the session which will trigger App.js's useEffect to re-check auth
                        // This will cause the app to detect premium access and navigate to Home
                        await supabase.auth.refreshSession();
                        console.log('✅ Session refreshed - App.js should now route to Home');
                    } else {
                        console.error('❌ Failed to update premium access');
                    }
                }

                return;
            }

            // Check EVERY possible way Superwall might indicate "login" clicked
            const resultStr = JSON.stringify(result).toLowerCase();
            const infoStr = JSON.stringify(info).toLowerCase();

            console.log('💰 Checking for login indicators...');
            console.log('   result contains "login":', resultStr.includes('login'));
            console.log('   result contains "restore":', resultStr.includes('restore'));
            console.log('   result contains "account":', resultStr.includes('account'));
            console.log('   info contains "login":', infoStr.includes('login'));
            console.log('   info contains "restore":', infoStr.includes('restore'));
            console.log('   info contains "account":', infoStr.includes('account'));

            // If ANY indication of login/restore, navigate
            if (resultStr.includes('login') || resultStr.includes('restore') || resultStr.includes('account') ||
                infoStr.includes('login') || infoStr.includes('restore') || infoStr.includes('account')) {
                console.log('🔑 Login/Restore detected - navigating to EmailSignIn');
                navigation.navigate('EmailSignIn');
                return;
            }

            // User dismissed without purchasing - show button UI instead of auto-reshowing
            console.log('✅ User dismissed paywall - showing subscribe button UI');
            setPaywallDismissed(true);
        },
        onSkip: (reason) => {
            console.log('⚠️ Paywall Skipped:', reason);
        },
    });

    useEffect(() => {
        console.log('💰 Paywall state changed:', state);
    }, [state]);

    // Monitor subscription status - if it becomes active, the user is subscribed
    useEffect(() => {
        if (subscriptionStatus === 'ACTIVE') {
            console.log('✅ Subscription detected as ACTIVE on PaywallScreen');
            console.log('   App.js should handle routing to home screen');
            // The actual routing is handled by App.js which monitors subscriptionStatus
            // We just need to wait for it to update
        }
    }, [subscriptionStatus]);

    useEffect(() => {
        console.log('💰 PaywallScreen mounted - showing Superwall paywall');

        // Reset dismissed state when screen loads
        setPaywallDismissed(false);

        // Automatically trigger the paywall when screen loads
        const showPaywall = async () => {
            try {
                await registerPlacement({
                    placement: 'premium_access',
                    params: {
                        isAuthenticated: !!user,
                        userEmail: user?.email || 'guest'
                    }
                });
            } catch (error) {
                console.error('💰 Error showing paywall:', error);
            }
        };

        showPaywall();
    }, [user]);

    return (
        <SafeAreaView style={styles.container}>
            {subscriptionStatus === 'ACTIVE' ? (
                // Show success message when subscription is detected
                <View style={styles.loadingContainer}>
                    <Text style={styles.successEmoji}>✅</Text>
                    <Text style={styles.successTitle}>Subscription Active!</Text>
                    <Text style={styles.successMessage}>
                        Loading your content...
                    </Text>
                    <ActivityIndicator size="large" color="#667eea" style={{ marginTop: 20 }} />
                </View>
            ) : !paywallDismissed ? (
                // Show loading state while paywall is active
                <>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#667eea" />
                        <Text style={styles.statusText}>
                            Loading paywall...
                        </Text>
                        {state.status === 'error' && (
                            <Text style={styles.errorText}>
                                Error: {state.error}
                            </Text>
                        )}
                        {state.status === 'skipped' && (
                            <Text style={styles.errorText}>
                                Paywall skipped: {state.reason?.type || 'Unknown reason'}
                            </Text>
                        )}
                    </View>
                </>
            ) : (
                // Show subscribe button UI when paywall is dismissed
                <ScrollView
                    style={styles.dismissedContainer}
                    contentContainerStyle={styles.dismissedContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.heroSection}>
                        <Text style={styles.heroEmoji}>🌟</Text>
                        <Text style={styles.heroTitle}>Premium Access Required</Text>
                        <Text style={styles.heroSubtitle}>
                            Unlock the full spiritual growth experience
                        </Text>
                    </View>

                    <View style={styles.featuresSection}>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureEmoji}>💬</Text>
                            <View style={styles.featureText}>
                                <Text style={styles.featureTitle}>AI Spiritual Conversations</Text>
                                <Text style={styles.featureDescription}>
                                    Daily guided dialogue that feels personal and alive
                                </Text>
                            </View>
                        </View>

                        <View style={styles.featureItem}>
                            <Text style={styles.featureEmoji}>📖</Text>
                            <View style={styles.featureText}>
                                <Text style={styles.featureTitle}>Unlimited Bible Study</Text>
                                <Text style={styles.featureDescription}>
                                    Explore Scripture with AI-powered insights
                                </Text>
                            </View>
                        </View>

                        <View style={styles.featureItem}>
                            <Text style={styles.featureEmoji}>✍️</Text>
                            <View style={styles.featureText}>
                                <Text style={styles.featureTitle}>Personal Prayer Journal</Text>
                                <Text style={styles.featureDescription}>
                                    Track your faith journey and reflections
                                </Text>
                            </View>
                        </View>

                        <View style={styles.featureItem}>
                            <Text style={styles.featureEmoji}>🎯</Text>
                            <View style={styles.featureText}>
                                <Text style={styles.featureTitle}>Exclusive Content</Text>
                                <Text style={styles.featureDescription}>
                                    Bible stories, discussions, and real faith topics
                                </Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.subscribeButton}
                        onPress={async () => {
                            console.log('🔄 User tapped subscribe button - showing paywall');
                            setPaywallDismissed(false);
                            await registerPlacement({
                                placement: 'premium_access',
                                params: {
                                    isAuthenticated: !!user,
                                    userEmail: user?.email || 'guest'
                                }
                            });
                        }}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.subscribeButtonText}>View Subscription Plans</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {/* Legal Links - Required by Apple for auto-renewable subscriptions */}
            <View style={styles.legalContainer}>
                <View style={styles.legalLinksRow}>
                    <TouchableOpacity
                        onPress={() => Linking.openURL('https://a-heavenlyhub.com/privacy')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.legalLink}>Privacy Policy</Text>
                    </TouchableOpacity>
                    <Text style={styles.legalSeparator}>•</Text>
                    <TouchableOpacity
                        onPress={() => Linking.openURL('https://a-heavenlyhub.com/terms')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.legalLink}>Terms of Use</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Conditional bottom button based on auth state */}
            <View style={styles.bottomContainer}>
                {!user ? (
                    // Show login button only for unauthenticated users
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => {
                            console.log('🔑 Unauthenticated user pressed "Log in"');
                            navigation.navigate('EmailSignIn');
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.loginButtonText}>
                            Already have an account? <Text style={styles.loginButtonBold}>Log in</Text>
                        </Text>
                    </TouchableOpacity>
                ) : (
                    // Show sign out button for authenticated users
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={async () => {
                            console.log('🚪 Authenticated user pressed "Sign out"');

                            // Set dismissed state to prevent paywall from showing
                            setPaywallDismissed(true);

                            // Logout
                            await logout();
                            console.log('✅ Signed out successfully - navigating to Landing');

                            // Navigate explicitly - no navigator remount
                            navigation.navigate('Landing');
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.signOutText}>
                            Switch accounts? <Text style={styles.signOutBold}>Sign out</Text>
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        marginTop: 16,
        fontSize: 14,
        color: '#ef4444',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    successEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#10B981',
        marginBottom: 8,
    },
    successMessage: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    dismissedContainer: {
        flex: 1,
    },
    dismissedContent: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 140,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    heroEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    featuresSection: {
        marginBottom: 32,
    },
    featureItem: {
        flexDirection: 'row',
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    featureEmoji: {
        fontSize: 32,
        marginRight: 16,
        marginTop: 4,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    subscribeButton: {
        backgroundColor: '#667eea',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    subscribeButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    legalContainer: {
        position: 'absolute',
        bottom: 90,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    legalLinksRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    legalLink: {
        fontSize: 12,
        color: '#667eea',
        textDecorationLine: 'underline',
    },
    legalSeparator: {
        fontSize: 12,
        color: '#9CA3AF',
        marginHorizontal: 8,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 40,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    loginButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    loginButtonText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    loginButtonBold: {
        fontWeight: '700',
        color: '#667eea',
    },
    signOutText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    signOutBold: {
        fontWeight: '700',
        color: '#EF4444',
    },
});


