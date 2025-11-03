/**
 * Production-Grade Authentication Initialization Service
 * 
 * This service handles app startup authentication in a single, unified check
 * to prevent screen flashing and race conditions.
 * 
 * Key Features:
 * - Secure token storage (SecureStore)
 * - Non-sensitive state caching (AsyncStorage)
 * - Single initialization point (no race conditions)
 * - Optimistic state restoration
 * - Background verification
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase-client';
import { checkPremiumAccess } from './auth-service';

// Storage keys
const SECURE_KEYS = {
    ACCESS_TOKEN: 'supabase_access_token',
    REFRESH_TOKEN: 'supabase_refresh_token',
};

const ASYNC_KEYS = {
    LAST_AUTH_STATE: 'last_auth_state',
    USER_ID: 'user_id',
    USER_EMAIL: 'user_email',
};

/**
 * Auth state that will be returned
 */
export const AUTH_STATUS = {
    UNAUTHENTICATED: 'unauthenticated',
    AUTHENTICATED_UNVERIFIED: 'authenticated_unverified',
    AUTHENTICATED_NO_ACCESS: 'authenticated_no_access',
    AUTHENTICATED_WITH_ACCESS: 'authenticated_with_access',
};

/**
 * Initialize authentication state on app startup
 * 
 * This runs ONCE during app initialization and returns the complete auth state.
 * No multiple useEffect hooks, no race conditions, no screen flashing.
 * 
 * @param {Object} contextUser - Optional user from AuthContext (for when session doesn't exist yet)
 * @param {Boolean} skipCache - Skip cached state and fetch fresh data (for auth events)
 * @returns {Promise<Object>} Complete auth state
 */
export async function initializeAuth(contextUser = null, skipCache = false) {
    console.log('🔐 Initializing authentication...', contextUser ? `with context user: ${contextUser.email}` : '');

    try {
        // Step 1: Try to get cached state for optimistic rendering (unless skipCache is true)
        const cachedState = skipCache ? null : await getCachedAuthState();
        console.log('📦 Cached state:', cachedState ? 'Found' : 'None');

        // Step 2: Check for valid Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            console.error('❌ Session check error:', error.message);
            await clearAuthState();
            const result = {
                status: AUTH_STATUS.UNAUTHENTICATED,
                user: null,
                isVerified: false,
                hasPremiumAccess: false,
                hasSubscription: false,
            };
            console.log('✅ Auth initialized: unauthenticated (error)', result);
            return result;
        }

        // Step 2.5: If no session but we have a user from context (signup case), use that
        let user;
        if (!session && contextUser) {
            console.log('🔑 No session yet, but user exists in context (just signed up)');
            user = contextUser;
        } else if (!session) {
            console.log('🚫 No active session and no context user');
            await clearAuthState();
            const result = {
                status: AUTH_STATUS.UNAUTHENTICATED,
                user: null,
                isVerified: false,
                hasPremiumAccess: false,
                hasSubscription: false,
            };
            console.log('✅ Auth initialized: unauthenticated (no session)', result);
            return result;
        } else {
            // We have a session
            user = session.user;
        }

        // Step 3: We have a user - check verification
        console.log('✅ Session found:', user.email);

        const isVerified = !!user.email_confirmed_at;
        console.log(`📧 Email verified: ${isVerified ? '✅' : '❌'}`);

        if (!isVerified) {
            await cacheAuthState({
                status: AUTH_STATUS.AUTHENTICATED_UNVERIFIED,
                userId: user.id,
                userEmail: user.email,
                isVerified: false,
            });

            const result = {
                status: AUTH_STATUS.AUTHENTICATED_UNVERIFIED,
                user,
                isVerified: false,
                hasPremiumAccess: false,
                hasSubscription: false,
            };
            console.log('✅ Auth initialized: authenticated_unverified', result);
            return result;
        }

        // Step 4: User is verified - check access
        console.log('🔍 Checking premium access...');
        const hasPremiumAccess = await checkPremiumAccess(user.id);
        console.log(`🎫 Premium access: ${hasPremiumAccess ? '✅' : '❌'}`);

        // Determine final status
        const finalStatus = hasPremiumAccess
            ? AUTH_STATUS.AUTHENTICATED_WITH_ACCESS
            : AUTH_STATUS.AUTHENTICATED_NO_ACCESS;

        // Cache the final state
        await cacheAuthState({
            status: finalStatus,
            userId: user.id,
            userEmail: user.email,
            isVerified: true,
            hasPremiumAccess,
        });

        const result = {
            status: finalStatus,
            user,
            isVerified: true,
            hasPremiumAccess,
            hasSubscription: false, // Will be updated by Superwall
        };

        console.log(`✅ Auth initialized: ${finalStatus}`, result);
        return result;

    } catch (error) {
        console.error('❌ Auth initialization error:', error);
        await clearAuthState();
        return {
            status: AUTH_STATUS.UNAUTHENTICATED,
            user: null,
            isVerified: false,
            hasPremiumAccess: false,
            hasSubscription: false,
        };
    }
}

/**
 * Cache auth state in AsyncStorage for fast restoration
 * (Non-sensitive data only - no tokens!)
 */
async function cacheAuthState(state) {
    try {
        await AsyncStorage.setItem(ASYNC_KEYS.LAST_AUTH_STATE, JSON.stringify({
            status: state.status,
            isVerified: state.isVerified,
            hasPremiumAccess: state.hasPremiumAccess,
            timestamp: Date.now(),
        }));

        if (state.userId) {
            await AsyncStorage.setItem(ASYNC_KEYS.USER_ID, state.userId);
        }
        if (state.userEmail) {
            await AsyncStorage.setItem(ASYNC_KEYS.USER_EMAIL, state.userEmail);
        }

        console.log('💾 Auth state cached');
    } catch (error) {
        console.error('⚠️ Failed to cache auth state:', error);
    }
}

/**
 * Get cached auth state for optimistic rendering
 * Returns null if cache is too old or doesn't exist
 */
async function getCachedAuthState() {
    try {
        const cached = await AsyncStorage.getItem(ASYNC_KEYS.LAST_AUTH_STATE);
        if (!cached) return null;

        const state = JSON.parse(cached);

        // Cache expires after 1 hour
        const ONE_HOUR = 60 * 60 * 1000;
        if (Date.now() - state.timestamp > ONE_HOUR) {
            console.log('⏰ Cached state expired');
            return null;
        }

        return state;
    } catch (error) {
        console.error('⚠️ Failed to get cached state:', error);
        return null;
    }
}

/**
 * Clear all auth state (called on logout or errors)
 */
export async function clearAuthState() {
    try {
        console.log('🧹 Clearing auth state...');

        // Clear AsyncStorage
        await AsyncStorage.multiRemove([
            ASYNC_KEYS.LAST_AUTH_STATE,
            ASYNC_KEYS.USER_ID,
            ASYNC_KEYS.USER_EMAIL,
        ]);

        // Clear SecureStore (tokens)
        await SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN);
        await SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN);

        console.log('✅ Auth state cleared');
    } catch (error) {
        console.error('⚠️ Failed to clear auth state:', error);
    }
}

/**
 * Save tokens securely (called after successful auth)
 */
export async function saveAuthTokens(accessToken, refreshToken) {
    try {
        if (accessToken) {
            await SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN, accessToken);
        }
        if (refreshToken) {
            await SecureStore.setItemAsync(SECURE_KEYS.REFRESH_TOKEN, refreshToken);
        }
        console.log('🔒 Tokens saved securely');
    } catch (error) {
        console.error('⚠️ Failed to save tokens:', error);
    }
}

/**
 * Get saved tokens from secure storage
 */
export async function getAuthTokens() {
    try {
        const accessToken = await SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN);
        const refreshToken = await SecureStore.getItemAsync(SECURE_KEYS.REFRESH_TOKEN);
        return { accessToken, refreshToken };
    } catch (error) {
        console.error('⚠️ Failed to get tokens:', error);
        return { accessToken: null, refreshToken: null };
    }
}

