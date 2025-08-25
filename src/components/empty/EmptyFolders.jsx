import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EmptyState from './EmptyState';

/**
 * Empty state for when user has no folders
 */
const EmptyFolders = ({ onCreateFolder }) => {
  // Custom illustration for folders
  const FoldersIllustration = () => (
    <View style={styles.illustration}>
      <View style={styles.foldersContainer}>
        <View style={[styles.folder, styles.folder1]}>
          <View style={styles.folderTab} />
          <Text style={styles.folderEmoji}>📖</Text>
        </View>
        <View style={[styles.folder, styles.folder2]}>
          <View style={styles.folderTab} />
          <Text style={styles.folderEmoji}>🙏</Text>
        </View>
        <View style={[styles.folder, styles.folder3]}>
          <View style={styles.folderTab} />
          <Text style={styles.folderEmoji}>✝️</Text>
        </View>
      </View>
      <View style={styles.plusIcon}>
        <Text style={styles.plus}>+</Text>
      </View>
    </View>
  );

  return (
    <EmptyState
      imageComponent={<FoldersIllustration />}
      title="Create Your First Folder"
      description="Organize your notes by topic, book of the Bible, or sermon series. Keep your spiritual thoughts perfectly organized."
      buttonText="Create Folder"
      onButtonPress={onCreateFolder}
    />
  );
};

const styles = StyleSheet.create({
  illustration: {
    alignItems: 'center',
    marginBottom: 24,
  },
  foldersContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    gap: 8,
  },
  folder: {
    position: 'relative',
    width: 60,
    height: 45,
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  folder1: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  folder2: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    transform: [{ translateY: -5 }],
  },
  folder3: {
    backgroundColor: '#FDE2E8',
    borderColor: '#EF4444',
  },
  folderTab: {
    position: 'absolute',
    top: -6,
    left: 8,
    width: 20,
    height: 8,
    backgroundColor: 'inherit',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: 'inherit',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  folderEmoji: {
    fontSize: 18,
  },
  plusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  plus: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    lineHeight: 24,
  },
});

export default EmptyFolders;


