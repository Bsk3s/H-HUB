// src/auth/services/profile-service.js
// Service for managing user profiles

import { supabase } from '../supabase-client';

/**
 * Ensure a user profile exists for the given user ID
 * Creates a new profile if one doesn't exist
 */
export async function ensureUserProfile(userId) {
  if (!userId) {
    console.error('Cannot ensure profile for undefined user ID');
    return null;
  }

  console.log('🔍 [ensureUserProfile] Starting for user:', userId);

  try {
    // First, check if a profile already exists
    console.log('🔍 [ensureUserProfile] Checking if profile exists...');
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    console.log('🔍 [ensureUserProfile] Query complete. Profile exists:', !!existingProfile, 'Error:', !!fetchError);

    // If there was an error fetching, stop here
    if (fetchError) {
      console.error("Error fetching user profile:", fetchError.message);
      throw fetchError;
    }

    // If a profile with this ID already exists, we're done. Return it.
    if (existingProfile) {
      console.log('✅ [ensureUserProfile] Profile already exists, returning');
      return existingProfile;
    }

    // If we've reached here, it means no profile exists. Let's create one.
    console.log(`📝 [ensureUserProfile] No profile found for user ${userId}. Creating one now.`);
    const { data: newProfile, error: insertError } = await supabase
      .from('user_profiles')
      .insert([{ id: userId }]) // Only insert the ID, let defaults handle the rest
      .select()
      .single();

    console.log('📝 [ensureUserProfile] Insert complete. Profile created:', !!newProfile, 'Error:', !!insertError);

    // If there was an error inserting the new profile, stop here.
    if (insertError) {
      console.error("Database error saving new user:", insertError.message);
      throw new Error("Database error saving new user");
    }

    console.log(`✅ [ensureUserProfile] Successfully created profile for user ${userId}.`);
    return newProfile;
  } catch (error) {
    console.error('❌ [ensureUserProfile] Error occurred:', error.message);
    console.error('❌ [ensureUserProfile] Error stack:', error.stack);
    // We re-throw the original error if it's one of our specific ones
    if (error.message.includes("Database error")) {
      throw error;
    }
    return null; // Return null for other unexpected errors
  }
}

/**
 * Get the user profile for the given user ID
 */
export async function getUserProfile(userId) {
  if (!userId) {
    console.error('Cannot get profile for undefined user ID');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Database error fetching user profile:', error.message);
      throw new Error('Failed to load user profile. Please try again.');
    }
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error.message);
    // Return a user-friendly error instead of null
    throw new Error(error.message.includes('Failed to load') ? error.message : 'Unable to access your profile. Please check your connection and try again.');
  }
}

/**
 * Create or update a user profile with specific data
 */
export async function createUserProfile(userId, profileData) {
  if (!userId) {
    console.error('Cannot create profile for undefined user ID');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        ...profileData
      }, {
        onConflict: ['id']
      })
      .select()
      .single();

    if (error) throw error;
    console.log('Successfully created/updated user profile');
    return data;
  } catch (error) {
    console.error('Error creating user profile:', error.message);
    throw error;
  }
}

/**
 * Update specific fields of a user profile
 */
export async function updateUserProfile(userId, profileData) {
  if (!userId) {
    console.error('Cannot update profile for undefined user ID');
    throw new Error('Unable to update profile: User not authenticated.');
  }

  if (!profileData || Object.keys(profileData).length === 0) {
    throw new Error('No profile data provided to update.');
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Database error updating user profile:', error.message);
      throw new Error('Failed to save profile changes. Please try again.');
    }

    if (!data) {
      throw new Error('Profile not found or unable to save changes.');
    }

    console.log('Successfully updated user profile');
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    throw new Error(error.message.includes('Failed to save') || error.message.includes('Profile not found') ? error.message : 'Unable to save profile changes. Please check your connection and try again.');
  }
}