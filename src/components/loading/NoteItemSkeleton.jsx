import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonView from './SkeletonView';

/**
 * Skeleton loading state for note list items
 */
const NoteItemSkeleton = ({ count = 5 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.noteItem}>
          <View style={styles.noteHeader}>
            <SkeletonView width="70%" height={18} style={styles.titleSkeleton} />
            <SkeletonView width={16} height={16} borderRadius={8} />
          </View>
          <SkeletonView width="40%" height={14} style={styles.dateSkeleton} />
          <SkeletonView width="90%" height={14} style={styles.previewSkeleton} />
          <SkeletonView width="60%" height={14} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  noteItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleSkeleton: {
    marginBottom: 0,
  },
  dateSkeleton: {
    marginBottom: 8,
  },
  previewSkeleton: {
    marginBottom: 4,
  },
});

export default NoteItemSkeleton;


