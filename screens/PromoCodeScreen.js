import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../src/auth/context';
import { supabase } from '../src/auth/supabase-client';
import { SUPABASE_URL } from '../src/config/supabase';
import { initializeAuth, AUTH_STATUS } from '../src/auth/services/auth-initialization';

export default function PromoCodeScreen({ navigation }) {
  const { user, setAuthState } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  const handleRedeem = async () => {
    Keyboard.dismiss();
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode) {
      setError('Please enter a promo code');
      return;
    }

    if (!user?.id) {
      setError('You must be signed in to redeem a code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Session expired. Please sign in again.');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/redeem-promo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ code: trimmedCode }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 && (data.already_redeemed || data.already_premium)) {
          setSuccess(true);
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await grantAccessAndNavigate();
          return;
        }

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(data.error || 'Invalid promo code');
        setLoading(false);
        return;
      }

      // Success
      setSuccess(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(async () => {
        await grantAccessAndNavigate();
      }, 1200);

    } catch (err) {
      console.error('Promo redemption error:', err);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Something went wrong. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const grantAccessAndNavigate = async () => {
    try {
      await supabase.auth.refreshSession();
      const authResult = await initializeAuth(user, true);
      setAuthState(authResult);
      console.log('✅ Promo redeemed - auth state updated to:', authResult.status);
    } catch (navError) {
      console.error('Navigation error after promo:', navError);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  };

  const handleSkip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Paywall');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>Have an access code?</Text>
          <Text style={styles.subtitle}>
            Enter your code below to unlock free premium access
          </Text>

          {/* Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                error && styles.inputError,
                success && styles.inputSuccess,
              ]}
              placeholder="Enter code"
              placeholderTextColor="#9CA3AF"
              value={code}
              onChangeText={(text) => {
                setCode(text.toUpperCase());
                setError(null);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={handleRedeem}
              editable={!loading && !success}
              maxLength={20}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {success && (
              <Text style={styles.successText}>
                Code redeemed! Loading your content...
              </Text>
            )}
          </View>

          {/* Bottom section: Redeem button + skip */}
          <View style={styles.bottomSection}>
            {/* Redeem button */}
            <TouchableOpacity
              style={[
                styles.redeemButton,
                (!code.trim() || loading || success) && styles.redeemButtonDisabled,
              ]}
              onPress={handleRedeem}
              disabled={!code.trim() || loading || success}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : success ? (
                <Text style={styles.redeemButtonText}>Unlocked!</Text>
              ) : (
                <Text style={styles.redeemButtonText}>Redeem Code</Text>
              )}
            </TouchableOpacity>

            {/* Skip */}
            <TouchableOpacity
              onPress={handleSkip}
              style={styles.skipButton}
              activeOpacity={0.7}
              disabled={loading || success}
            >
              <Text style={styles.skipText}>I don't have a code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputSuccess: {
    borderColor: '#10B981',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 10,
    marginLeft: 4,
  },
  successText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginLeft: 4,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 24,
  },
  redeemButton: {
    width: '90%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3A3A3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  redeemButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  redeemButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
