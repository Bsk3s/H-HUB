import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonView from './SkeletonView';

/**
 * Skeleton loading state for folder list items
 */
const FolderItemSkeleton = ({ count = 3 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.folderItem}>
          <View style={styles.folderContent}>
            <View style={styles.folderHeader}>
              <SkeletonView width={24} height={24} borderRadius={4} style={styles.iconSkeleton} />
              <SkeletonView width="60%" height={18} style={styles.nameSkeleton} />
            </View>
            <SkeletonView width="30%" height={14} style={styles.countSkeleton} />
          </View>
          <SkeletonView width={16} height={16} borderRadius={8} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  folderContent: {
    flex: 1,
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconSkeleton: {
    marginRight: 12,
  },
  nameSkeleton: {
    marginBottom: 0,
  },
  countSkeleton: {
    marginBottom: 0,
  },
});

export default FolderItemSkeleton;


