// Test utility for verifying streak calculations
import { 
  calculateCurrentStreak, 
  getBestStreak, 
  isActivityCompletedOnDate,
  recalculateStreaks 
} from '../services/streaks';
import { setDailyProgress } from '../services/activities';

/**
 * Test streak calculations for a user
 * Call this from console to verify streaks are working
 */
export const testUserStreaks = async (userId) => {
  try {
    console.log('🧪 Testing streak calculations for user:', userId);
    
    const activityTypes = ['prayer', 'bible', 'devotional', 'evening-prayer'];
    
    for (const activityType of activityTypes) {
      console.log(`\n📊 Testing ${activityType}:`);
      
      // Test completion check for today
      const todayDate = new Date().toISOString().split('T')[0];
      const isCompletedToday = await isActivityCompletedOnDate(userId, activityType, todayDate);
      console.log(`  Today (${todayDate}) completed: ${isCompletedToday}`);
      
      // Test current streak
      const currentStreak = await calculateCurrentStreak(userId, activityType);
      console.log(`  Current streak: ${currentStreak} days`);
      
      // Test best streak
      const bestStreak = await getBestStreak(userId, activityType);
      console.log(`  Best streak: ${bestStreak} days`);
      
      // Test full recalculation
      const result = await recalculateStreaks(userId, activityType);
      console.log(`  Recalculated: current=${result.currentStreak}, best=${result.bestStreak}, newBest=${result.isNewBest}`);
    }
    
    console.log('\n✅ Streak testing completed');
    
  } catch (error) {
    console.error('❌ Error testing streaks:', error);
  }
};

// Helper to simulate progress and test streak updates
export const simulateProgressAndTestStreaks = async (userId, activityType, progress) => {
  try {
    console.log(`🎮 Simulating ${progress} progress for ${activityType}...`);
    
    // Use the imported setDailyProgress function
    
    const result = await setDailyProgress(userId, activityType, progress);
    console.log('💾 Progress saved:', result);
    
    // Test that streaks were updated
    const updatedStreak = await calculateCurrentStreak(userId, activityType);
    console.log(`🔥 Updated streak: ${updatedStreak} days`);
    
    return result;
  } catch (error) {
    console.error('❌ Error simulating progress:', error);
  }
};

// Example usage (call from React Native debugger console):
// import { testUserStreaks } from './src/utils/testStreaks';
// testUserStreaks('your-user-id-here');


