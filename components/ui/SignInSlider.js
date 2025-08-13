import React, { useRef, useEffect, useState } from 'react';
import { View, Animated, PanResponder, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Svg, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../src/auth/context';

const AppleIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M16.3,12.3c0-2.3,1.9-3.4,2-3.4c-1.1-1.6-2.8-1.8-3.4-1.8c-1.4-0.1-2.8,0.8-3.5,0.8 c-0.7,0-1.8-0.8-3-0.8c-1.5,0-2.9,0.9-3.7,2.3c-1.6,2.8-0.4,6.8,1.1,9c0.8,1.1,1.7,2.3,2.9,2.3c1.2,0,1.6-0.8,3-0.8 c1.4,0,1.8,0.8,3,0.8c1.2,0,2-1.1,2.8-2.2c0.9-1.3,1.2-2.5,1.2-2.6C18.7,16,16.3,15.3,16.3,12.3z M14.2,6.9 c0.6-0.8,1.1-1.9,0.9-3c-0.9,0-2,0.6-2.6,1.4c-0.6,0.7-1.1,1.8-0.9,2.9C12.6,8.3,13.6,7.7,14.2,6.9z" fill="black"/>
  </Svg>
);

const GoogleIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" fill="#4285F4"/>
    <Path d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 20.29 7.565 24 12.255 24z" fill="#34A853"/>
    <Path d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z" fill="#FBBC05"/>
    <Path d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" fill="#EA4335"/>
  </Svg>
);

const MailIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <Path d="M22 6l-10 7L2 6"/>
  </Svg>
);

export default function SignInSlider({ isOpen, onClose, navigation }) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(isOpen ? 0 : 1)).current;
  const { signInWithGoogle, signInWithApple, loading, error } = useAuth();
  const [localError, setLocalError] = useState('');
  
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isOpen ? 0 : 1,
      useNativeDriver: true,
      tension: 20,
      friction: 8,
      overshootClamping: true
    }).start();
  }, [isOpen]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newValue = gestureState.dy / 150;
        slideAnim.setValue(Math.max(0, Math.min(1, newValue)));
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          onClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 20,
            friction: 8
          }).start();
        }
      },
    })
  ).current;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150],
  });

  const handleSignIn = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('📧 Email Sign In pressed - navigating to EmailSignInScreen');
    onClose(); // Close the slider first
    if (navigation?.navigate) {
      navigation.navigate('EmailSignIn');
    } else {
      console.error('Navigation not available in SignInSlider');
    }
  };

  const handleAppleSignIn = async () => {
    setLocalError('');
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('🍎 Apple Sign In pressed');
      const success = await signInWithApple();
      if (success) {
        console.log('✅ Apple Sign In successful');
        onClose(); // Close the slider on success
      }
    } catch (err) {
      console.error('Apple Sign In error:', err);
      setLocalError(err.message || 'Failed to sign in with Apple');
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError('');
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('🌟 Google Sign In pressed');
      const success = await signInWithGoogle();
      if (success) {
        console.log('✅ Google Sign In successful');
        onClose(); // Close the slider on success
      }
    } catch (err) {
      console.error('Google Sign In error:', err);
      setLocalError(err.message || 'Failed to sign in with Google');
    }
  };

  if (!isOpen) return null;

  return (
    <View style={[styles.container, { bottom: -insets.bottom }]}>
      <Animated.View 
        style={[
          styles.slider,
          { 
            transform: [{ translateY }],
            paddingBottom: insets.bottom,
          }
        ]}
        {...panResponder.panHandlers}
      >
        {/* Top drag handle */}
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        {/* Main content area */}
        <View style={styles.content}>
          
          {/* Apple Sign In */}
          <TouchableOpacity 
            onPress={handleAppleSignIn}
            style={styles.signInButton}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              <View style={styles.iconContainer}>
                <AppleIcon />
              </View>
              <Text style={styles.buttonText}>
                Sign in with Apple
              </Text>
            </View>
          </TouchableOpacity>

          {/* Google Sign In */}
          <TouchableOpacity 
            onPress={handleGoogleSignIn}
            style={styles.signInButton}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              <View style={styles.iconContainer}>
                <GoogleIcon />
              </View>
              <Text style={styles.buttonText}>
                Sign in with Google
              </Text>
            </View>
          </TouchableOpacity>

          {/* Email Sign In */}
          <TouchableOpacity 
            onPress={handleSignIn}
            style={[styles.signInButton, styles.lastButton]}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              <View style={styles.iconContainer}>
                <MailIcon />
              </View>
              <Text style={styles.buttonText}>
                Sign in with Email
              </Text>
            </View>
          </TouchableOpacity>

          {/* Show error and loading states */}
          {(error || localError) ? (
            <Text style={styles.errorText}>{error?.message || localError}</Text>
          ) : null}
          {loading ? (
            <Text style={styles.loadingText}>Signing in...</Text>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  slider: {
    backgroundColor: '#262626', // bg-neutral-800
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 230,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
  },
  dragHandle: {
    width: 48,
    height: 4,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 24,
  },
  signInButton: {
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastButton: {
    marginBottom: 24,
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  buttonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 18,
  },
  errorText: {
    color: '#ef4444', // text-red-600
    textAlign: 'center',
    marginTop: 8,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#ffffff',
  },
});
