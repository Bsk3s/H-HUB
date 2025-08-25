import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EmptyState from './EmptyState';

/**
 * Empty state for Bible screen when no content is loaded
 */
const EmptyBible = ({ onSelectVersion }) => {
  // Custom illustration for Bible
  const BibleIllustration = () => (
    <View style={styles.illustration}>
      <View style={styles.bible}>
        <View style={styles.bibleSpine} />
        <View style={styles.bibleCover}>
          <Text style={styles.bibleTitle}>Holy Bible</Text>
          <View style={styles.cross}>
            <View style={styles.crossVertical} />
            <View style={styles.crossHorizontal} />
          </View>
        </View>
        <View style={styles.biblePages} />
      </View>
      <View style={styles.bookmark}>
        <View style={styles.bookmarkRibbon} />
      </View>
    </View>
  );

  return (
    <EmptyState
      imageComponent={<BibleIllustration />}
      title="Choose Your Bible Version"
      description="Select from multiple translations and start reading God's Word. Your reading progress will be saved automatically."
      buttonText="Select Version"
      onButtonPress={onSelectVersion}
    />
  );
};

const styles = StyleSheet.create({
  illustration: {
    alignItems: 'center',
    marginBottom: 24,
  },
  bible: {
    position: 'relative',
    width: 100,
    height: 120,
    marginBottom: 16,
  },
  bibleSpine: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 8,
    height: 120,
    backgroundColor: '#8B4513',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  bibleCover: {
    position: 'absolute',
    left: 8,
    top: 0,
    width: 92,
    height: 120,
    backgroundColor: '#2D1B1B',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  bibleTitle: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  cross: {
    position: 'relative',
    width: 20,
    height: 20,
  },
  crossVertical: {
    position: 'absolute',
    left: 9,
    top: 0,
    width: 2,
    height: 20,
    backgroundColor: '#FFD700',
  },
  crossHorizontal: {
    position: 'absolute',
    left: 3,
    top: 6,
    width: 14,
    height: 2,
    backgroundColor: '#FFD700',
  },
  biblePages: {
    position: 'absolute',
    right: 2,
    top: 2,
    width: 88,
    height: 116,
    backgroundColor: '#FFFEF7',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  bookmark: {
    position: 'absolute',
    right: 5,
    top: -5,
  },
  bookmarkRibbon: {
    width: 8,
    height: 40,
    backgroundColor: '#DC2626',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});

export default EmptyBible;


