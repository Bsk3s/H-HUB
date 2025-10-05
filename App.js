import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LogBox, View, ActivityIndicator, Text } from 'react-native';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SuperwallProvider, useSuperwall } from 'expo-superwall';

// Import providers
import { AuthProvider, useAuth } from './src/auth/context';
import { FeedbackProvider } from './src/components/feedback/FeedbackProvider';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { useTheme } from './src/hooks/useTheme';

// Import migration helper
import { migrateJournalsToSupabase } from './services/migrateJournalsToSupabase';

// Import auth services
import { checkEmailVerified, checkPremiumAccess } from './src/auth/services/auth-service';

// Import screens
import LandingScreen from './screens/LandingScreen';
import HomeScreen from './screens/HomeScreen';
import OnboardingNavigator from './components/navigation/OnboardingNavigator';
import EmailSignInScreen from './screens/EmailSignInScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import PaywallScreen from './screens/PaywallScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import HelpScreen from './screens/HelpScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import StoriesScreen from './screens/StoriesScreen';
import StoryDetailScreen from './screens/StoryDetailScreen';

const Stack = createNativeStackNavigator();

// Auth Stack - for non-authenticated users AND unverified users
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="Landing"
    >
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen
        name="Onboarding"
        options={{ gestureEnabled: false }} // Disable swipe back to Landing
      >
        {(props) => <OnboardingNavigator {...props} parentNavigation={props.navigation} />}
      </Stack.Screen>
      <Stack.Screen name="EmailSignIn" component={EmailSignInScreen} />
      <Stack.Screen
        name="EmailVerification"
        component={EmailVerificationScreen}
        options={{ gestureEnabled: false }} // Prevent swiping back
      />
    </Stack.Navigator>
  );
}

// App Stack - for authenticated users
function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="Home"
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ gestureEnabled: false }} // Prevent swiping back to login
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Stories" component={StoriesScreen} />
      <Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
    </Stack.Navigator>
  );
}

