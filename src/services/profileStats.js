// src/services/profileStats.js
// Service for calculating user profile statistics

import { supabase } from '../auth/supabase-client';
import { format, subDays, startOfDay, parseISO } from 'date-fns';

/**
 * Get all unique dates where user had any activity
 * @param {string} userId - User's UUID
 * @returns {Promise<string[]>} Array of date strings in YYYY-MM-DD format
 */
const getActiveDates = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('daily_progress')
            .select('date, total_progress')
            .eq('user_id', userId)
            .gt('total_progress', 0) // Only count days with actual progress
            .order('date', { ascending: false });

        if (error) throw error;

        // Return unique dates
        const uniqueDates = [...new Set(data.map(entry => entry.date))];
        return uniqueDates;
    } catch (error) {
        console.error('Error fetching active dates:', error);
        return [];
    }
};

/**
 * Calculate current streak (consecutive days with any activity)
 * @param {string[]} activeDates - Sorted array of active dates (newest first)
 * @returns {number} Current streak count
 */
const calculateCurrentStreak = (activeDates) => {
    if (!activeDates || activeDates.length === 0) return 0;

    let streak = 0;
    let currentDate = startOfDay(new Date());

    // Check if today or yesterday has activity (streak is maintained if you did something yesterday)
    const today = format(currentDate, 'yyyy-MM-dd');
    const yesterday = format(subDays(currentDate, 1), 'yyyy-MM-dd');

    let startDate = currentDate;
    if (activeDates.includes(today)) {
        // Today is active, start counting from today
        streak = 1;
        startDate = subDays(currentDate, 1);
    } else if (activeDates.includes(yesterday)) {
        // Today not active but yesterday was, start counting from yesterday
        streak = 1;
        startDate = subDays(currentDate, 2);
    } else {
        // Streak is broken
        return 0;
    }

    // Count backwards for consecutive days
    for (let i = 0; i < 365; i++) { // Max 365 days
        const checkDate = format(subDays(startDate, i), 'yyyy-MM-dd');
        if (activeDates.includes(checkDate)) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
};

/**
 * Calculate best streak from all activity history
 * @param {string[]} activeDates - Sorted array of active dates
 * @returns {number} Best streak count
 */
const calculateBestStreak = (activeDates) => {
    if (!activeDates || activeDates.length === 0) return 0;

    // Sort dates in ascending order for easier processing
    const sortedDates = [...activeDates].sort();

    let bestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = parseISO(sortedDates[i - 1]);
        const currDate = parseISO(sortedDates[i]);

        // Check if dates are consecutive (1 day apart)
        const daysDiff = Math.abs((currDate - prevDate) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
            currentStreak++;
            bestStreak = Math.max(bestStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
    }

    return bestStreak;
};

/**
 * Get comprehensive user statistics
 * @param {string} userId - User's UUID
 * @returns {Promise<Object>} Object with currentStreak, bestStreak, totalDays
 */
export const getUserStats = async (userId) => {
    try {
        if (!userId) {
            console.warn('No userId provided to getUserStats');
            return {
                currentStreak: 0,
                bestStreak: 0,
                totalDays: 0,
            };
        }

        console.log('📊 Fetching user stats for:', userId);

        // Get all active dates
        const activeDates = await getActiveDates(userId);

        // Calculate stats
        const totalDays = activeDates.length;
        const currentStreak = calculateCurrentStreak(activeDates);
        const bestStreak = calculateBestStreak(activeDates);

        console.log('📊 Stats calculated:', {
            currentStreak,
            bestStreak,
            totalDays,
            sampleDates: activeDates.slice(0, 5), // Show first 5 dates for debugging
        });

        return {
            currentStreak,
            bestStreak,
            totalDays,
        };
    } catch (error) {
        console.error('Error calculating user stats:', error);
        return {
            currentStreak: 0,
            bestStreak: 0,
            totalDays: 0,
        };
    }
};

/**
 * Get stats for a specific activity type
 * @param {string} userId - User's UUID
 * @param {string} activityType - Activity type (prayer, bible, devotional, evening-prayer)
 * @returns {Promise<Object>} Object with currentStreak, bestStreak for that activity
 */
export const getActivityStats = async (userId, activityType) => {
    try {
        const { data, error } = await supabase
            .from('user_activities')
            .select('current_streak, best_streak')
            .eq('user_id', userId)
            .eq('type', activityType)
            .single();

        if (error) throw error;

        return {
            currentStreak: data?.current_streak || 0,
            bestStreak: data?.best_streak || 0,
        };
    } catch (error) {
        console.error(`Error fetching stats for ${activityType}:`, error);
        return {
            currentStreak: 0,
            bestStreak: 0,
        };
    }
};



















