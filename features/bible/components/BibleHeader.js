import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BibleHeader = ({
  currentBook,
  currentChapter,
  currentVersion,
  onBookPress,
  onVersionPress,
  onSearchPress,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftSection}>
        <TouchableOpacity
          onPress={onBookPress}
          style={styles.bookButton}
        >
          <Text style={styles.bookText}>
            {currentBook} {currentChapter}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onVersionPress}
          style={styles.versionButton}
        >
          <Text style={styles.versionText}>
            {currentVersion}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          onPress={onSearchPress}
          style={styles.iconButton}
        >
          <Ionicons
            name="search"
            size={24}
            color="#374151"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 4,
  },
  bookText: {
    color: '#111827',
    fontWeight: '500',
    fontSize: 14,
  },
  versionButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  versionText: {
    color: '#111827',
    fontWeight: '500',
    fontSize: 14,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
});

export default BibleHeader;
