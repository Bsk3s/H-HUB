import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EmptyState from './EmptyState';

/**
 * Empty state for when user has no activities set up
 */
const EmptyActivities = ({ onSetupActivities }) => {
  // Custom illustration for activities
  const ActivityIllustration = () => (
    <View style={styles.illustration}>
      <View style={styles.ringContainer}>
        <View style={[styles.ring, styles.prayerRing]} />
        <View style={[styles.ring, styles.bibleRing]} />
        <View style={[styles.ring, styles.devotionalRing]} />
      </View>
      <View style={styles.sparkles}>
        <Text style={styles.sparkle}>✨</Text>
        <Text style={styles.sparkle}>⭐</Text>
        <Text style={styles.sparkle}>💫</Text>
      </View>
    </View>
  );

  return (
    <EmptyState
      imageComponent={<ActivityIllustration />}
      title="Start Your Spiritual Journey"
      description="Track your daily prayer, Bible reading, and devotion time. Build habits that bring you closer to God."
      buttonText="Set Up Activities"
      onButtonPress={onSetupActivities}
    />
  );
};

const styles = StyleSheet.create({
  illustration: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ringContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  ring: {
    position: 'absolute',
    borderRadius: 50,
    borderWidth: 8,
  },
  prayerRing: {
    width: 100,
    height: 100,
    borderColor: '#FF6B6B',
    opacity: 0.7,
  },
  bibleRing: {
    width: 80,
    height: 80,
    borderColor: '#4ECDC4',
    opacity: 0.7,
  },
  devotionalRing: {
    width: 60,
    height: 60,
    borderColor: '#45B7D1',
    opacity: 0.7,
  },
  sparkles: {
    flexDirection: 'row',
    gap: 16,
  },
  sparkle: {
    fontSize: 20,
    opacity: 0.8,
  },
});

export default EmptyActivities;


