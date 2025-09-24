import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import WebBrowser with default import for Hermes compatibility
import { openAuthSessionAsync } from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { handleAuthCallback } from './services/social-auth';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

// Import Supabase client and services
import { supabase } from './supabase-client';
import { signInWithEmail, signUpWithEmail, signOut as supabaseSignOut, resetPassword as supabaseResetPassword } from './services/auth-service';
import { signInWithGoogle as supabaseSignInWithGoogle, signInWithApple as supabaseSignInWithApple } from './services/social-auth';
import { ensureUserProfile } from './services/profile-service';

// Create a context for authentication
const AuthContext = createContext(null);

// AuthProvider component to wrap your app
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear any auth errors
  const clearError = () => setError(null);

  // Helper function to log auth state to console (simplified)
  const logAuthState = async (label) => {
    // Only log during critical moments, not continuously
    if (label === 'after initialization') {
      try {
        const { data } = await supabase.auth.getSession();
        console.log(`✅ Auth initialized: ${data?.session ? `Logged in as ${data.session.user.email}` : 'Not logged in'}`);
      } catch (err) {
        console.error('❌ Auth initialization error:', err.message);
      }
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    console.log('🚀 AuthProvider mounted - initializing auth state');
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Only log significant auth changes to reduce spam
      if (event !== 'TOKEN_REFRESHED') {
        console.log('🔔 Auth state changed:', event);
      }
      
      if (session?.user) {
        console.log('✅ User authenticated:', session.user.email);
        setUser(session.user);
        // Set auth flag in AsyncStorage
        AsyncStorage.setItem('isAuthenticated', 'true');
      } else {
        console.log('🚪 User signed out or no session');
        setUser(null);
        // Clear auth flag in AsyncStorage
        AsyncStorage.setItem('isAuthenticated', 'false');
      }
      setInitializing(false);
    });

    // Get current session
    const getInitialSession = async () => {
      try {
        // Check AsyncStorage first for quick auth check
        const storedAuthState = await AsyncStorage.getItem('isAuthenticated');
        
        // Get actual session from Supabase
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Error getting initial session:', sessionError);
          throw sessionError;
        }
        
        if (data.session) {
          // Ensure AsyncStorage matches Supabase state
          if (storedAuthState !== 'true') {
            await AsyncStorage.setItem('isAuthenticated', 'true');
          }
        } else {
          // No session, ensure AsyncStorage is consistent
          if (storedAuthState === 'true') {
            await AsyncStorage.setItem('isAuthenticated', 'false');
          }
        }
        
        setUser(data.session?.user ?? null);
      } catch (err) {
        console.error('❌ Error checking auth state:', err);
      } finally {
        setInitializing(false);
        // Log final state after initialization
        logAuthState('after initialization');
      }
    };

    getInitialSession();

    // Clean up subscription
    // Set up deep link listener for OAuth callbacks
    const handleDeepLink = async (url) => {
      console.log('🔗 Deep link received:', url);
      
      if (url && url.includes('auth/callback')) {
        console.log('📱 Handling OAuth callback...');
        try {
          const result = await handleAuthCallback(url);
          if (result.success && result.session) {
            console.log('✅ OAuth callback successful, user:', result.user?.email);
            setUser(result.user);
            await AsyncStorage.setItem('isAuthenticated', 'true');
          } else {
            console.error('❌ OAuth callback failed:', result.error);
          }
        } catch (error) {
          console.error('❌ Error handling OAuth callback:', error);
        }
      }
    };

    // Listen for deep links
    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🚀 App opened with deep link:', url);
        handleDeepLink(url);
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth listener subscription');
      authListener?.subscription?.unsubscribe();
      linkingSubscription?.remove();
    };
  }, []);

  // Log only significant auth state changes (reduce spam)
  useEffect(() => {
    // Only log when auth state actually changes (not during initialization)
    if (!initializing) {
      console.log(`🔔 Auth state: ${user ? `✅ Authenticated (${user.email})` : '❌ Not authenticated'}`);
    }
  }, [user, initializing]);

  // Email/Password Login
  const login = async (email, password) => {
    clearError();
    setLoading(true);
    console.log('🔑 Attempting login with email:', email);
    
    try {
      const { user: authUser, session } = await signInWithEmail(email, password);
      
      if (authUser) {
        console.log('✅ Login successful for user:', authUser.email);
        // Ensure user profile exists
        await ensureUserProfile(authUser.id);
        // Set auth flag in AsyncStorage
        await AsyncStorage.setItem('isAuthenticated', 'true');
        console.log('💾 isAuthenticated set in AsyncStorage');
      }
      
      return true;
    } catch (err) {
      console.error('❌ Login error:', err);
      setError({
        message: err.message || 'Failed to sign in'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Registration
  const register = async (email, password) => {
    clearError();
    setLoading(true);
    console.log('📝 Attempting registration with email:', email);
    
    try {
      const { user: authUser, session } = await signUpWithEmail(email, password);
      
      if (authUser) {
        console.log('✅ Registration successful for user:', authUser.email);
        // Ensure user profile exists
        await ensureUserProfile(authUser.id);
        // Set auth flag in AsyncStorage
        await AsyncStorage.setItem('isAuthenticated', 'true');
        console.log('💾 isAuthenticated set in AsyncStorage');
      }
      
      return true;
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError({
        message: err.message || 'Failed to create account'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In
  const signInWithGoogle = async () => {
    clearError();
    setLoading(true);
    
    try {
      console.log('🔑 Initiating Google sign-in...');
      
      // First check if we already have a session
      const { data: existingSession } = await supabase.auth.getSession();
      if (existingSession?.session) {
        console.log('⚠️ Session already exists before Google sign-in!');
        console.log('👤 Existing user:', existingSession.session.user.email);
      }
      
      // For EAS builds, always use the production scheme
      const redirectUrl = 'com.bsk3s.heavenlyhub://auth/callback';
      console.log('🔗 Using redirectTo:', redirectUrl);
      
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        }
      });

      if (signInError) {
        console.error('❌ Google sign-in error:', signInError);
        throw signInError;
      }

      if (data?.url) {
        console.log('📱 Opening auth session in browser...');
        console.log('🌐 OAuth URL:', data.url);
        console.log('🔗 Expected redirect:', redirectUrl);
        
        const result = await openAuthSessionAsync(
          data.url,
          redirectUrl,
          {
            showInRecents: true,
            preferEphemeralSession: true
          }
        );
        console.log('🔄 Auth session result:', result.type);
        
        if (result.type === 'success' && result.url) {
          console.log('✅ Redirect URL received:', result.url);
        }

        if (result.type === 'success') {
          console.log('✅ OAuth browser session completed successfully');
          
          // Try to handle the redirect URL directly if available
          if (result.url) {
            console.log('🔗 Handling redirect URL directly:', result.url);
            try {
              const callbackResult = await handleAuthCallback(result.url);
              if (callbackResult.success && callbackResult.session) {
                console.log('✅ OAuth session established directly from redirect');
                setUser(callbackResult.user);
                await AsyncStorage.setItem('isAuthenticated', 'true');
                return true;
              }
            } catch (error) {
              console.log('OAuth error from redirect URL:', error.message);
              // If this is an OAuth error (like duplicate email), don't continue waiting
              if (error.message.includes('already registered') || error.message.includes('server_error')) {
                throw error; // Propagate the error to be shown to user
              }
              console.log('⚠️ Direct URL handling failed, trying deep link approach:', error.message);
            }
          }
          
          // Fallback: Wait for the deep link callback to handle session creation
          console.log('⏳ Waiting for deep link callback to set session...');
          
          // Wait up to 5 seconds for the session to be established via deep link
          let retries = 0;
          const maxRetries = 10; // 5 seconds (500ms * 10)
          
          while (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const { data: currentSession } = await supabase.auth.getSession();
            
            if (currentSession?.session) {
              console.log('✅ Session established via deep link callback');
              setUser(currentSession.session.user);
              await AsyncStorage.setItem('isAuthenticated', 'true');
              return true;
            }
            
            retries++;
            console.log(`⏳ Waiting for session... (${retries}/${maxRetries})`);
          }
          
          // If no session after waiting, it might still be processing
          console.log('⚠️ Session not established within timeout, but OAuth was successful');
          return true;
        } else {
          console.log('⚠️ Auth session closed or cancelled');
          throw new Error('Authentication cancelled');
        }
      }
      
      return true;
    } catch (err) {
      console.error('❌ Google sign-in error:', err);
      setError({
        message: err.message || 'Failed to sign in with Google'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Apple Sign-In
  const signInWithApple = async () => {
    clearError();
    setLoading(true);
    
    try {
      console.log('Initiating Apple sign-in...');
      
      // Check if session already exists
      const { data: existingSession } = await supabase.auth.getSession();
      if (existingSession?.session) {
        console.log('Session already exists before Apple sign-in');
        console.log('Existing user:', existingSession.session.user.email);
      }
      
      // For EAS builds, always use the production scheme
      const redirectUrl = 'com.bsk3s.heavenlyhub://auth/callback';
      console.log('🔗 Using redirectTo:', redirectUrl);
      
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (signInError) {
        console.error('❌ Apple sign-in error:', signInError);
        throw signInError;
      }

      if (data?.url) {
        console.log('📱 Opening auth session in browser...');
        console.log('🌐 OAuth URL:', data.url);
        console.log('🔗 Expected redirect:', redirectUrl);
        
        const result = await openAuthSessionAsync(
          data.url,
          redirectUrl,
          {
            showInRecents: true,
            preferEphemeralSession: true
          }
        );
        console.log('🔄 Auth session result:', result.type);
        
        if (result.type === 'success' && result.url) {
          console.log('✅ Redirect URL received:', result.url);
        }

        if (result.type === 'success') {
          console.log('✅ OAuth browser session completed successfully');
          
          // Try to handle the redirect URL directly if available
          if (result.url) {
            console.log('🔗 Handling redirect URL directly:', result.url);
            try {
              const callbackResult = await handleAuthCallback(result.url);
              if (callbackResult.success && callbackResult.session) {
                console.log('✅ OAuth session established directly from redirect');
                setUser(callbackResult.user);
                await AsyncStorage.setItem('isAuthenticated', 'true');
                return true;
              }
            } catch (error) {
              console.log('OAuth error from redirect URL:', error.message);
              // If this is an OAuth error (like duplicate email), don't continue waiting
              if (error.message.includes('already registered') || error.message.includes('server_error')) {
                throw error; // Propagate the error to be shown to user
              }
              console.log('⚠️ Direct URL handling failed, trying deep link approach:', error.message);
            }
          }
          
          // Fallback: Wait for the deep link callback to handle session creation
          console.log('⏳ Waiting for deep link callback to set session...');
          
          // Wait up to 5 seconds for the session to be established via deep link
          let retries = 0;
          const maxRetries = 10; // 5 seconds (500ms * 10)
          
          while (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const { data: currentSession } = await supabase.auth.getSession();
            
            if (currentSession?.session) {
              console.log('✅ Session established via deep link callback');
              setUser(currentSession.session.user);
              await AsyncStorage.setItem('isAuthenticated', 'true');
              return true;
            }
            
            retries++;
            console.log(`⏳ Waiting for session... (${retries}/${maxRetries})`);
          }
          
          // If no session after waiting, it might still be processing
          console.log('⚠️ Session not established within timeout, but OAuth was successful');
          return true;
        } else {
          console.log('⚠️ Auth session closed or cancelled');
          throw new Error('Authentication cancelled');
        }
      }
      
      return true;
    } catch (err) {
      console.error('❌ Apple sign-in error:', err);
      setError({
        message: err.message || 'Failed to sign in with Apple'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    clearError();
    setLoading(true);
    console.log('🚪 Starting logout process...');
    
    try {
      // First, get the current session to log details
      const { data: currentSession } = await supabase.auth.getSession();
      console.log('📋 Current session before logout:', currentSession?.session ? 'exists' : 'null');
      
      // Attempt to sign out via Supabase
      console.log('🔄 Calling supabase.auth.signOut()...');
      const { error } = await supabaseSignOut();
      
      if (error) {
        console.error('❌ Supabase logout error:', error);
        // Continue with cleanup even if Supabase logout fails
      } else {
        console.log('✅ Supabase logout successful');
      }
      
      // Clear user state immediately
      setUser(null);
      
      // Clear AsyncStorage auth state regardless of Supabase response
      try {
        await AsyncStorage.setItem('isAuthenticated', 'false');
        console.log('💾 AsyncStorage isAuthenticated set to false');
        
        // Optional: Log keys in AsyncStorage to check if Supabase is properly clearing its data
        const keys = await AsyncStorage.getAllKeys();
        const authKeys = keys.filter(key => key.includes('supabase.auth'));
        console.log(`📦 Auth keys in AsyncStorage after logout: ${authKeys.length > 0 ? authKeys.join(', ') : 'none'}`);
      } catch (storageErr) {
        console.error('❌ Error clearing AsyncStorage auth state:', storageErr);
      }
      
      console.log('✅ Logout successful');
      
      // Double-check that session is actually cleared
      const { data: checkData } = await supabase.auth.getSession();
      console.log('🔍 Session after logout:', checkData?.session ? 'still exists (problem!)' : 'cleared successfully');
      
      return true;
    } catch (err) {
      console.error('❌ Logout error:', err);
      setError({
        message: err.message || 'Failed to sign out'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function to handle password reset
  const resetPassword = async (email) => {
    clearError();
    setLoading(true);
    
    try {
      await supabaseResetPassword(email);
      return true;
    } catch (err) {
      console.error('Password reset error:', err);
      setError({
        message: err.message || 'Failed to reset password'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        initializing,
        loading,
        error,
        login,
        signInWithGoogle,
        signInWithApple,
        register,
        logout,
        resetPassword,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };