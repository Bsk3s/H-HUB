// src/auth/services/auth-service.js
// Service for handling authentication operations with Supabase

import { supabase } from '../supabase-client';

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Error signing in:', error.message);
    throw error;
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'com.bsk3s.heavenlyhub://callback',
      },
    });

    if (error) throw error;
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Error signing up:', error.message);
    throw error;
  }
}

/**
 * Sign in with OAuth provider (Google, Apple, etc.)
 */
export async function signInWithOAuth(provider) {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'com.bsk3s.heavenlyhub://auth/callback',
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error signing in with ${provider}:`, error.message);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
}

/**
 * Reset password for a user
 */
export async function resetPassword(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'com.bsk3s.heavenlyhub://callback',
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error resetting password:', error.message);
    throw error;
  }
}

/**
 * Get current user and session
 */
export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting session:', error.message);
    return { session: null };
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Error getting user:', error.message);
    return null;
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email) {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: 'https://a-heavenlyhub.com/verify/callback',
      }
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error resending verification email:', error.message);
    throw error;
  }
}

/**
 * Check if user's email is verified
 * Returns: true if verified, false if not verified or session not ready
 * 
 * PRODUCTION SOLUTION: Uses refreshSession() to get fresh data from Supabase server
 * This is what professional apps do - they don't rely on cached session data
 */
export async function checkEmailVerified() {
  try {
    // CRITICAL: Refresh the session to get latest data from Supabase server
    // This is the production-grade way to detect verification
    // Without this, we'd be checking stale cached data
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError) {
      // If refresh fails, session might not exist yet (just signed up)
      // This is normal - return false silently
      return false;
    }

    if (!refreshData?.session) {
      // No session yet - user just signed up, wait for session to be created
      return false;
    }

    // Check if email is verified from the FRESH session data
    const isVerified = refreshData.session.user?.email_confirmed_at !== null;

    if (isVerified) {
      console.log('✅ Email verification detected via session refresh');
    }

    return isVerified;
  } catch (error) {
    // Silently return false for expected errors during session initialization
    if (!error.message.includes('session') && !error.message.includes('Session')) {
      console.error('Error checking email verification:', error.message);
    }
    return false;
  }
}

/**
 * Check if user has premium access (admin-granted or via subscription)
 * This checks the database flag that admins can manually set
 * Returns: true if user has premium access flag, false otherwise
 */
export async function checkPremiumAccess(userId) {
  try {
    if (!userId) {
      return false;
    }

    // Query the user_profiles table for the has_premium_access flag with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Premium access check timeout')), 3000)
    );

    const queryPromise = supabase
      .from('user_profiles')
      .select('has_premium_access')
      .eq('id', userId)
      .single();

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error) {
      // If user profile doesn't exist yet, return false (not an error)
      if (error.code === 'PGRST116') {
        console.log('⚠️ User profile does not exist yet, returning false for premium access');
        return false;
      }
      console.error('Error checking premium access:', error.message);
      return false;
    }

    const hasPremiumAccess = data?.has_premium_access === true;
    return hasPremiumAccess;
  } catch (error) {
    console.error('Error checking premium access:', error.message);
    return false; // Return false on timeout or error
  }
}

/**
 * Update premium access status for the current user
 * This is called after a successful purchase via Superwall
 */
export async function updatePremiumAccess(userId, hasPremium) {
  try {
    console.log(`🎫 Updating premium access for user ${userId} to:`, hasPremium);

    const { error } = await supabase
      .from('user_profiles')
      .update({ has_premium_access: hasPremium })
      .eq('id', userId);

    if (error) {
      console.error('❌ Error updating premium access:', error.message);
      return false;
    }

    console.log('✅ Premium access updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error updating premium access:', error.message);
    return false;
  }
}

/**
 * Delete the currently authenticated user account
 * This is useful when a user entered wrong email during signup
 * 
 * NOTE: Client-side deletion is limited. This function:
 * 1. Signs out the user immediately
 * 2. Unverified accounts are auto-deleted by Supabase after 7 days
 * 3. For immediate deletion, you'd need a serverless function with admin access
 */
export async function deleteCurrentUser() {
  try {
    console.log('🗑️ Attempting to remove current user account...');

    // Get the current user first
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    if (!userData?.user) {
      throw new Error('No user is currently logged in');
    }

    const userEmail = userData.user.email;
    const isVerified = userData.user.email_confirmed_at !== null;

    console.log(`📧 User email: ${userEmail}, Verified: ${isVerified}`);

    // Sign out the user immediately
    // For unverified accounts, Supabase will auto-delete after 7 days
    await signOut();

    console.log(`✅ Successfully signed out user: ${userEmail}`);
    if (!isVerified) {
      console.log('💡 Note: Unverified account will be auto-deleted by Supabase within 7 days');
    }

    return {
      success: true,
      deletedCompletely: false, // Can't fully delete from client
      signedOut: true,
      willAutoDelete: !isVerified
    };
  } catch (error) {
    console.error('❌ Error deleting user:', error.message);

    // If even signout fails, try one more time
    try {
      await signOut();
      console.log('✅ Signed out user on retry');
      return { success: true, deletedCompletely: false, signedOut: true };
    } catch (signOutError) {
      console.error('❌ Signout failed completely:', signOutError.message);
      throw error;
    }
  }
}

/**
 * Test function to verify authentication flow
 * Useful for testing without modifying the UI
 */
export async function testEmailAuth(email, password) {
  console.log('Testing email authentication flow...');

  try {
    // Try signing up first
    console.log('1. Attempting to sign up with:', email);
    const signUpResult = await signUpWithEmail(email, password);
    console.log('Sign-up result:', !!signUpResult?.user ? 'Success' : 'Failed',
      signUpResult?.user ? '(User created)' : '(No user returned)');

    // Try signing in
    console.log('2. Attempting to sign in with:', email);
    const signInResult = await signInWithEmail(email, password);
    console.log('Sign-in result:', !!signInResult?.user ? 'Success' : 'Failed');

    // Get current user
    console.log('3. Checking current user');
    const currentUser = await getCurrentUser();
    console.log('Current user:', currentUser ? `Found (${currentUser.email})` : 'Not found');

    return {
      signUpResult,
      signInResult,
      currentUser
    };
  } catch (error) {
    console.error('Authentication test failed:', error.message);
    throw error;
  }
}