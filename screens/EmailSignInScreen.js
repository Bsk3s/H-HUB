import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import BackButton from '../components/ui/BackButton';
import Button from '../components/ui/Button';
import { useAuth } from '../src/auth/context';

export default function EmailSignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const [localError, setLocalError] = useState('');

  const handleBack = () => {
    if (navigation.goBack) {
      navigation.goBack();
    } else {
      navigation.navigate('Landing');
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    setLocalError('');
    try {
      const success = await login(email, password);
      if (success) {
        console.log('✅ Email Sign In successful - AppStack will be rendered automatically');
        // Auth context will automatically switch to AppStack
        // No need to manually navigate
      }
    } catch (err) {
      console.error('Email sign in error:', err);
      setLocalError(err.message || 'Failed to sign in');
    }
  };

  const handleForgotPassword = () => {
    // TODO: Navigate to forgot password screen
    console.log('🔄 Forgot Password pressed - TODO: Create ForgotPasswordScreen');
    Alert.alert('Coming Soon', 'Forgot password feature will be available soon.');
  };

  const handleSignUp = () => {
    console.log('📝 Sign Up pressed - navigating to onboarding');
    navigation.navigate('Onboarding');
  };

  const isValid = email.length > 0 && password.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <BackButton onPress={handleBack} />

          <View style={styles.headerSection}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your journey.
            </Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordText}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* Show error */}
          {(error || localError) && (
            <Text style={styles.errorText}>{error?.message || localError}</Text>
          )}

          <View style={styles.buttonSection}>
            <Button
              onPress={handleSignIn}
              title="Sign In"
              disabled={!isValid || loading}
            />
            <TouchableOpacity
              style={styles.signUpPrompt}
              onPress={handleSignUp}
            >
              <Text style={styles.signUpPromptText}>
                Don't have an account? <Text style={styles.signUpLink}>Sign up</Text>
              </Text>
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
    marginBottom: 8,
    color: '#000000',
  },
  subtitle: {
    fontSize: 20,
    color: '#6B7280',
  },
  formSection: {
    gap: 16,
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
  forgotPasswordContainer: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  buttonSection: {
    marginTop: 'auto',
    marginBottom: 16,
    alignItems: 'center',
  },
  signUpPrompt: {
    marginTop: 24,
  },
  signUpPromptText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#6B7280',
  },
  signUpLink: {
    color: '#2563EB',
  },
});


