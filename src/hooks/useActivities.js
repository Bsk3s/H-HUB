import { useState, useEffect, useMemo, useCallback } from 'react';
import { BookOpen, Heart, Sun, Moon } from 'lucide-react-native';
import {
  fetchUserActivities,
  fetchActivityLogs,
  upsertUserActivity,
  logActivityProgress,
  ensureActivitiesExist
} from '../services/activities';
import { startOfDay, formatISO, isToday, subDays, parse, differenceInDays, format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
// import { useAuth } from '../auth/context'; // Commented out for demo mode

// --- Constants ---
const CACHE_KEY = 'activities_cache';
const CACHE_DURATION_MINUTES = 5;

// Phase 1: Business Logic & Rules
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

// Define what it means to "complete" an activity for a day
const COMPLETION_THRESHOLDS = {
  'prayer': { minMinutes: 5 },
  'bible': { minChapters: 1 },
  'devotional': { minMinutes: 10 },
  'evening-prayer': { minMinutes: 5 },
};

// --- Helper Functions ---

const formatDateKey = (date) => formatISO(date, { representation: 'date' });

const groupLogsByDate = (logs) => {
  return logs.reduce((acc, log) => {
    const dateKey = formatDateKey(startOfDay(new Date(log.date)));
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(log);
    return acc;
  }, {});
};

const isActivityCompleted = (activityType, dailyLogs, activities) => {
  if (!dailyLogs || dailyLogs.length === 0) return false;
    
    const activityDefinition = activities.find(a => a.type === activityType);
    if (!activityDefinition) return false;
  
  const totalProgress = dailyLogs
        .filter(log => log.activityType === activityType)
    .reduce((sum, log) => sum + (log.progress || 0), 0);
    
    return totalProgress >= activityDefinition.daily_goal;
};

const calculateStreak = (activityType, groupedLogs, activities) => {
  let streak = 0;
  let currentDate = startOfDay(new Date());

    const checkDate = (date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        return isActivityCompleted(activityType, groupedLogs[dateKey], activities);
    }

    // A streak can only be current if today is completed.
    if (checkDate(currentDate)) {
        streak = 1;
        let previousDate = subDays(currentDate, 1);
        while (checkDate(previousDate)) {
      streak++;
            previousDate = subDays(previousDate, 1);
        }
    } else {
        // If today is not complete, we check if yesterday was, to see if the streak ended yesterday.
        let yesterday = subDays(currentDate, 1);
        if(checkDate(yesterday)) {
            streak = 1;
            let previousDate = subDays(yesterday, 1);
            while (checkDate(previousDate)) {
                streak++;
                previousDate = subDays(previousDate, 1);
            }
    }
  }

  return streak;
};

// Calculate today's progress
const calculateTodayProgress = (dailyProgress) => {
    const todayKey = formatDateKey(new Date());
    const todayLogs = dailyProgress[todayKey] || [];
    return todayLogs.reduce((sum, log) => sum + (log.progress || 0), 0);
};

// Format the duration string for display
const formatDuration = (progress, type) => {
    const definition = ACTIVITY_DEFINITIONS[type];
    if (!definition) return '';
    const goal = definition.dailyGoal;
    const unit = definition.goalUnit === 'mins' ? 'm' : ' chapters';
    if (unit === 'm') {
      return `${progress}m / ${goal}m`;
    }
    return `${progress}/${goal} chapters`;
};

const processActivityData = (userActivities, activityLogs) => {
    if (!userActivities.length) return [];

    const todayKey = format(new Date(), 'yyyy-MM-dd');
    const logsGroupedByDate = activityLogs.reduce((acc, log) => {
        if (log && log.date) {
            const dateKey = format(new Date(log.date), 'yyyy-MM-dd');
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(log);
        }
        return acc;
    }, {});

    return userActivities.map(activity => {
        const todayLogsForActivity = (logsGroupedByDate[todayKey] || []).filter(
            log => log.activityType === activity.type
        );
        const todayProgress = todayLogsForActivity.reduce((sum, log) => sum + log.progress, 0);
        
        const streak = calculateStreak(activity.type, logsGroupedByDate, userActivities);

        return {
            ...activity,
            ...ACTIVITY_DEFINITIONS[activity.type],
            progress: todayProgress,
            streak: streak,
            bestStreak: activity.best_streak || 0, // This would be calculated and stored separately
        };
    });
};

const updateActivityInCache = async (updatedActivity) => {
    try {
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedData) {
            const { activities } = JSON.parse(cachedData);
            const newActivities = activities.map(act => act.id === updatedActivity.id ? updatedActivity : act);
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ activities: newActivities, timestamp: Date.now() }));
        }
    } catch (e) {
        console.error("Failed to update activity in cache", e);
    }
};

