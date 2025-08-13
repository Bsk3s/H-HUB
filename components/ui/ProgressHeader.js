import React from 'react';
import { View, StyleSheet } from 'react-native';
import BackButton from './BackButton';

export const STEP_COLORS = {
  1: '#FF0080', // Neon pink
  2: '#7928CA', // Electric purple
  3: '#0070F3', // Bright blue
  4: '#00DFD8', // Turquoise
  5: '#FF4D4D', // Coral red
  6: '#F7B955', // Golden yellow
  7: '#50E3C2', // Mint
  8: '#FF0080', // Back to pink
  9: '#7928CA', // Electric purple
  10: '#0070F3', // Bright blue
  11: '#00DFD8', // Turquoise (final step)
};

// Total steps in our flow:
// 1. denomination
// 2. age
// 3. bible-version
// 4. Spiritual-journey
// 5. Faith-challenges
// 6. growth
// 7. prayer-habits
// 8. satisfaction
// 9. shift
// 10. final
// 11. sign-up

const ProgressHeader = ({ currentStep, totalSteps = 11, onBack }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <BackButton onPress={onBack} />
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { 
                width: `${(currentStep / totalSteps) * 100}%`,
                backgroundColor: STEP_COLORS[currentStep]
              }
            ]}
          />
        </View>
        <View style={styles.spacer} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBarContainer: {
    flex: 1,
    marginHorizontal: 8,
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  spacer: {
    width: 16,
  },
});

export default ProgressHeader;
