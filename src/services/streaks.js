import { supabase } from '../config/supabase';
import { format, startOfDay, subDays, isToday, parseISO } from 'date-fns';
import { fetchDailyProgress } from './activityUtils';

// Define what it means to "complete" an activity for a day
const COMPLETION_THRESHOLDS = {
  'prayer': { minProgress: 5 }, // 5 minutes minimum
  'bible': { minProgress: 1 }, // 1 chapter minimum  
  'devotional': { minProgress: 10 }, // 10 minutes minimum
  'evening-prayer': { minProgress: 5 }, // 5 minutes minimum
};

/**
 * Check if an activity was completed on a specific date
 * @param {string} userId - User's UUID
 * @param {string} activityType - Activity type
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<boolean>} Whether the activity was completed
 */
export const isActivityCompletedOnDate = async (userId, activityType, date) => {
  try {
    const progress = await fetchDailyProgress(userId, activityType, date);
    const threshold = COMPLETION_THRESHOLDS[activityType]?.minProgress || 1;
    
    const completed = progress >= threshold;
    console.log(`📊 ${activityType} on ${date}: ${progress} >= ${threshold} = ${completed}`);
    
    return completed;
  } catch (error) {
    console.error('Error checking activity completion:', error);
    return false;
  }
};

/**
 * Calculate current streak for an activity
 * @param {string} userId - User's UUID  
 * @param {string} activityType - Activity type
 * @returns {Promise<number>} Current streak count
 */
export const calculateCurrentStreak = async (userId, activityType) => {
  try {
    let streak = 0;
    let currentDate = startOfDay(new Date());
    
    // Check if today is completed
    const todayCompleted = await isActivityCompletedOnDate(
      userId, 
      activityType, 
      format(currentDate, 'yyyy-MM-dd')
    );
    
    if (todayCompleted) {
      // If today is completed, start counting from today
      streak = 1;
      let checkDate = subDays(currentDate, 1);
      
      // Count backwards for consecutive completed days
      while (true) {
        const dateStr = format(checkDate, 'yyyy-MM-dd');
        const completed = await isActivityCompletedOnDate(userId, activityType, dateStr);
        
        if (!completed) break;
        
        streak++;
        checkDate = subDays(checkDate, 1);
        
        // Safety limit to prevent infinite loops
        if (streak > 365) break;
      }
    } else {
      // If today is not completed, check if we have a streak ending yesterday
      const yesterday = subDays(currentDate, 1);
      const yesterdayCompleted = await isActivityCompletedOnDate(
        userId, 
        activityType, 
        format(yesterday, 'yyyy-MM-dd')
      );
      
      if (yesterdayCompleted) {
        streak = 1;
        let checkDate = subDays(yesterday, 1);
        
        // Count backwards for consecutive completed days
        while (true) {
          const dateStr = format(checkDate, 'yyyy-MM-dd');
          const completed = await isActivityCompletedOnDate(userId, activityType, dateStr);
          
          if (!completed) break;
          
          streak++;
          checkDate = subDays(checkDate, 1);
          
          // Safety limit to prevent infinite loops
          if (streak > 365) break;
        }
      }
    }
    
    console.log(`🔥 ${activityType} current streak: ${streak} days`);
    return streak;
  } catch (error) {
    console.error('Error calculating current streak:', error);
    return 0;
  }
};

/**
 * Get best streak for an activity from database
 * @param {string} userId - User's UUID
 * @param {string} activityType - Activity type
 * @returns {Promise<number>} Best streak count
 */
export const getBestStreak = async (userId, activityType) => {
  try {
    const { data, error } = await supabase
      .from('user_activities')
      .select('best_streak')
      .eq('user_id', userId)
      .eq('type', activityType)
      .single();
    
    if (error) {
      console.error('Error fetching best streak:', error);
      return 0;
    }
    
    return data?.best_streak || 0;
  } catch (error) {
    console.error('Error getting best streak:', error);
    return 0;
  }
};

