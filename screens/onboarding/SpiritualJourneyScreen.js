import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
// Navigation will be passed as props from stack navigator
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '../../components/ui/Button';
import ProgressHeader, { STEP_COLORS } from '../../components/ui/ProgressHeader';

export default function SpiritualJourneyScreen({ navigation }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);

  // Define faith relationship options
  const options = [
    {
      id: 1,
      emoji: '🌱',
      description: "I'm exploring faith and looking for guidance",
    },
    {
      id: 2,
      emoji: '🔍',
      description: 'I believe in God but struggle to stay consistent',
    },
    {
      id: 3,
      emoji: '🙏',
      description: "I'm actively growing in my faith but want deeper understanding",
    },
    {
      id: 4,
      emoji: '🌟',
      description: 'I have a strong faith and want to stay spiritually sharp',
    },
  ];

  // Navigation handlers
  const handleBack = () => {
    navigation.goBack();
  };

  const handleContinue = async () => {
    if (selectedOption && !loading) {
      setLoading(true);
      try {
        // Save to AsyncStorage for accumulation across screens
        await AsyncStorage.setItem('selectedSpiritualJourney', JSON.stringify(selectedOption));
        
        navigation.navigate('FaithChallengesScreen');
      } catch (error) {
        console.error('Error saving spiritual journey:', error);
        // Continue anyway - data will be saved at sign-up
        navigation.navigate('FaithChallengesScreen');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Progress bar and back button */}
        <View style={styles.headerContainer}>
          <ProgressHeader 
            currentStep={4} 
            totalSteps={11} 
            onBack={handleBack}
          />
        </View>

        {/* Title Section */}
        <Text style={styles.title}>
          How would you describe your current relationship with God?
        </Text>
        <Text style={styles.subtitle}>
          Select one option
        </Text>

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                {
                  backgroundColor: selectedOption?.id === option.id ? STEP_COLORS[4] : 'white',
                  borderColor: selectedOption?.id === option.id ? STEP_COLORS[4] : '#d1d5db',
                }
              ]}
              onPress={() => setSelectedOption(option)}
            >
              <Text style={styles.emoji}>{option.emoji}</Text>
              <Text
                style={[
                  styles.optionText,
                  {
                    color: selectedOption?.id === option.id ? 'white' : '#374151'
                  }
                ]}
              >
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleContinue}
            title={loading ? "Saving..." : "Continue"}
            disabled={!selectedOption || loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 32,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 24,
  },
});
