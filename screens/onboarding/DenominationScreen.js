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

export default function DenominationScreen({ navigation }) {
  const [selectedDenomination, setSelectedDenomination] = useState(null);
  const [loading, setLoading] = useState(false);

  const denominations = [
    { id: 1, label: 'Non - Denominational' },
    { id: 2, label: 'Catholic' },
    { id: 3, label: 'Protestant' },
    { id: 4, label: 'Baptist' },
    { id: 5, label: 'Methodist' },
    { id: 6, label: 'Pentecostal' },
    { id: 7, label: 'Lutheran' },
    { id: 8, label: 'Evangelical' },
    { id: 9, label: 'Orthodox' },
    { id: 10, label: 'Other' },
  ];

  const handleDenominationSelect = (denomination) => {
    setSelectedDenomination(denomination);
  };

  const handleContinue = async () => {
    if (selectedDenomination && !loading) {
      setLoading(true);
      try {
        // Save to AsyncStorage for accumulation across screens
        await AsyncStorage.setItem('selectedDenomination', JSON.stringify(selectedDenomination));
        
        console.log('🚀 Navigating to AgeScreen from DenominationScreen');
        console.log('Navigation object:', navigation);
        navigation.navigate('AgeScreen');
      } catch (error) {
        console.error('Error saving denomination:', error);
        // Continue anyway - data will be saved at sign-up
        navigation.navigate('AgeScreen');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <ProgressHeader 
            currentStep={1} 
            totalSteps={11}
            onBack={handleBack}
          />
        </View>

        <Text style={styles.title}>
          What is your religious background?
        </Text>
        <Text style={styles.subtitle}>
          This could be multiple options, whichever is closest to what you identify with
        </Text>

        <View style={styles.optionsContainer}>
          {denominations.map((denomination) => (
            <TouchableOpacity
              key={denomination.id}
              style={[
                styles.option,
                {
                  backgroundColor: selectedDenomination?.id === denomination.id ? STEP_COLORS[1] : 'white',
                  borderColor: selectedDenomination?.id === denomination.id ? STEP_COLORS[1] : '#d1d5db',
                }
              ]}
              onPress={() => handleDenominationSelect(denomination)}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: selectedDenomination?.id === denomination.id ? 'white' : '#374151'
                  }
                ]}
              >
                {denomination.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleContinue}
            title={loading ? "Saving..." : "Continue"}
            disabled={!selectedDenomination || loading}
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
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 24,
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
