import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
// Navigation will be passed as props from stack navigator
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '../../components/ui/Button';
import ProgressHeader, { STEP_COLORS } from '../../components/ui/ProgressHeader';

export default function AgeScreen({ navigation }) {
  const [selectedAge, setSelectedAge] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Define age group options
  const ageGroups = [
    { id: 1, label: '13-17' },
    { id: 2, label: '18-24' },
    { id: 3, label: '25-34' },
    { id: 4, label: '35-44' },
    { id: 5, label: '45-54' },
    { id: 6, label: '55+' }
  ];

  // Navigation handlers
  const handleBack = () => {
    navigation.goBack();
  };

  const handleContinue = async () => {
    if (selectedAge && !loading) {
      setLoading(true);
      try {
        // Save to AsyncStorage for accumulation across screens
        await AsyncStorage.setItem('selectedAgeGroup', JSON.stringify(selectedAge));
        
        navigation.navigate('BibleVersionScreen');
      } catch (error) {
        console.error('Error saving age group:', error);
        // Continue anyway - data will be saved at sign-up
        navigation.navigate('BibleVersionScreen');
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
            currentStep={2} 
            totalSteps={11} 
            onBack={handleBack}
          />
        </View>

        {/* Screen title */}
        <Text style={styles.title}>
          What is your age group?
        </Text>

        {/* Age selection buttons */}
        <View style={styles.optionsContainer}>
          {ageGroups.map((age) => (
            <TouchableOpacity
              key={age.id}
              style={[
                styles.option,
                {
                  backgroundColor: selectedAge?.id === age.id ? STEP_COLORS[2] : 'white',
                  borderColor: selectedAge?.id === age.id ? STEP_COLORS[2] : '#d1d5db',
                }
              ]}
              onPress={() => setSelectedAge(age)}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: selectedAge?.id === age.id ? 'white' : '#374151'
                  }
                ]}
              >
                {age.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue button - centered at bottom */}
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleContinue}
            title={loading ? "Saving..." : "Continue"}
            disabled={!selectedAge || loading}
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
    color: '#111827',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 24,
  },
});
