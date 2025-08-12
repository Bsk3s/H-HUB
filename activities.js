// app/services/activities.js
// Supabase service helpers for activities table

import { supabase } from '../../src/auth/supabase-client';

// --- Constants ---
const ACTIVITY_DEFINITIONS = {
  prayer: { dailyGoal: 15 },
  bible: { dailyGoal: 1 },
  devotional: { dailyGoal: 20 },
  'evening-prayer': { dailyGoal: 10 },
};

/**
 * Fetches all of a user's defined activities.
 * These are the top-level goals (e.g., the 'Bible Reading' activity itself).
 */
export const fetchUserActivities = async (userId) => {
  if (!userId) {
    console.error("Fetch aborted: No user ID provided.");
    return [];
  }
  
  const { data, error } = await supabase
    .from('user_activities')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
  
  return data;
};

/**
 * Fetches all of a user's individual progress logs within a date range.
 */
export const fetchActivityLogs = async (userId) => {
    if (!userId) {
        console.error("Fetch aborted: No user ID provided.");
        return [];
    }

    const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching activity logs:', error);
        throw error;
    }

    return data;
};


/**
 * Ensures that all default activities exist for a user.
 * Creates any that are missing.
 */
export const ensureActivitiesExist = async (userId, existingActivities) => {
  if (!userId) {
    console.error("User ID is required to ensure activities exist.");
    return;
  }
  
  const existingTypes = existingActivities.map(a => a.type);
  const missingTypes = Object.keys(ACTIVITY_DEFINITIONS).filter(
    type => !existingTypes.includes(type)
  );

  if (missingTypes.length > 0) {
    const activitiesToCreate = missingTypes.map(type => ({
      user_id: userId,
      type: type,
      daily_goal: ACTIVITY_DEFINITIONS[type].dailyGoal,
    }));

    const { error } = await supabase
      .from('user_activities')
      .insert(activitiesToCreate);

    if (error) {
      console.error('Error ensuring activities exist:', error);
      throw error;
    }
  }
};

/**
 * Upserts a user's activity. Used for broader updates like changing a goal
 * or updating Bible reading progress.
 */
export const upsertUserActivity = async (activityData) => {
  const { error } = await supabase
    .from('user_activities')
    .update(activityData)
    .eq('id', activityData.id);
    
  if (error) {
    console.error('Error upserting user activity:', error);
    throw error;
  }
};

/**
 * Logs a new progress entry for a specific activity.
 */
export const logActivityProgress = async (logData) => {
  const { error } = await supabase
    .from('activity_logs')
    .insert(logData);

  if (error) {
    console.error('Error logging activity progress:', error);
    throw error;
  }
};

// === NEW SIMPLIFIED DAILY PROGRESS SYSTEM ===

/**
 * Fetch today's total progress for a specific activity
 * @param {string} userId - User's UUID
 * @param {string} activityType - Activity type (prayer, bible, devotional, evening-prayer)
 * @param {string} date - Date in YYYY-MM-DD format (optional, defaults to today)
 * @returns {Promise<number>} Total minutes/chapters for the day
 */
export const fetchDailyProgress = async (userId, activityType, date = null) => {
  if (!userId || !activityType) {
    console.error("User ID and activity type are required");
    return 0;
  }

  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    // Try the new daily_progress table first
    const { data: dailyData, error: dailyError } = await supabase
      .from('daily_progress')
      .select('total_progress')
      .eq('user_id', userId)
      .eq('activity_type', activityType)
      .eq('date', targetDate)
      .maybeSingle();

    if (!dailyError && dailyData) {
      return dailyData.total_progress || 0;
    }

    // Fallback to activity_logs table (sum up individual entries)
    console.log('Using activity_logs fallback for fetchDailyProgress');
    
    // First, get the user's activities to find the activity ID
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activities')
      .select('id')
      .eq('user_id', userId)
      .eq('type', activityType)
      .maybeSingle();

    if (activitiesError || !activities) {
      console.error('Error fetching user activity:', activitiesError);
      return 0;
    }

    // Then sum up the progress for today
    const { data: logs, error: logsError } = await supabase
      .from('activity_logs')
      .select('progress')
      .eq('user_id', userId)
      .eq('user_activity_id', activities.id)
      .gte('created_at', targetDate + 'T00:00:00')
      .lt('created_at', targetDate + 'T23:59:59');

    if (logsError) {
      console.error('Error fetching activity logs:', logsError);
      return 0;
    }

    return logs?.reduce((sum, log) => sum + (log.progress || 0), 0) || 0;

  } catch (error) {
    console.error('Error fetching daily progress:', error);
    return 0;
  }
};

/**
 * Set today's total progress for a specific activity
 * @param {string} userId - User's UUID
 * @param {string} activityType - Activity type
 * @param {number} totalProgress - Total progress for the day
 * @param {string} date - Date in YYYY-MM-DD format (optional, defaults to today)
 */
