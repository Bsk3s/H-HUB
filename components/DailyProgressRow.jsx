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
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold">Daily Progress</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text className="text-blue-500 text-sm font-medium">View All →</Text>
        </TouchableOpacity>
      </View>
      
      {/* Use ScrollView to handle potential overflow on smaller screens */}
      {(() => {
        const horizontalPadding = 16 * 2; // matches HomeScreen container padding
        const interItemGap = 6; // breathing room
        const numVisible = Math.min(4, activitiesWithStreaks.length || 4);
        const totalGap = interItemGap * (numVisible - 1);
        const available = SCREEN_WIDTH - horizontalPadding - totalGap;
        const size = Math.floor(available / numVisible);
        return (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {activitiesWithStreaks.slice(0, 4).map((activity, index) => (
              <View key={activity.type} style={{ width: size }}>
                <ActivityRing
                  activity={activity}
                  size={size}
                  onClick={() => onActivitySelect(activity)}
                  getCurrentProgress={getCurrentProgress}
                />
              </View>
            ))}
          </View>
        );
      })()}
    </View>
  );
};

export default DailyProgressRow; 