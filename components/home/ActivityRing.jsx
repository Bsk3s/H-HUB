import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Star, Heart, BookOpen, Sun, Moon } from 'lucide-react-native';

const ICONS = {
  Heart,
  BookOpen,
  Sun,
  Moon,
  Star, // Fallback
};

const ActivityRing = ({ activity, onClick, size: customSize, hideText = false, isCalendarView = false, date, color: propColor, getCurrentProgress }) => {
  const { title, progress, dailyGoal, streak, color: activityColor = "blue", icon: iconName } = activity;
  const Icon = ICONS[iconName] || ICONS.Star;
  
  // Use propColor if provided, otherwise fall back to activityColor
  const color = propColor || activityColor;
  
  // Ring configuration
  const size = customSize || 100;
  // Slightly heavier stroke for stronger presence
  const strokeWidth = isCalendarView ? size * 0.12 : (hideText ? size * 0.16 : size * 0.14);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Use live progress if available, otherwise fall back to stored progress
  const goal = isCalendarView ? 100 : (dailyGoal || 1);
  const currentProgress = getCurrentProgress ? getCurrentProgress(activity.id) : (progress || 0);
  
  // Simple progress calculation - percentage of goal completed (max 100%)
  const progressPercentage = goal > 0 ? Math.min((currentProgress / goal) * 100, 100) : 0;
  const isComplete = currentProgress >= goal;
  
  const progressOffset = circumference - (progressPercentage / 100) * circumference;
  
  // Map legacy color names to new color names
  const colorNameMap = {
    'red': 'rose',
    'orange': 'amber',
    'purple': 'indigo'
  };

  // Convert legacy color names to new color names
  const normalizedColorName = colorNameMap[color] || color;
  
  // Professional, high-contrast colors - KEEP ORIGINAL COLORS ALWAYS
  const colorMap = {
    rose: {
      ring: '#ff2d55', // Always red
      bg: '#fff1f2',
      inactiveRing: 'rgba(255, 45, 85, 0.1)'
    },
    blue: {
      ring: '#0a84ff', // Always blue  
      bg: '#dbeafe',
      inactiveRing: 'rgba(10, 132, 255, 0.1)'
    },
    amber: {
      ring: '#ffcc00', // Always yellow
      bg: '#fffbeb', 
      inactiveRing: 'rgba(255, 204, 0, 0.1)'
    },
    indigo: {
      ring: '#bf5af2', // Always purple
      bg: '#eef2ff',
      inactiveRing: 'rgba(191, 90, 242, 0.1)'
    }
  };
  
  // Use the activity's color or fallback to blue
  const colors = colorMap[normalizedColorName] || colorMap.blue;

  // Format display text
  const formatDisplayText = () => {
    if (activity.type === 'bible') {
      return `${currentProgress}/${goal} chapters`;
    }
    return `${currentProgress}m / ${goal}m`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Determine if this is an empty/inactive ring for calendar view
  const isEmptyRing = isCalendarView && progressPercentage <= 0;

  return (
    <TouchableOpacity onPress={onClick} style={{ width: size, alignItems: 'center' }}>
      <View style={{ position: 'relative' }}>
        <Svg width={size} height={size}>
          {/* Background circle with better visibility */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.inactiveRing}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="butt"
          />
          
          {/* Progress circle with better visibility */}
          {progressPercentage > 0 && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.ring}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference}`}
              strokeDashoffset={progressOffset}
              strokeLinecap="butt"
              transform={`rotate(-90, ${size / 2}, ${size / 2})`}
              fill="none"
            />
          )}
        </Svg>
        
        {!hideText && (
          <>
            {/* Icon Circle */}
            <View 
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}
            >
              <View 
                style={{ 
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.bg,
                  width: size * 0.68,
                  height: size * 0.68,
                }}
              >
                <Icon stroke={colors.ring} size={size * 0.31} strokeWidth={2} />
              </View>
            </View>
            
            {/* Streak Badge */}
            {streak > 0 && (
               <View 
                style={{ 
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 999,
                  position: 'absolute',
                   bottom: -6,
                   right: -2,
                  backgroundColor: colors.bg
                }}
              >
                <Star size={12} color={colors.ring} fill={colors.ring} />
                <Text 
                  style={{ fontSize: 12, fontWeight: '500', color: colors.ring }}
                >
                  {streak}d
                </Text>
              </View>
            )}
          </>
        )}
      </View>
      
      {/* Title and Duration Text */}
      {!hideText && (
        <>
          <Text 
            numberOfLines={1}
            style={{ 
              textAlign: 'center',
              fontWeight: '500',
              marginTop: 8,
              width: '100%',
              fontSize: size * 0.16
            }}
          >
            {title}
          </Text>
          <Text 
            style={{ 
              color: '#6b7280',
              textAlign: 'center',
              width: '100%',
              fontSize: size * 0.12
            }}
          >
            {formatDisplayText()}
          </Text>
          <Text 
            style={{ 
              color: '#9ca3af',
              textAlign: 'center',
              width: '100%',
              fontSize: size * 0.11
            }}
          >
            {date ? formatDate(date) : ''}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default ActivityRing;
