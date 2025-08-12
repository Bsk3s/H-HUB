import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
import ActivityRing from './ActivityRing';

const DailyProgressRow = ({ activities, onActivitySelect, onViewAll, getCurrentProgress }) => {
  // Ensure all activities have their streaks properly set
  const activitiesWithStreaks = activities.map(activity => {
    // Preserve the original streak value, ensuring it's a valid number
    const streak = typeof activity.streak === 'number' ? activity.streak : 0;
    return { ...activity, streak };
  });

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '600' }}>Daily Progress</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={{ color: '#3b82f6', fontSize: 14, fontWeight: '500' }}>View All →</Text>
        </TouchableOpacity>
      </View>
      {(() => {
        // Make horizontally scrollable with bounce on edges
        const containerPadding = 16; // matches HomeScreen side padding
        const interItemGap = 10; // slightly larger for swipe comfort
        const baseVisible = 4;
        const available = SCREEN_WIDTH - containerPadding * 2 - interItemGap * (baseVisible - 1);
        const size = Math.floor(available / baseVisible);
        const items = activitiesWithStreaks;
        return (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            alwaysBounceHorizontal
            contentContainerStyle={{ paddingHorizontal: containerPadding }}
          >
            <View style={{ flexDirection: 'row' }}>
              {items.map((activity, index) => (
                <View key={activity.type} style={{ width: size, marginRight: index === items.length - 1 ? 0 : interItemGap }}>
                  <ActivityRing
                    activity={activity}
                    size={size}
                    onClick={() => onActivitySelect(activity)}
                    getCurrentProgress={getCurrentProgress}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        );
      })()}
    </View>
  );
};

export default DailyProgressRow; 