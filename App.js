import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LogBox, View, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';

import { SuperwallProvider, useSuperwall } from 'expo-superwall';

// Import providers
import { AuthProvider, useAuth } from './src/auth/context';
import { FeedbackProvider } from './src/components/feedback/FeedbackProvider';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { useTheme } from './src/hooks/useTheme';

// Import migration helper
import { migrateJournalsToSupabase } from './services/migrateJournalsToSupabase';

// Import auth initialization
import { initializeAuth, AUTH_STATUS, clearAuthState } from './src/auth/services/auth-initialization';

// Keep splash screen visible until we're ready
SplashScreen.preventAutoHideAsync().catch(() => {
  // In case it's already hidden or there's an error
  console.log('⚠️ Could not prevent splash screen auto hide');
});

// Import screens
import LandingScreen from './screens/LandingScreen';
import HomeScreen from './screens/HomeScreen';
import OnboardingNavigator from './components/navigation/OnboardingNavigator';
import EmailSignInScreen from './screens/EmailSignInScreen';
import PaywallScreen from './screens/PaywallScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import PasswordResetConfirmationScreen from './screens/PasswordResetConfirmationScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
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
        gestureEnabled: false, // Disable all swipe gestures in auth flow
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
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen
        name="PasswordResetConfirmation"
        component={PasswordResetConfirmationScreen}
        options={{ gestureEnabled: false }} // Prevent swiping back
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ gestureEnabled: false }} // Prevent swiping back while resetting
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
        gestureEnabled: false, // Disable all swipe gestures in main app
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

