import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';
// Navigation will be passed as props from stack navigator
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '../../components/ui/Button';
import ProgressHeader, { STEP_COLORS } from '../../components/ui/ProgressHeader';

export default function BibleVersionScreen({ navigation }) {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [loading, setLoading] = useState(false);

  const bibleVersions = [
    { id: 1, name: 'New International Version (NIV)' },
    { id: 2, name: 'New King James (NKJV)' },
    { id: 3, name: 'Revised Standard Version Catholic (RSVC)' },
    { id: 4, name: 'Amplified (AMP)' },
    { id: 5, name: 'New American Standard Bible' },
    { id: 6, name: 'La Parola è Vita' },
    { id: 7, name: 'Nueva Version Internacional' },
    { id: 8, name: 'La Bible du Semeur' },
    { id: 9, name: 'Noua Traducere Românească' },
    { id: 10, name: 'Ang Salita ng Dios (Tagalog Contemporary Bible)' },
    { id: 11, name: 'Het Boek' },
    { id: 12, name: 'King James Version (KJV)' },
    { id: 13, name: 'World Messianic Bible' },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContinue = async () => {
    if (selectedVersion && !loading) {
      setLoading(true);
      try {
        // Save to AsyncStorage for accumulation across screens
        await AsyncStorage.setItem('selectedBibleVersion', JSON.stringify(selectedVersion));
        
        navigation.navigate('SpiritualJourneyScreen');
      } catch (error) {
        console.error('Error saving Bible version:', error);
        // Continue anyway - data will be saved at sign-up
        navigation.navigate('SpiritualJourneyScreen');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <ProgressHeader 
            currentStep={3} 
            totalSteps={11} 
            onBack={handleBack}
          />
        </View>

        <Text style={styles.title}>
          What is your preferred Bible version?
        </Text>
        <Text style={styles.subtitle}>
          Select one option
        </Text>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.versionsContainer}>
            {bibleVersions.map((version) => (
              <View key={version.id} style={styles.versionWrapper}>
                <TouchableOpacity
                  style={[
                    styles.versionOption,
                    {
                      backgroundColor: selectedVersion?.id === version.id ? STEP_COLORS[3] : 'white',
                      borderColor: selectedVersion?.id === version.id ? STEP_COLORS[3] : '#d1d5db',
                    }
                  ]}
                  onPress={() => setSelectedVersion(version)}
                >
                  <Text
                    style={[
                      styles.versionText,
                      {
                        color: selectedVersion?.id === version.id ? 'white' : '#374151'
                      }
                    ]}
                  >
                    {version.name}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleContinue}
            title={loading ? "Saving..." : "Continue"}
            disabled={!selectedVersion || loading}
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
    marginBottom: 32,
  },
  scrollView: {
    flex: 1,
  },
  versionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -4,
  },
  versionWrapper: {
    padding: 4,
  },
  versionOption: {
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
});