export const setDailyProgress = async (userId, activityType, totalProgress, date = null) => {
  if (!userId || !activityType || totalProgress < 0) {
    console.error("Invalid parameters for setDailyProgress");
    return;
  }

  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    // Try the new daily_progress table first
    const { error: dailyError } = await supabase
      .from('daily_progress')
      .upsert({
        user_id: userId,
        activity_type: activityType,
        date: targetDate,
        total_progress: totalProgress,
        updated_at: new Date().toISOString()
      }, {
        onConflict: ['user_id', 'activity_type', 'date']
      });

    if (!dailyError) {
      console.log('Successfully saved to daily_progress table');
      return;
    }

    // Fallback to activity_logs table
    console.log('Using activity_logs fallback for setDailyProgress');
    
    // Get the user's activity ID
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activities')
      .select('id')
      .eq('user_id', userId)
      .eq('type', activityType)
      .maybeSingle();

    if (activitiesError || !activities) {
      console.error('Error fetching user activity:', activitiesError);
      throw new Error('Could not find user activity');
    }

    // Get current total for today to calculate the difference
    const currentTotal = await fetchDailyProgress(userId, activityType, date);
    const difference = totalProgress - currentTotal;

    // Only log if there's a positive difference
    if (difference > 0) {
      const { error: logError } = await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          user_activity_id: activities.id,
          progress: difference,
          created_at: new Date().toISOString()
        });

      if (logError) {
        console.error('Error logging to activity_logs:', logError);
        throw logError;
      }
    }

  } catch (error) {
    console.error('Error setting daily progress:', error);
    throw error;
  }
};

/**
 * Fetch all daily progress for a user within a date range
 * @param {string} userId - User's UUID
 * @param {string} startDate - Start date YYYY-MM-DD
 * @param {string} endDate - End date YYYY-MM-DD
 * @returns {Promise<Array>} Array of daily progress records
 */
export const fetchDailyProgressRange = async (userId, startDate, endDate) => {
  if (!userId) {
    console.error("User ID is required");
    return [];
  }

  try {
    // Try the new daily_progress table first
    const { data: dailyData, error: dailyError } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (!dailyError && dailyData && dailyData.length > 0) {
      return dailyData;
    }

    // Fallback to activity_logs table
    console.log('Using activity_logs fallback for fetchDailyProgressRange');
    
    // Get all user activities
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activities')
      .select('id, type')
      .eq('user_id', userId);

    if (activitiesError || !activities) {
      console.error('Error fetching user activities:', activitiesError);
      return [];
    }

    // Get all logs in the date range
    const { data: logs, error: logsError } = await supabase
      .from('activity_logs')
      .select('user_activity_id, progress, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate + 'T00:00:00')
      .lte('created_at', endDate + 'T23:59:59')
      .order('created_at', { ascending: true });

    if (logsError) {
      console.error('Error fetching activity logs:', logsError);
      return [];
    }

    // Group logs by date and activity type, then sum them up
    const dailyProgressMap = {};
    
    logs?.forEach(log => {
      const activity = activities.find(a => a.id === log.user_activity_id);
      if (!activity) return;
      
      // Extract date from created_at
      const logDate = log.created_at.split('T')[0];
      const key = `${logDate}-${activity.type}`;
      
      if (!dailyProgressMap[key]) {
        dailyProgressMap[key] = {
          user_id: userId,
          activity_type: activity.type,
          date: logDate,
          total_progress: 0
        };
      }
      
      dailyProgressMap[key].total_progress += log.progress || 0;
    });

    return Object.values(dailyProgressMap).sort((a, b) => a.date.localeCompare(b.date));

  } catch (error) {
    console.error('Error fetching daily progress range:', error);
    return [];
  }
};

/**
 * Fetch activities for a user, optionally within a date range.
 * @param {string} userId - The user's UUID.
 * @param {string} [startDate] - (Optional) Start date (YYYY-MM-DD).
 * @param {string} [endDate] - (Optional) End date (YYYY-MM-DD).
 * @returns {Promise<Array>} Array of activity objects.
 */
export async function fetchActivities(userId, startDate, endDate) {
  let query = supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId);

  if (startDate) query = query.gte('date', startDate);
  if (endDate) query = query.lte('date', endDate);

  const { data, error } = await query.order('date', { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Insert a new activity.
 * @param {Object} activity - Activity object (user_id, activity, type, date, progress, etc.)
 * @returns {Promise<Object>} The inserted activity.
 */
export async function insertActivity(activity) {
  const { data, error } = await supabase
    .from('activities')
    .insert([activity])
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update an activity by id.
 * @param {string} id - Activity row UUID.
 * @param {Object} updates - Fields to update (progress, streak, etc.)
 * @returns {Promise<Object>} The updated activity.
 */
export async function updateActivity(id, updates) {
  const { data, error } = await supabase
    .from('activities')
    .update(updates)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Upsert (insert or update) an activity for a user/date/activity.
 * @param {Object} activity - Activity object (user_id, activity, date, etc.)
 * @returns {Promise<Object>} The upserted activity.
 */
export async function upsertActivity(activity) {
  const { data, error } = await supabase
    .from('activities')
    .upsert([activity], { onConflict: ['user_id', 'activity', 'date'] })
    .single();
  if (error) throw error;
  return data;
} 