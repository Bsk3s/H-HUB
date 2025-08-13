import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import the animated text hooks
import useRotatingText from '../hooks/useRotatingText';
import useTypingText from '../hooks/useTypingText';

// Import UI components
import Button from '../components/ui/Button';
import SignInSlider from '../components/ui/SignInSlider';

export default function LandingScreen({ navigation }) {
  const [error, setError] = useState(null);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  
  // Animated text hooks
  const { text, textColor } = useRotatingText();
  const { displayedText } = useTypingText("Use Heavenly Hub to", 35);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    try {
      checkAuthStatus();
    } catch (err) {
      console.error('Error in useEffect:', err);
      setError(err.message);
      Alert.alert('Startup Error', err.message);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking auth status on app startup...');
      
      // First check AsyncStorage for quick determination
      const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
      console.log('💾 AsyncStorage isAuthenticated:', isAuthenticated);
      
      const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
      console.log('📋 Onboarding completed:', onboardingCompleted);
      
      // For now, just check AsyncStorage (we'll add Supabase later)
      if (isAuthenticated === 'true') {
        console.log('✅ Auth check complete - redirecting to main app');
        navigation.navigate('Home'); // Navigate to main app
      } else {
        console.log('👋 No active session found - staying on welcome screen');
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      setError(error.message);
      Alert.alert('Auth Check Error', error.message);
    }
  };

  const handleGetStarted = () => {
    console.log('🚀 Get Started pressed - navigating to onboarding');
    navigation.navigate('Onboarding');
  };

  const handleLogin = () => {
    console.log('🔑 Login pressed - opening sign in slider');
    setIsSignInOpen(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.typingText}>
          {displayedText}
        </Text>
        <Text style={[styles.rotatingText, { color: textColor }]}>
          {text}
        </Text>
      </View>

      {/* Bottom Buttons */}
      <View style={[styles.buttonsContainer, { bottom: insets.bottom + 18 }]}>
        <View style={styles.buttonWrapper}>
          <Button
            onPress={handleGetStarted}
            title="Get Started"
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            onPress={handleLogin}
            title="I already have an account"
          />
        </View>
      </View>

              {/* Sign In Slider */}
        <View style={[styles.slidersContainer, { bottom: 0 }]}>
          <SignInSlider
            isOpen={isSignInOpen}
            onClose={() => setIsSignInOpen(false)}
            navigation={navigation}
          />
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    backgroundColor: '#EF4444',
    padding: 16,
  },
  errorText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  typingText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  rotatingText: {
    fontSize: 30,
    fontWeight: '300',
    textAlign: 'center',
    // color is set dynamically via textColor prop
  },
  buttonsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  buttonWrapper: {
    marginBottom: 16,
    alignItems: 'center',
  },
  slidersContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },

});