// --- Main Hook ---
const useActivities = () => {
    // DEMO MODE: Use mock user for testing full HB1 experience
    const user = { id: 'demo-user-12345', email: 'demo@test.com' };
    // const { user } = useAuth(); // Uncomment when auth is ready
    const [userActivities, setUserActivities] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [liveUpdate, setLiveUpdate] = useState(null); // { id, progress }
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const isFocused = useIsFocused();
    // Headless state for real-time UI updates
    const [liveDraft, setLiveDraft] = useState({});

    const fetchAndProcessData = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            // DEMO MODE: Use mock data for testing
            if (user.id === 'demo-user-12345') {
                console.log('🔧 DEMO MODE: Loading mock HB1 activity data');
                
                // Create realistic demo activities matching HB1 structure
                const demoActivities = [
                    {
                        id: 'demo-activity-1',
                        user_id: 'demo-user-12345',
                        type: 'prayer',
                        daily_goal: 15,
                        created_at: new Date().toISOString(),
                        read_chapters: null
                    },
                    {
                        id: 'demo-activity-2', 
                        user_id: 'demo-user-12345',
                        type: 'bible',
                        daily_goal: 1,
                        created_at: new Date().toISOString(),
                        read_chapters: {}
                    },
                    {
                        id: 'demo-activity-3',
                        user_id: 'demo-user-12345', 
                        type: 'devotional',
                        daily_goal: 20,
                        created_at: new Date().toISOString(),
                        read_chapters: null
                    },
                    {
                        id: 'demo-activity-4',
                        user_id: 'demo-user-12345',
                        type: 'evening-prayer', 
                        daily_goal: 10,
                        created_at: new Date().toISOString(),
                        read_chapters: null
                    }
                ];
                
                // Create realistic demo logs for the past week
                const today = new Date();
                const demoLogs = [];
                
                for (let i = 0; i < 7; i++) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    const dateString = date.toISOString().split('T')[0];
                    
                    // Add varying progress for realistic demo
                    if (i < 5) {
                        demoLogs.push({
                            id: `demo-log-prayer-${i}`,
                            user_id: 'demo-user-12345',
                            user_activity_id: 'demo-activity-1',
                            progress: i === 0 ? 5 : i === 1 ? 15 : i === 2 ? 10 : 15,
                            created_at: date.toISOString(),
                            date: dateString,
                            activityType: 'prayer'
                        });
                    }
                    
                    if (i < 4) {
                        demoLogs.push({
                            id: `demo-log-bible-${i}`,
                            user_id: 'demo-user-12345',
                            user_activity_id: 'demo-activity-2', 
                            progress: i === 0 ? 0 : 1,
                            created_at: date.toISOString(),
                            date: dateString,
                            activityType: 'bible'
                        });
                    }
                    
                    if (i < 6) {
                        demoLogs.push({
                            id: `demo-log-devotional-${i}`,
                            user_id: 'demo-user-12345',
                            user_activity_id: 'demo-activity-3',
                            progress: i === 0 ? 0 : i === 1 ? 20 : i === 2 ? 15 : 20,
                            created_at: date.toISOString(),
                            date: dateString,
                            activityType: 'devotional'
                        });
                    }
                    
                    if (i < 3) {
                        demoLogs.push({
                            id: `demo-log-evening-${i}`,
                            user_id: 'demo-user-12345',
                            user_activity_id: 'demo-activity-4',
                            progress: i === 0 ? 0 : 10,
                            created_at: date.toISOString(),
                            date: dateString,
                            activityType: 'evening-prayer'
                        });
                    }
                }
                
                setUserActivities(demoActivities);
                setActivityLogs(demoLogs);
                console.log('🔧 DEMO: Loaded', demoActivities.length, 'activities and', demoLogs.length, 'logs');
                setIsLoading(false);
                return;
            }
            
            // Real Supabase mode (commented out for demo)
            let activities = await fetchUserActivities(user.id);
            if (activities.length === 0) {
                await ensureActivitiesExist(user.id, []);
                activities = await fetchUserActivities(user.id);
            }
            const logs = await fetchActivityLogs(user.id);
            setUserActivities(activities);
            setActivityLogs(logs);
        } catch (e) {
            console.error("Failed to fetch activity data:", e);
            setError(e);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (isFocused && user?.id) {
            fetchAndProcessData();
        }
    }, [isFocused, user?.id, fetchAndProcessData]);

    const activities = useMemo(() => {
        // First process the logs to add activityType
        const processedLogsForProcessing = activityLogs.map(log => {
            const activity = userActivities.find(a => a.id === log.user_activity_id);
            return {
                date: (log.date || log.created_at),
                activityType: activity?.type,
                progress: log.progress,
            };
        }).filter(log => log.activityType); // Ensure we found a matching activity

        // Add bible logs
        const bibleActivity = userActivities.find(a => a.type === 'bible');
        const bibleLogs = [];
        if (bibleActivity && bibleActivity.read_chapters) {
            Object.values(bibleActivity.read_chapters).forEach(bookChapters => {
                if (Array.isArray(bookChapters)) {
                    bookChapters.forEach(chapterLog => {
                        if (chapterLog && chapterLog.date) {
                            bibleLogs.push({
                                date: chapterLog.date,
                                activityType: 'bible',
                                progress: 1, // 1 chapter
                            });
                        }
                    });
                }
            });
        }
        const allProcessedLogs = [...processedLogsForProcessing, ...bibleLogs];

        // Now process activity data with the correct logs
        const processed = processActivityData(userActivities, allProcessedLogs);
        
        // Apply live draft updates for real-time UI feedback
        return processed.map(activity => {
            const draft = liveDraft[activity.id];
            if (draft) {
                return {
                    ...activity,
                    progress: draft.progress !== undefined ? draft.progress : activity.progress,
                    read_chapters: draft.read_chapters || activity.read_chapters,
                };
            }
            return activity;
        });
    }, [userActivities, activityLogs, liveDraft]);

    // Helper function to get current progress (live or database)
    const getCurrentProgress = useCallback((activityId) => {
        const draft = liveDraft[activityId];
        const activity = activities.find(a => a.id === activityId);
        
        if (!activity) return 0;
        
        // Return live draft value if it exists, otherwise database value
        return draft?.progress !== undefined ? draft.progress : (activity.progress || 0);
    }, [liveDraft, activities]);

    const updateLiveProgress = useCallback((activityId, progress) => {
        setLiveUpdate({ id: activityId, progress: Math.round(progress) });
    }, []);

    const logActivity = useCallback(async (activityId, data) => {
        if (!user?.id) return;
        
        setLiveUpdate(null); // Clear live update on save

        const activity = userActivities.find(a => a.id === activityId);
        if (!activity) return;

        try {
            if (activity.type === 'bible' && data.read_chapters) {
                await upsertUserActivity({
                    id: activityId,
                    read_chapters: data.read_chapters,
                    last_read_book: data.last_read_book,
                    last_read_chapter: data.last_read_chapter,
                    last_logged_at: new Date().toISOString()
                });
            } else if (data.progress !== undefined) {
                await logActivityProgress({
                    user_activity_id: activityId,
                user_id: user.id,
                    progress: data.progress,
                });
            }
            
            await fetchAndProcessData();
        } catch (e) {
            console.error('Failed to log activity:', e);
            setError(e);
        }
    }, [user?.id, userActivities, fetchAndProcessData]);

    const commitLiveDraft = useCallback(async (activityId) => {
        const draft = liveDraft[activityId];
        if (!user?.id || !draft) return;

        console.log('💾 Committing live draft for activity:', activityId);
        console.log('💾 Draft data:', draft);

        const originalActivity = userActivities.find(a => a.id === activityId);
        if (!originalActivity) return;

        console.log('💾 Original activity type:', originalActivity.type);

        try {
            if (originalActivity.type === 'bible' && draft.read_chapters) {
                 await upsertUserActivity({
                    id: activityId,
                    read_chapters: draft.read_chapters,
                    last_read_book: draft.last_read_book,
                    last_read_chapter: draft.last_read_chapter,
                    last_logged_at: new Date().toISOString(),
                });
            } else if (draft.progress !== undefined) {
                // Save the absolute progress value, not just positive differences
                const initialProgress = draft.initialProgress || 0;
                const progressDifference = draft.progress - initialProgress;
                
                // Only save if there's actually a change (positive or negative)
                if (progressDifference !== 0) {
                    await logActivityProgress({
                        user_activity_id: activityId,
                        user_id: user.id,
                        progress: progressDifference,
                        created_at: new Date().toISOString(),
                    });
                }
            }
             // Refresh data after commit
            await fetchAndProcessData();
        } catch (error) {
            console.error('Error committing live draft:', error);
            // Optionally revert UI state or show error to user
        } finally {
            // Clear the draft for this activity
            setLiveDraft(prev => {
                const newDraft = { ...prev };
                delete newDraft[activityId];
                return newDraft;
            });
        }
    }, [user?.id, liveDraft, userActivities, fetchAndProcessData]);

    const processedLogs = useMemo(() => {
        const standardLogs = activityLogs.map(log => {
            const activity = userActivities.find(a => a.id === log.user_activity_id);
            return {
                date: (log.date || log.created_at),
                activityType: activity?.type,
                progress: log.progress,
            };
        }).filter(log => log.activityType); // Ensure we found a matching activity

        const bibleActivity = userActivities.find(a => a.type === 'bible');
        const bibleLogs = [];
        if (bibleActivity && bibleActivity.read_chapters) {
            Object.values(bibleActivity.read_chapters).forEach(bookChapters => {
                if (Array.isArray(bookChapters)) {
                    bookChapters.forEach(chapterLog => {
                        if (chapterLog && chapterLog.date) {
                            bibleLogs.push({
                                date: chapterLog.date,
                                activityType: 'bible',
                                progress: 1, // 1 chapter
                            });
                        }
                    });
                }
            });
        }
        return [...standardLogs, ...bibleLogs];
    }, [activityLogs, userActivities]);

  return {
    activities,
        activityLogs: processedLogs,
        isLoading, 
        error, 
        setLiveDraft,
        commitLiveDraft,
        getCurrentProgress,
        fetchActivities: fetchAndProcessData,
  };
};

export default useActivities; 