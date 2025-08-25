import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
import ActivityRing from './ActivityRing';

const DailyProgressRow = React.memo(({ activities, onActivitySelect, onViewAll, getCurrentProgress }) => {
  // 🚀 PERFORMANCE: Memoize activities with streaks processing
  const activitiesWithStreaks = useMemo(() => {
    return activities.map(activity => {
      // Preserve the original streak value, ensuring it's a valid number
      const streak = typeof activity.streak === 'number' ? activity.streak : 0;
      return { ...activity, streak };
    });
  }, [activities]);

  // 🚀 PERFORMANCE: Memoize layout calculations
  const layoutConfig = useMemo(() => {
    const containerPadding = 16; // matches HomeScreen side padding
    const interItemGap = 10; // slightly larger for swipe comfort
    const baseVisible = 4;
    const available = SCREEN_WIDTH - containerPadding * 2 - interItemGap * (baseVisible - 1);
    const size = Math.floor(available / baseVisible);
    
    return { containerPadding, interItemGap, size };
  }, []);

  // 🚀 PERFORMANCE: Stable activity select callback
  const handleActivitySelect = useCallback((activity) => {
    onActivitySelect(activity);
  }, [onActivitySelect]);

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '600' }}>Daily Progress</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={{ color: '#3b82f6', fontSize: 14, fontWeight: '500' }}>View All →</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        alwaysBounceHorizontal
        contentContainerStyle={{ paddingHorizontal: layoutConfig.containerPadding }}
      >
        <View style={{ flexDirection: 'row' }}>
          {activitiesWithStreaks.map((activity, index) => (
            <View 
              key={activity.type} 
              style={{ 
                width: layoutConfig.size, 
                marginRight: index === activitiesWithStreaks.length - 1 ? 0 : layoutConfig.interItemGap 
              }}
            >
              <ActivityRing
                activity={activity}
                size={layoutConfig.size}
                onClick={() => handleActivitySelect(activity)}
                getCurrentProgress={getCurrentProgress}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
});

// 🚀 PERFORMANCE: Add display name for better debugging
DailyProgressRow.displayName = 'DailyProgressRow';

export default DailyProgressRow; 