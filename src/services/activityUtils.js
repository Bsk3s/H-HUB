// src/services/activityUtils.js
// Shared utilities for activities to avoid circular dependencies

import { supabase } from '../config/supabase';
import { format } from 'date-fns';

/**
 * Fetch daily progress for a specific activity type on a specific date
 * Moved here to avoid circular dependency between activities.js and streaks.js
 */
export async function fetchDailyProgress(userId, activityType, date = null) {
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

    // If no data in daily_progress, fall back to activity_logs
    const { data: logData, error: logError } = await supabase
      .from('activity_logs')
      .select('progress')
      .eq('user_id', userId)
      .eq('activity_type', activityType)
      .gte('timestamp', `${targetDate}T00:00:00`)
      .lt('timestamp', `${targetDate}T23:59:59`);

    if (logError) {
      console.error('Error fetching from activity_logs:', logError);
      return 0;
    }

    // Sum up all progress for that day
    const totalProgress = logData.reduce((sum, log) => sum + (log.progress || 0), 0);
    return totalProgress;
  } catch (error) {
    console.error('Error in fetchDailyProgress:', error);
    return 0;
  }
}
