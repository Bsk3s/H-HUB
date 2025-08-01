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

  try {
    // First, check if a profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    // If there was an error fetching, stop here
    if (fetchError) {
      console.error("Error fetching user profile:", fetchError.message);
      throw fetchError;
    }
    
    // If a profile with this ID already exists, we're done. Return it.
    if (existingProfile) {
      return existingProfile;
    }
    
    // If we've reached here, it means no profile exists. Let's create one.
    console.log(`No profile found for user ${userId}. Creating one now.`);
    const { data: newProfile, error: insertError } = await supabase
      .from('user_profiles')
      .insert([{ id: userId }]) // Only insert the ID, let defaults handle the rest
      .select()
      .single();
    
    // If there was an error inserting the new profile, stop here.
    if (insertError) {
      console.error("Database error saving new user:", insertError.message);
      throw new Error("Database error saving new user");
    }
    
    console.log(`Successfully created profile for user ${userId}.`);
    return newProfile;
  } catch (error) {
    console.error('An error occurred in ensureUserProfile:', error.message);
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
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error.message);
    return null;
  }
}

/**
 * Update specific fields of a user profile
 */
export async function updateUserProfile(userId, profileData) {
  if (!userId) {
    console.error('Cannot update profile for undefined user ID');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    throw error;
  }
} 