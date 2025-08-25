import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../src/auth/context';
import { useIsFocused } from '@react-navigation/native';
import { 
  fetchUserActivities, 
  ensureActivitiesExist,
  fetchDailyProgress,
  setDailyProgress,
  fetchDailyProgressRange
} from '../../../services/activities';
import { calculateAllStreaks } from '../../../src/services/streaks';
import { format, subDays, startOfDay } from 'date-fns';

// Activity definitions
const ACTIVITY_DEFINITIONS = {
  prayer: {
    icon: 'Heart',
    title: 'Prayer Time',
    color: 'rose',
    goalUnit: 'mins',
    dailyGoal: 15,
  },
  bible: {
    icon: 'BookOpen',
    title: 'Bible Reading',
    color: 'blue',
    goalUnit: 'chapters',
    dailyGoal: 1,
  },
  devotional: {
    icon: 'Sun',
    title: 'Devotional',
    color: 'amber',
    goalUnit: 'mins',
    dailyGoal: 20,
  },
  'evening-prayer': {
    icon: 'Moon',
    title: 'Evening Prayer',
    color: 'indigo',
    goalUnit: 'mins',
    dailyGoal: 10,
  },
};

const useActivitiesSimple = () => {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  
  // Core state
  const [userActivities, setUserActivities] = useState([]);
  const [todayProgress, setTodayProgress] = useState({}); // { activityType: progress }
  const [liveProgress, setLiveProgress] = useState({}); // { activityType: liveValue }
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user activities and today's progress
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Fetch user activities
      let activities = await fetchUserActivities(user.id);
      if (activities.length === 0) {
        await ensureActivitiesExist(user.id, []);
        activities = await fetchUserActivities(user.id);
      }
      setUserActivities(activities);

      // Fetch today's progress for each activity
      const today = new Date().toISOString().split('T')[0];
      const progressPromises = activities.map(async (activity) => {
        const progress = await fetchDailyProgress(user.id, activity.type, today);
        return [activity.type, progress];
      });
      
      const progressResults = await Promise.all(progressPromises);
      const progressMap = Object.fromEntries(progressResults);
      setTodayProgress(progressMap);
      
    } catch (e) {
      console.error('Failed to fetch activity data:', e);
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // 🔥 STREAKS: Calculate streaks using new centralized service
  const calculateStreaks = useCallback(async () => {
    if (!user?.id || userActivities.length === 0) return {};
    
    try {
      console.log('📊 Calculating streaks for', userActivities.length, 'activities...');
      
      // Use new centralized streak calculation
      const activityTypes = userActivities.map(a => a.type);
      const streaksMap = await calculateAllStreaks(user.id, activityTypes);
      
      // Convert to expected format
      const streaks = {};
      Object.keys(streaksMap).forEach(activityType => {
        streaks[activityType] = streaksMap[activityType].current;
      });
      
      console.log('✅ Calculated all streaks:', streaks);
      return streaks;
    } catch (e) {
      console.error('Failed to calculate streaks:', e);
      return {};
    }
  }, [user?.id, userActivities]);

  // Calculate streak for a single activity
  const calculateActivityStreak = (progressData, activity) => {
    const goal = activity.daily_goal;
    let streak = 0;
    let currentDate = new Date();
    
    // Check consecutive days backwards from today
    for (let i = 0; i < 30; i++) {
      const checkDate = format(subDays(currentDate, i), 'yyyy-MM-dd');
      const dayProgress = progressData.find(p => p.date === checkDate);
      
      if (dayProgress && dayProgress.total_progress >= goal) {
        if (i === 0 || streak > 0) { // Continue streak only if today is complete or streak is ongoing
          streak++;
        }
      } else {
        if (i === 0) {
          // Today is not complete, check if yesterday was (for ongoing streaks)
          const yesterday = format(subDays(currentDate, 1), 'yyyy-MM-dd');
          const yesterdayProgress = progressData.find(p => p.date === yesterday);
          if (yesterdayProgress && yesterdayProgress.total_progress >= goal) {
            // Start counting from yesterday
            for (let j = 1; j < 30; j++) {
              const pastDate = format(subDays(currentDate, j), 'yyyy-MM-dd');
              const pastProgress = progressData.find(p => p.date === pastDate);
              if (pastProgress && pastProgress.total_progress >= goal) {
                streak++;
              } else {
                break;
              }
            }
          }
        }
        break;
      }
    }
    
    return streak;
  };

  // Fetch data when component mounts or comes into focus
  useEffect(() => {
    if (isFocused && user?.id) {
      fetchData();
    }
  }, [isFocused, user?.id, fetchData]);

  // Prepare activities with current progress and live updates
  const [activities, setActivities] = useState([]);
  const [streaks, setStreaks] = useState({});

  useEffect(() => {
    const prepareActivities = async () => {
      if (userActivities.length === 0) return;
      
      const activityStreaks = await calculateStreaks();
      setStreaks(activityStreaks);
      
      const processedActivities = userActivities.map(activity => {
        const baseProgress = todayProgress[activity.type] || 0;
        const liveValue = liveProgress[activity.type];
        const currentProgress = liveValue !== undefined ? liveValue : baseProgress;
        
        return {
          ...activity,
          ...ACTIVITY_DEFINITIONS[activity.type],
          progress: currentProgress,
          originalProgress: baseProgress, // Store original for comparison
          streak: activityStreaks[activity.type] || 0,
          bestStreak: activity.best_streak || 0, // Will be updated via setDailyProgress
        };
      });
      
      setActivities(processedActivities);
    };
    
    prepareActivities();
  }, [userActivities, todayProgress, liveProgress, calculateStreaks]);

  // Live progress management
  const setLiveValue = useCallback((activityType, value) => {
    setLiveProgress(prev => ({
      ...prev,
      [activityType]: Math.round(value)
    }));
  }, []);

  const clearLiveValue = useCallback((activityType) => {
    setLiveProgress(prev => {
      const newState = { ...prev };
      delete newState[activityType];
      return newState;
    });
  }, []);

  // Save progress to database
  const saveProgress = useCallback(async (activityType, totalProgress) => {
    if (!user?.id || totalProgress < 0) return;
    
    try {
      const result = await setDailyProgress(user.id, activityType, totalProgress);
      
      // Update local state to reflect the saved value
      setTodayProgress(prev => ({
        ...prev,
        [activityType]: totalProgress
      }));
      
      // 🔥 STREAKS: If streaks were updated, recalculate all activities
      if (result?.streaks) {
        console.log('🔥 Streak updated:', result.streaks);
        // Trigger a refresh of activities to show updated streaks
        const activityStreaks = await calculateStreaks();
        setStreaks(activityStreaks);
      }
      
      // Clear live state for this activity
      clearLiveValue(activityType);
      
    } catch (e) {
      console.error('Failed to save progress:', e);
      setError(e);
    }
  }, [user?.id, clearLiveValue, calculateStreaks]);

  return {
    activities,
    isLoading,
    error,
    setLiveValue,
    clearLiveValue,
    saveProgress,
    refreshData: fetchData,
  };
};

export default useActivitiesSimple; 