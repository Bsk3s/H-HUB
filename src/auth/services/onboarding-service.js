// src/auth/services/onboarding-service.js
// Service for managing user onboarding data in the database

import { supabase } from '../supabase-client';

/**
 * Save onboarding data to the database
 * @param {string} userId - User's UUID
 * @param {Object} onboardingData - Complete onboarding data object
 */
export async function saveOnboardingData(userId, onboardingData) {
  if (!userId) {
    console.error('Cannot save onboarding data for undefined user ID');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_onboarding_data')
      .upsert({
        user_id: userId,
        denomination: onboardingData.denomination || null,
        age_group: onboardingData.ageGroup || null,
        bible_version: onboardingData.bibleVersion || null,
        spiritual_journey: onboardingData.spiritualJourney || null,
        faith_challenges: onboardingData.faithChallenges || null,
        growth_priorities: onboardingData.growthPriorities || null,
        prayer_habits: onboardingData.prayerHabits || null,
        satisfaction_level: onboardingData.satisfactionLevel || null,
        wants_structure: onboardingData.wantsStructure || null,
        onboarding_completed_at: new Date().toISOString()
      }, {
        onConflict: ['user_id']
      })
      .select()
      .single();

    if (error) throw error;
    console.log('Successfully saved onboarding data to database');
    return data;
  } catch (error) {
    console.error('Error saving onboarding data:', error.message);
    throw error;
  }
}

/**
 * Get onboarding data from the database
 * @param {string} userId - User's UUID
 */
export async function getOnboardingData(userId) {
  if (!userId) {
    console.error('Cannot get onboarding data for undefined user ID');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_onboarding_data')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting onboarding data:', error.message);
    return null;
  }
}

/**
 * Get complete user profile (combines profile + onboarding data)
 * @param {string} userId - User's UUID
 */
export async function getCompleteUserProfile(userId) {
  if (!userId) {
    console.error('Cannot get complete profile for undefined user ID');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_complete_profile')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting complete user profile:', error.message);
    return null;
  }
}

/**
 * Migrate AsyncStorage onboarding data to database
 * @param {string} userId - User's UUID
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function migrateAsyncStorageToDatabase(userId) {
  try {

    // Get data from AsyncStorage
    const [denomination, ageGroup, bibleVersion, spiritualJourney, faithChallenges] = await Promise.all([
      AsyncStorage.getItem('selectedDenomination'),
      AsyncStorage.getItem('selectedAgeGroup'),
      AsyncStorage.getItem('selectedBibleVersion'),
      AsyncStorage.getItem('selectedSpiritualJourney'),
      AsyncStorage.getItem('selectedFaithChallenges')
    ]);

    // Parse the data
    const onboardingData = {
      denomination: denomination ? JSON.parse(denomination) : null,
      ageGroup: ageGroup ? JSON.parse(ageGroup) : null,
      bibleVersion: bibleVersion ? JSON.parse(bibleVersion) : null,
      spiritualJourney: spiritualJourney ? JSON.parse(spiritualJourney) : null,
      faithChallenges: faithChallenges ? JSON.parse(faithChallenges) : null
    };

    // Only migrate if we have some data
    const hasData = Object.values(onboardingData).some(value => value !== null);
    if (!hasData) {
      console.log('No AsyncStorage data to migrate');
      return null;
    }

    // Save to database
    const result = await saveOnboardingData(userId, onboardingData);

    if (result) {
      // Clear AsyncStorage after successful migration
      await Promise.all([
        AsyncStorage.removeItem('selectedDenomination'),
        AsyncStorage.removeItem('selectedAgeGroup'),
        AsyncStorage.removeItem('selectedBibleVersion'),
        AsyncStorage.removeItem('selectedSpiritualJourney'),
        AsyncStorage.removeItem('selectedFaithChallenges')
      ]);

      console.log('Successfully migrated AsyncStorage data to database');
    }

    return result;
  } catch (error) {
    console.error('Error migrating AsyncStorage data:', error.message);
    throw error;
  }
}

/**
 * Clear all onboarding data for a user from the database
 * @param {string} userId - User's UUID
 */
export async function clearUserOnboardingData(userId) {
  if (!userId) {
    console.error('Cannot clear onboarding data for undefined user ID');
    return null;
  }

  try {
    const { error } = await supabase
      .from('user_onboarding_data')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    console.log('Successfully cleared onboarding data from database');
    return true;
  } catch (error) {
    console.error('Error clearing onboarding data:', error.message);
    throw error;
  }
}

/**
 * Update specific onboarding data fields
 * @param {string} userId - User's UUID
 * @param {Object} updates - Fields to update
 */
export async function updateOnboardingData(userId, updates) {
  if (!userId) {
    console.error('Cannot update onboarding data for undefined user ID');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_onboarding_data')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating onboarding data:', error.message);
    throw error;
  }
}


