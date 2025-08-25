import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonView from './SkeletonView';

/**
 * Skeleton loading state for activity rings
 */
const ActivityRingSkeleton = ({ size = 100, count = 4 }) => {
  return (
    <View style={styles.container}>
      <SkeletonView width="60%" height={24} style={styles.titleSkeleton} />
      <View style={styles.ringsContainer}>
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={styles.ringContainer}>
            {/* Ring skeleton */}
            <View style={[styles.ringSkeleton, { width: size, height: size }]}>
              <SkeletonView 
                width={size} 
                height={size} 
                borderRadius={size / 2}
                style={styles.ring}
              />
            </View>
            {/* Label skeleton */}
            <SkeletonView 
              width={size * 0.8} 
              height={16} 
              style={styles.labelSkeleton}
            />
            {/* Streak skeleton */}
            <SkeletonView 
              width={size * 0.6} 
              height={12} 
              style={styles.streakSkeleton}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  titleSkeleton: {
    marginBottom: 16,
  },
  ringsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ringContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  ringSkeleton: {
    marginBottom: 8,
  },
  ring: {
    borderWidth: 2,
    borderColor: '#F2F2F7',
  },
  labelSkeleton: {
    marginBottom: 4,
  },
  streakSkeleton: {
    marginBottom: 8,
  },
});

export default ActivityRingSkeleton;