// Root Navigator - switches between Auth and App stacks based on auth state
function RootNavigator() {
  const { user, initializing } = useAuth();
  const { colors } = useTheme();
  const [isVerified, setIsVerified] = useState(null);
  const [checkingVerification, setCheckingVerification] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(null);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(null);
  const [checkingPremiumAccess, setCheckingPremiumAccess] = useState(true);

  // Check subscription status using Superwall
  const { subscriptionStatus } = useSuperwall();

  // Update subscription state when Superwall status changes
  useEffect(() => {
    if (subscriptionStatus) {
      const isSubscribed = subscriptionStatus === 'ACTIVE';
      console.log(`💰 Superwall subscription: ${isSubscribed ? '✅ Active' : '❌ Inactive'}`);
      setHasSubscription(isSubscribed);
    }
  }, [subscriptionStatus]);

  // Check database premium access flag when user changes
  useEffect(() => {
    async function checkDatabaseAccess() {
      if (user && !initializing) {
        setCheckingPremiumAccess(true);
        console.log('🔍 Checking database premium access flag...');
        const hasAccess = await checkPremiumAccess(user.id);
        console.log(`🎫 Database premium access: ${hasAccess ? '✅ Granted (admin override)' : '❌ Not granted'}`);
        setHasPremiumAccess(hasAccess);
        setCheckingPremiumAccess(false);
      } else if (!user) {
        setHasPremiumAccess(null);
        setCheckingPremiumAccess(false);
      }
    }

    checkDatabaseAccess();
  }, [user, initializing]);

  // Check email verification status when user changes
  useEffect(() => {
    async function checkVerification() {
    if (user && !initializing) {
        console.log('🔍 Checking email verification status...');
        const verified = await checkEmailVerified();
        console.log(`📧 Email verification status: ${verified ? '✅ Verified' : '❌ Not verified'}`);
        setIsVerified(verified);
        setCheckingVerification(false);
      } else if (!user) {
        // No user logged in - reset verification state
        console.log('👤 No user - resetting verification state');
        setIsVerified(null);
        setHasSubscription(null);
        setCheckingVerification(false);
      }
    }

    checkVerification();
  }, [user, initializing]);

  // Listen for deep links (verification callback)
  useEffect(() => {
    const handleDeepLink = async ({ url }) => {
      console.log('🔗 Deep link received:', url);

      if (url && url.includes('callback')) {
        // This is an email verification callback
        console.log('🔄 Verification callback detected, processing...');
        setCheckingVerification(true);

        try {
          // Import supabase here to use it
          const { supabase } = await import('./src/auth/supabase-client');

          // Check for authorization code (PKCE flow)
          const queryString = url.split('?')[1];
          if (queryString) {
            const params = new URLSearchParams(queryString);
            const code = params.get('code');

            if (code) {
              console.log('🔑 Found authorization code, exchanging for session...');

              // Exchange the code for a session
              const { data, error } = await supabase.auth.exchangeCodeForSession(code);

              if (error) {
                console.error('❌ Error exchanging code for session:', error.message);
              } else if (data.session) {
                console.log('✅ Session established from code exchange!');
                console.log('✅ Email verified! User:', data.user.email);
                setIsVerified(true);

                // Clear onboarding progress now that email is verified
                try {
                  await AsyncStorage.removeItem('onboardingProgress');
                  console.log('🗑️ Cleared onboarding progress after verification');
                } catch (err) {
                  console.error('Error clearing onboarding progress:', err);
                }
              }
              setCheckingVerification(false);
              return;
            }
          }

          // Fallback: Check for tokens in hash (old flow)
          const hashParams = url.split('#')[1];
          if (hashParams) {
            const params = new URLSearchParams(hashParams);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
              console.log('🔑 Found tokens in callback URL, establishing session...');

              // Set the session with the tokens from the URL
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (error) {
                console.error('❌ Error setting session from callback:', error.message);
              } else if (data.session) {
                console.log('✅ Session established from verification callback!');
                console.log('✅ Email verified! User:', data.user.email);
                setIsVerified(true);

                // Clear onboarding progress now that email is verified
                try {
                  await AsyncStorage.removeItem('onboardingProgress');
                  console.log('🗑️ Cleared onboarding progress after verification');
                } catch (err) {
                  console.error('Error clearing onboarding progress:', err);
                }
              }
              setCheckingVerification(false);
              return;
            }
          }

          // No code or tokens found - just recheck status
          console.log('⚠️ No code or tokens found in callback URL, rechecking status...');
          const verified = await checkEmailVerified();
          if (verified) {
            console.log('✅ Email verified!');
            setIsVerified(true);
          }
        } catch (error) {
          console.error('❌ Error processing verification callback:', error);
        } finally {
          setCheckingVerification(false);
        }
      } else if (url && (url.includes('verify') || url.includes('verified'))) {
        // Custom verification trigger (from polling)
        console.log('🔄 Verification trigger detected, rechecking status...');
        setCheckingVerification(true);
        const verified = await checkEmailVerified();
        if (verified) {
          console.log('✅ Email verified! Updating state...');
          setIsVerified(true);
        }
        setCheckingVerification(false);
      }
    };

    // Listen for links when app is already open
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened via deep link
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Run one-time migration when user is authenticated and verified
  useEffect(() => {
    if (user && !initializing && isVerified) {
      console.log('🔄 User authenticated and verified, checking for journal migration...');
      migrateJournalsToSupabase()
        .then(result => {
          if (result.success && !result.alreadyMigrated) {
            console.log(`✅ Migrated ${result.migratedCount} journals to Supabase`);
            if (result.errorCount > 0) {
              console.log(`⚠️ ${result.errorCount} journals failed to migrate`);
            }
          }
        })
        .catch(error => {
          console.error('❌ Migration error:', error);
        });
    }
  }, [user, initializing, isVerified]);

  // Show loading while checking verification
  if (initializing || (user && checkingVerification)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Routing logic
  // 1. No user → AuthStack (Landing, Onboarding, etc.)
  // 2. User exists but NOT verified → EmailVerificationScreen
  // 3. User exists AND verified but NO subscription → PaywallScreen
  // 4. User exists AND verified AND has subscription → AppStack (full access)

  if (!user) {
    // Not logged in - show auth flow
    console.log('🔓 No user - showing AuthStack');
    return (
      <>
        <StatusBar style="dark" />
        <AuthStack />
      </>
    );
  }

  if (user && isVerified !== true) {
    // User logged in but email not verified (or verification status unknown)
    // Show verification screen until we confirm they're verified
    console.log('⚠️ User not verified, showing EmailVerificationScreen');
    return (
      <>
        <StatusBar style="dark" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="EmailVerification"
            component={EmailVerificationScreen}
            initialParams={{ email: user?.email || '' }}
            options={{ gestureEnabled: false }}
          />
        </Stack.Navigator>
      </>
    );
  }

  if (user && isVerified === true) {
    // Wait for database access check to complete
    if (checkingPremiumAccess) {
      console.log('⏳ Checking premium access...');
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Loading...</Text>
        </View>
      );
    }

    // User is verified - now check access (Superwall subscription OR database flag)
    const hasAnyAccess = hasSubscription === true || hasPremiumAccess === true;

    if (!hasAnyAccess) {
      // No Superwall subscription AND no database access - show hard paywall
      console.log('💰 User verified but no access - showing PaywallScreen');
      console.log(`   - Superwall: ${hasSubscription === true ? '✅' : '❌'}`);
      console.log(`   - Database: ${hasPremiumAccess === true ? '✅' : '❌'}`);
      return (
        <>
          <StatusBar style="dark" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ gestureEnabled: false }}
            />
          </Stack.Navigator>
        </>
      );
    }

    // User has access (either via Superwall OR database flag) - show app
    console.log('✅ User verified and has access - showing AppStack');
    if (hasSubscription === true) {
      console.log('   ✅ Access granted via: Superwall subscription (paid)');
    }
    if (hasPremiumAccess === true) {
      console.log('   ✅ Access granted via: Database flag (admin override)');
    }
    return (
      <>
        <StatusBar style="dark" />
        <AppStack />
      </>
    );
  }

  // Fallback (shouldn't reach here, but just in case)
  console.log('🔓 No user - showing AuthStack');
  return (
    <>
      <StatusBar style="dark" />
      <AuthStack />
    </>
  );
}

export default function App() {
  // Suppress ugly error messages in production
  LogBox.ignoreAllLogs(true);

  return (
    <SuperwallProvider
      apiKeys={{
        ios: 'pk_9abf3947d5af4d1ca39c806925aa53563e6314e2e13f4c49',
        android: 'pk_9abf3947d5af4d1ca39c806925aa53563e6314e2e13f4c49'
      }}
    >
    <ThemeProvider>
      <FeedbackProvider>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </FeedbackProvider>
    </ThemeProvider>
    </SuperwallProvider>
  );
}