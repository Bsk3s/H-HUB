import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { usePlacement } from 'expo-superwall';

export default function PaywallScreen({ navigation }) {
    const { registerPlacement, state } = usePlacement({
        onError: (err) => {
            console.error('💰 Paywall Error:', err);
        },
        onPresent: (info) => {
            console.log('💰 Paywall Presented:', info);
        },
        onDismiss: (info, result) => {
            console.log('💰 Paywall Dismissed:', info, 'Result:', result);

            // Check if user successfully subscribed
            if (result?.type === 'purchased' || result?.purchased) {
                console.log('✅ User subscribed! Navigating to app...');
                // Navigation will be handled by App.js when subscription status changes
            } else {
                console.log('❌ User did not subscribe - keeping on paywall (hard paywall)');
                // Stay on paywall screen - don't allow access without subscription
            }
        },
        onSkip: (reason) => {
            console.log('⚠️ Paywall Skipped:', reason);
        },
    });

    useEffect(() => {
        console.log('💰 Paywall state changed:', state);
    }, [state]);

    useEffect(() => {
        console.log('💰 PaywallScreen mounted - showing Superwall paywall');

        // Automatically trigger the paywall when screen loads
        const showPaywall = async () => {
            try {
                await registerPlacement({
                    placement: 'premium_access'
                });
            } catch (error) {
                console.error('💰 Error showing paywall:', error);
            }
        };

        showPaywall();
    }, []);

    return (
        <View style={styles.container}>
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
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
});