// Root Navigator - Production-grade auth with no screen flashing
function RootNavigator() {
  const { user, logout, authState, setAuthState } = useAuth();
  const { colors } = useTheme();
  const [appIsReady, setAppIsReady] = useState(false);

  // Check subscription status using Superwall
  const { subscriptionStatus } = useSuperwall();

  // Initialize auth on mount (ONCE)
  useEffect(() => {
    async function initializeApp() {
      try {
        console.log('🚀 App initializing...');

        // Run auth initialization
        const authResult = await initializeAuth();

        // Set auth state
        setAuthState(authResult);

        // Mark app as ready
        setAppIsReady(true);

        // Hide splash screen
        await SplashScreen.hideAsync();
        console.log('✅ App ready');
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        // Still mark as ready to prevent infinite loading
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    initializeApp();
  }, []);

  // Listen for logout - when user goes from logged in to logged out
  useEffect(() => {
    // Only clear auth state if we had a user and now don't (actual logout)
    // Don't run on initial mount when both are null
    if (user === null && authState && authState.status !== AUTH_STATUS.UNAUTHENTICATED && appIsReady) {
      console.log('🚪 User logged out - re-initializing auth');
      // Re-run initialization instead of just clearing
      async function handleLogout() {
        const authResult = await initializeAuth();
        setAuthState(authResult);
      }
      handleLogout();
    }
  }, [user]);

  // REMOVED: The useEffect that was causing double renders
  // Now authState updates directly in the login function in AuthContext

  // Update subscription state when Superwall status changes
  useEffect(() => {
    if (subscriptionStatus && authState) {
      const isSubscribed = subscriptionStatus === 'ACTIVE';
      console.log(`💰 Superwall subscription: ${isSubscribed ? '✅ Active' : '❌ Inactive'}`);

      // Update auth state if subscription status changed
      if (isSubscribed && authState.status === AUTH_STATUS.AUTHENTICATED_NO_ACCESS) {
        setAuthState({
          ...authState,
          status: AUTH_STATUS.AUTHENTICATED_WITH_ACCESS,
          hasSubscription: true,
        });
      }
    }
  }, [subscriptionStatus, authState]);

  // Listen for deep links (verification callback and password reset)
  useEffect(() => {
    const handleDeepLink = async ({ url }) => {
      console.log('🔗 Deep link received:', url);

      if (url && url.includes('callback')) {
        try {
          // Import supabase here to use it
          const { supabase } = await import('./src/auth/supabase-client');

          // Check for authorization code (PKCE flow)
          const queryString = url.split('?')[1];
          if (queryString) {
            const params = new URLSearchParams(queryString);
            const error = params.get('error');
            const errorCode = params.get('error_code');
            const errorDescription = params.get('error_description');
            const code = params.get('code');
            const type = params.get('type');

            // Handle errors from Supabase (expired links, etc.)
            if (error) {
              console.error('❌ Deep link error:', error, errorCode, errorDescription);

              let userMessage = 'There was an issue with the verification link.';

              if (errorCode === 'otp_expired') {
                userMessage = 'This verification link has expired. Please tap "Resend Email" to get a new one.';
              }

              Alert.alert(
                'Verification Link Issue',
                userMessage,
                [{ text: 'OK' }]
              );
              return;
            }

            if (code) {
              console.log('🔑 Found authorization code, exchanging for session...');

              // Retry mechanism for network failures
              let data = null;
              let error = null;
              const maxRetries = 3;

              for (let attempt = 1; attempt <= maxRetries; attempt++) {
                console.log(`   Attempt ${attempt}/${maxRetries}...`);

                const result = await supabase.auth.exchangeCodeForSession(code);
                data = result.data;
                error = result.error;

                if (!error) {
                  console.log(`✅ Session exchange succeeded on attempt ${attempt}`);
                  break;
                }

                console.log(`   Failed: ${error.message}`);

                // Wait before retry (exponential backoff)
                if (attempt < maxRetries) {
                  const waitTime = attempt * 1000; // 1s, 2s
                  console.log(`   Retrying in ${waitTime}ms...`);
                  await new Promise(resolve => setTimeout(resolve, waitTime));
                }
              }

              if (error) {
                console.error('❌ Error exchanging code for session after retries:', error.message);

                // Show user-friendly error
                Alert.alert(
                  'Verification Issue',
                  'We had trouble verifying your email. This might be due to network issues. Please try:\n\n1. Check your internet connection\n2. Wait a minute and try clicking the link again\n3. Or tap "Resend Email" to get a new link',
                  [{ text: 'OK' }]
                );
                return;
              } else if (data.session) {
                console.log('✅ Session established from code exchange!');

                // Check if this is a password reset or email verification
                if (type === 'recovery') {
                  // Password reset flow
                  console.log('🔐 Password reset callback detected');
                  console.log('✅ User can now reset password:', data.user.email);

                  // Navigate to ResetPasswordScreen
                  // Note: We need to use a navigation ref or update authState to show ResetPasswordScreen
                  // For now, we'll set a flag in authState
                  setAuthState({
                    status: 'PASSWORD_RESET',
                    user: data.user,
                    isVerified: true,
                    hasPremiumAccess: false,
                    hasSubscription: false,
                  });
                } else {
                  // Email verification flow
                  console.log('✅ Email verified! User:', data.user.email);

                  // Production solution: Retry mechanism with exponential backoff
                  // Supabase backend can take 1-2 seconds to update email_confirmed_at
                  console.log('🔄 Waiting for email_confirmed_at to be populated (with retries)...');

                  let freshSession = null;
                  const maxRetries = 6;

                  for (let attempt = 1; attempt <= maxRetries; attempt++) {
                    console.log(`   Attempt ${attempt}/${maxRetries}...`);

                    // Wait before checking (500ms, then 500ms, etc.)
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Get fresh session
                    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                    if (sessionError) {
                      console.error('❌ Error fetching session:', sessionError.message);
                      break;
                    }

                    if (session?.user?.email_confirmed_at) {
                      console.log(`✅ email_confirmed_at populated on attempt ${attempt}!`);
                      freshSession = session;
                      break;
                    }

                    console.log(`   email_confirmed_at still null, retrying...`);
                  }

                  if (freshSession?.user) {
                    console.log('✅ Fresh verified session retrieved');
                    console.log('   Email verified:', !!freshSession.user.email_confirmed_at);

                    // Explicitly update authState with verified user
                    const authResult = await initializeAuth(freshSession.user);
                    setAuthState(authResult);
                    console.log('✅ Auth state updated - should route to:', authResult.status);
                  } else {
                    console.error('❌ Failed to get verified session after retries');
                    // Fallback: Let the polling mechanism in EmailVerificationScreen handle it
                  }
                }
              }
              return;
            }
          }
        } catch (error) {
          console.error('❌ Error processing callback:', error);
        }
      } else if (url && (url.includes('verify') || url.includes('verified'))) {
        // Custom verification trigger (from polling)
        console.log('🔄 Verification trigger detected, re-checking auth state...');
        // Get fresh user from Supabase instead of using potentially stale closure variable
        const { supabase } = await import('./src/auth/supabase-client');
        const { data: { user: freshUser } } = await supabase.auth.getUser();
        const authResult = await initializeAuth(freshUser);
        setAuthState(authResult);
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
    if (authState?.isVerified) {
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
  }, [authState]);

  // Wait for app to be ready (splash screen is showing)
  if (!appIsReady || !authState) {
    console.log('⏳ Waiting for app to be ready...', { appIsReady, authState: !!authState });
    // Splash screen is showing, but add fallback in case it fails
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        {/* Empty view - splash screen should be showing */}
      </View>
    );
  }

  // Production routing based on auth status
  // No flashing, no loading screens, instant navigation
  console.log('🎯 Routing based on auth status:', authState.status);

  switch (authState.status) {
    case AUTH_STATUS.UNAUTHENTICATED:
      console.log('🔓 Unauthenticated - showing AuthStack');
      return (
        <View style={{ flex: 1 }} key="auth-unauthenticated">
          <StatusBar style="dark" />
          <AuthStack />
        </View>
      );

    case AUTH_STATUS.AUTHENTICATED_UNVERIFIED:
      console.log('📧 Authenticated but unverified - showing EmailVerificationScreen in Onboarding');
      return (
        <View style={{ flex: 1 }} key="auth-unverified">
          <StatusBar style="dark" />
          <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName="Onboarding"
          >
            <Stack.Screen
              name="Onboarding"
              options={{ gestureEnabled: false }}
            >
              {(props) => (
                <OnboardingNavigator
                  {...props}
                  parentNavigation={props.navigation}
                  initialRoute="EmailVerificationScreen"
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </View>
      );

    case AUTH_STATUS.AUTHENTICATED_NO_ACCESS:
      console.log('💰 Authenticated and verified but no access - showing PaywallScreen');
      return (
        <View style={{ flex: 1 }} key="auth-no-access">
          <StatusBar style="dark" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen
              name="EmailSignIn"
              component={EmailSignInScreen}
              options={{ gestureEnabled: true }}
            />
          </Stack.Navigator>
        </View>
      );

    case AUTH_STATUS.AUTHENTICATED_WITH_ACCESS:
      console.log('✅ Authenticated with access - showing AppStack');
      return (
        <View style={{ flex: 1 }} key="auth-with-access">
          <StatusBar style="dark" />
          <AppStack />
        </View>
      );

    case 'PASSWORD_RESET':
      console.log('🔐 Password reset mode - showing ResetPasswordScreen');
      return (
        <>
          <StatusBar style="dark" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
              options={{ gestureEnabled: false }}
            />
          </Stack.Navigator>
        </>
      );

    default:
      // Fallback to auth stack
      console.log('⚠️ Unknown auth status - showing AuthStack');
      return (
        <View style={{ flex: 1 }} key="auth-fallback">
          <StatusBar style="dark" />
          <AuthStack />
        </View>
      );
  }
}

export default function App() {

  return (
    <SuperwallProvider
      apiKeys={{
        ios: process.env.EXPO_PUBLIC_SUPERWALL_IOS_KEY,
        android: process.env.EXPO_PUBLIC_SUPERWALL_ANDROID_KEY
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

