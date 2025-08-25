import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonView from './SkeletonView';

/**
 * Skeleton loading state for Bible verses
 */
const BibleVerseSkeleton = ({ count = 8 }) => {
  const getRandomWidth = () => {
    const widths = ['100%', '95%', '85%', '90%', '80%', '92%'];
    return widths[Math.floor(Math.random() * widths.length)];
  };

  return (
    <View style={styles.container}>
      {/* Chapter title skeleton */}
      <SkeletonView width="50%" height={28} style={styles.titleSkeleton} />
      
      {/* Verse skeletons */}
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.verseContainer}>
          <View style={styles.verseContent}>
            <SkeletonView width={20} height={16} style={styles.verseNumberSkeleton} />
            <View style={styles.verseTextContainer}>
              <SkeletonView width={getRandomWidth()} height={16} style={styles.verseLineSkeleton} />
              {/* Randomly add second line for some verses */}
              {Math.random() > 0.6 && (
                <SkeletonView width={getRandomWidth()} height={16} />
              )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  titleSkeleton: {
    marginBottom: 24,
  },
  verseContainer: {
    marginBottom: 12,
  },
  verseContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  verseNumberSkeleton: {
    marginRight: 8,
    marginTop: 2,
  },
  verseTextContainer: {
    flex: 1,
  },
  verseLineSkeleton: {
    marginBottom: 4,
  },
});

export default BibleVerseSkeleton;