/**
 * Update best streak if current streak is higher
 * @param {string} userId - User's UUID
 * @param {string} activityType - Activity type  
 * @param {number} currentStreak - Current streak count
 * @returns {Promise<boolean>} Whether best streak was updated
 */
export const updateBestStreakIfNeeded = async (userId, activityType, currentStreak) => {
  try {
    const bestStreak = await getBestStreak(userId, activityType);
    
    if (currentStreak > bestStreak) {
      const { error } = await supabase
        .from('user_activities')
        .update({ 
          best_streak: currentStreak,
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('type', activityType);
      
      if (error) {
        console.error('Error updating best streak:', error);
        return false;
      }
      
      console.log(`🏆 New best streak for ${activityType}: ${currentStreak} days (was ${bestStreak})`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating best streak:', error);
    return false;
  }
};

/**
 * Calculate and update streaks for an activity after progress is saved
 * @param {string} userId - User's UUID
 * @param {string} activityType - Activity type
 * @returns {Promise<{currentStreak: number, bestStreak: number, isNewBest: boolean}>}
 */
export const recalculateStreaks = async (userId, activityType) => {
  try {
    console.log(`🔄 Recalculating streaks for ${activityType}...`);
    
    // Calculate current streak
    const currentStreak = await calculateCurrentStreak(userId, activityType);
    
    // Update best streak if needed
    const isNewBest = await updateBestStreakIfNeeded(userId, activityType, currentStreak);
    
    // Get the (possibly updated) best streak
    const bestStreak = await getBestStreak(userId, activityType);
    
    console.log(`✅ ${activityType} streaks: current=${currentStreak}, best=${bestStreak}, newBest=${isNewBest}`);
    
    return {
      currentStreak,
      bestStreak,
      isNewBest
    };
  } catch (error) {
    console.error('Error recalculating streaks:', error);
    return {
      currentStreak: 0,
      bestStreak: 0,
      isNewBest: false
    };
  }
};

/**
 * Calculate streaks for all user activities
 * @param {string} userId - User's UUID
 * @param {Array} activityTypes - Array of activity types to calculate
 * @returns {Promise<Object>} Streaks mapped by activity type
 */
export const calculateAllStreaks = async (userId, activityTypes = []) => {
  try {
    const streakPromises = activityTypes.map(async (activityType) => {
      const currentStreak = await calculateCurrentStreak(userId, activityType);
      const bestStreak = await getBestStreak(userId, activityType);
      
      return {
        activityType,
        currentStreak,
        bestStreak
      };
    });
    
    const results = await Promise.all(streakPromises);
    
    // Convert to object format
    const streaksMap = results.reduce((acc, { activityType, currentStreak, bestStreak }) => {
      acc[activityType] = {
        current: currentStreak,
        best: bestStreak
      };
      return acc;
    }, {});
    
    console.log('📊 All streaks calculated:', streaksMap);
    return streaksMap;
  } catch (error) {
    console.error('Error calculating all streaks:', error);
    return {};
  }
};

/**
 * Log a streak achievement (for analytics/celebration)
 * @param {string} userId - User's UUID
 * @param {string} activityType - Activity type
 * @param {number} streakLength - Length of streak achieved
 * @param {string} achievementType - 'milestone' | 'personal_best' | 'streak_broken'
 */
export const logStreakAchievement = async (userId, activityType, streakLength, achievementType) => {
  try {
    // Note: This would require a streak_achievements table
    // For now, just log to console - can be implemented later for gamification
    console.log(`🎉 Streak Achievement: ${userId} - ${activityType} - ${streakLength} days - ${achievementType}`);
    
    // Future: Store in streak_achievements table for analytics and celebrations
    // const { error } = await supabase
    //   .from('streak_achievements')
    //   .insert({
    //     user_id: userId,
    //     activity_type: activityType,
    //     streak_length: streakLength,
    //     achievement_type: achievementType,
    //     achieved_at: new Date().toISOString()
    //   });
    
  } catch (error) {
    console.error('Error logging streak achievement:', error);
  }
};
