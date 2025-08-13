import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { Svg, Path } from 'react-native-svg';

import Button from '../../components/ui/Button';
import ProgressHeader, { STEP_COLORS } from '../../components/ui/ProgressHeader';
import { useAuth } from '../../src/auth/context';

// 5. Faith Challenges Screen - Multi-select with max 2 selections
function FaithChallengesScreen({ navigation }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const MAX_SELECTIONS = 2;

  const challenges = [
    { id: 1, emoji: '⏳', description: 'Finding time to read the Bible consistently' },
    { id: 2, emoji: '😕', description: 'Understanding scripture in a way that applies to my life' },
    { id: 3, emoji: '🏡', description: 'Lacking a supportive faith-based community' },
    { id: 4, emoji: '💭', description: 'Feeling distant from God or struggling to hear His voice' },
    { id: 5, emoji: '📖', description: 'Not knowing where to start when studying the Bible' },
  ];

  const handleSelect = (challenge) => {
    setSelectedOptions((prev) => {
      const isSelected = prev.some(item => item.id === challenge.id);
      
      if (isSelected) {
        return prev.filter(item => item.id !== challenge.id);
      }
      
      if (prev.length >= MAX_SELECTIONS) {
        return prev; // Don't add if at max
      }
      
      return [...prev, challenge];
    });
  };

  const isOptionSelected = (challengeId) => {
    return selectedOptions.some(item => item.id === challengeId);
  };

  const handleContinue = async () => {
    if (selectedOptions.length > 0 && !loading) {
      setLoading(true);
      try {
        await AsyncStorage.setItem('selectedFaithChallenges', JSON.stringify(selectedOptions));
        navigation.navigate('GrowthScreen');
      } catch (error) {
        console.error('Error saving faith challenges:', error);
        navigation.navigate('GrowthScreen');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ProgressHeader currentStep={5} totalSteps={11} onBack={() => navigation.goBack()} />
        
        <Text style={styles.title}>
          What challenges do you face in deepening your faith?
        </Text>
        <Text style={styles.subtitle}>
          Select up to 2 options
        </Text>

        <View style={styles.selectionCounter}>
          <Text style={styles.counterText}>
            {selectedOptions.length} of {MAX_SELECTIONS} selected
          </Text>
        </View>

        <View style={styles.challengesContainer}>
          {challenges.map((challenge) => (
            <TouchableOpacity
              key={challenge.id}
              style={[
                styles.challengeOption,
                {
                  backgroundColor: isOptionSelected(challenge.id) ? STEP_COLORS[5] : 'white',
                  borderColor: isOptionSelected(challenge.id) ? STEP_COLORS[5] : '#d1d5db',
                }
              ]}
              onPress={() => handleSelect(challenge)}
            >
              <Text style={styles.emoji}>{challenge.emoji}</Text>
              <Text style={[
                styles.challengeText,
                { color: isOptionSelected(challenge.id) ? 'white' : '#374151' }
              ]}>
                {challenge.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleContinue}
            title={loading ? "Saving..." : "Continue"}
            disabled={selectedOptions.length === 0 || loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// 6. Growth Screen - Sliders from 1-10
function GrowthScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    prayer: 5,
    scripture: 5,
    guidance: 5,
    connection: 5,
  });

  const aspects = [
    { id: 'prayer', title: 'More consistency in prayer?', value: values.prayer },
    { id: 'scripture', title: 'More understanding of scripture?', value: values.scripture },
    { id: 'guidance', title: 'More guidance in applying faith to life?', value: values.guidance },
    { id: 'connection', title: 'Stronger spiritual connection with God?', value: values.connection },
  ];

  const handleSliderChange = (value, id) => {
    setValues(prev => ({ ...prev, [id]: value }));
  };

  const handleContinue = async () => {
    if (!loading) {
      setLoading(true);
      try {
        await AsyncStorage.setItem('selectedGrowthPriorities', JSON.stringify(values));
        navigation.navigate('PrayerHabitsScreen');
      } catch (error) {
        console.error('Error saving growth priorities:', error);
        navigation.navigate('PrayerHabitsScreen');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ProgressHeader currentStep={6} totalSteps={11} onBack={() => navigation.goBack()} />
        
        <Text style={styles.title}>
          If you could have the perfect faith journey, what would it look like?
        </Text>
        <Text style={styles.subtitle}>
          Rate each aspect from 1-10 based on how important it is to you
        </Text>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.slidersContainer}>
            {aspects.map((aspect) => (
              <View key={aspect.id} style={styles.sliderGroup}>
                <Text style={styles.sliderTitle}>{aspect.title}</Text>
                <View style={styles.sliderRow}>
                  <View style={styles.sliderWrapper}>
                    <Slider
                      style={styles.slider}
                      minimumValue={1}
                      maximumValue={10}
                      step={1}
                      value={aspect.value}
                      onValueChange={(value) => handleSliderChange(value, aspect.id)}
                      minimumTrackTintColor={STEP_COLORS[6]}
                      maximumTrackTintColor="#E5E7EB"
                      thumbTintColor={STEP_COLORS[6]}
                    />
                    <View style={styles.sliderLabels}>
                      <Text style={styles.sliderLabel}>1</Text>
                      <Text style={styles.sliderLabel}>10</Text>
                    </View>
                  </View>
                  <View style={styles.valueDisplay}>
                    <Text style={styles.valueText}>{aspect.value}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleContinue}
            title={loading ? "Saving..." : "Continue"}
            disabled={loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// 7. Prayer Habits Screen - Single select
function PrayerHabitsScreen({ navigation }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);

  const options = [
    { id: 1, emoji: '📖', description: 'Reading the Bible daily but struggling with consistency' },
    { id: 2, emoji: '🎧', description: 'Listening to sermons, devotionals, or podcasts' },
    { id: 3, emoji: '✍️', description: 'Journaling prayers and reflections' },
    { id: 4, emoji: '💬', description: 'Seeking mentorship from a pastor or Christian mentor' },
    { id: 5, emoji: '🛑', description: "I haven't found anything that works consistently for me" },
  ];

  const handleContinue = async () => {
    if (selectedOption && !loading) {
      setLoading(true);
      try {
        await AsyncStorage.setItem('selectedPrayerHabits', JSON.stringify(selectedOption));
        navigation.navigate('SatisfactionScreen');
      } catch (error) {
        console.error('Error saving prayer habits:', error);
        navigation.navigate('SatisfactionScreen');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ProgressHeader currentStep={7} totalSteps={11} onBack={() => navigation.goBack()} />
        
        <Text style={styles.title}>
          What have you tried in the past to grow spiritually?
        </Text>
        <Text style={styles.subtitle}>
          Select one option that best describes your experience
        </Text>

        <View style={styles.journeyOptionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.journeyOption,
                {
                  backgroundColor: selectedOption?.id === option.id ? STEP_COLORS[7] : 'white',
                  borderColor: selectedOption?.id === option.id ? STEP_COLORS[7] : '#d1d5db',
                }
              ]}
              onPress={() => setSelectedOption(option)}
            >
              <Text style={styles.emoji}>{option.emoji}</Text>
              <Text style={[
                styles.journeyText,
                { color: selectedOption?.id === option.id ? 'white' : '#374151' }
              ]}>
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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

// 8. Satisfaction Screen - Yes/No
function SatisfactionScreen({ navigation }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);

  const options = [
    { id: 'yes', emoji: '✅', description: "Yes, but I'd like to go deeper in my faith" },
    { id: 'no', emoji: '❌', description: 'No, I often feel stuck and unsure where to start' },
  ];

  const handleContinue = async () => {
    if (selectedOption && !loading) {
      setLoading(true);
      try {
        await AsyncStorage.setItem('selectedSatisfactionLevel', JSON.stringify(selectedOption));
        navigation.navigate('ShiftScreen');
      } catch (error) {
        console.error('Error saving satisfaction level:', error);
        navigation.navigate('ShiftScreen');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ProgressHeader currentStep={8} totalSteps={11} onBack={() => navigation.goBack()} />
        
        <Text style={styles.title}>
          Are you satisfied with your current spiritual life?
        </Text>
        <Text style={styles.subtitle}>
          Select one option
        </Text>

        <View style={styles.journeyOptionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.journeyOption,
                {
                  backgroundColor: selectedOption?.id === option.id ? STEP_COLORS[8] : 'white',
                  borderColor: selectedOption?.id === option.id ? STEP_COLORS[8] : '#d1d5db',
                }
              ]}
              onPress={() => setSelectedOption(option)}
            >
              <Text style={styles.emoji}>{option.emoji}</Text>
              <Text style={[
                styles.journeyText,
                { color: selectedOption?.id === option.id ? 'white' : '#374151' }
              ]}>
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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

// 9. Shift Screen - Yes/No for structured growth
function ShiftScreen({ navigation }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);

  const options = [
    { id: 'yes', emoji: '✅', description: 'Yes, I want a structured way to grow spiritually' },
    { id: 'no', emoji: '🛑', description: 'No, I prefer to figure it out on my own' },
  ];

  const handleContinue = async () => {
    if (selectedOption && !loading) {
      setLoading(true);
      try {
        await AsyncStorage.setItem('selectedWantsStructure', JSON.stringify(selectedOption));
        navigation.navigate('FinalScreen');
      } catch (error) {
        console.error('Error saving wants structure:', error);
        navigation.navigate('FinalScreen');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ProgressHeader currentStep={9} totalSteps={11} onBack={() => navigation.goBack()} />
        
        <Text style={styles.title}>
          Are you ready for a structured spiritual growth plan?
        </Text>
        <Text style={styles.subtitle}>
          Select one option
        </Text>

        <View style={styles.journeyOptionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.journeyOption,
                {
                  backgroundColor: selectedOption?.id === option.id ? STEP_COLORS[9] : 'white',
                  borderColor: selectedOption?.id === option.id ? STEP_COLORS[9] : '#d1d5db',
                }
              ]}
              onPress={() => setSelectedOption(option)}
            >
              <Text style={styles.emoji}>{option.emoji}</Text>
              <Text style={[
                styles.journeyText,
                { color: selectedOption?.id === option.id ? 'white' : '#374151' }
              ]}>
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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

// 10. Final Screen - Name and Age input
function FinalScreen({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = name.trim().length > 0 && age.trim().length > 0;

  const handleComplete = async () => {
    if (isValid && !loading) {
      setLoading(true);
      try {
        // Save name and age to AsyncStorage
        await AsyncStorage.setItem('userName', name);
        await AsyncStorage.setItem('userAge', age);
        
        navigation.navigate('SignUpScreen');
      } catch (error) {
        console.error('Error saving final data:', error);
        navigation.navigate('SignUpScreen');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.keyboardView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.finalContent}>
          {/* Progress bar and back button */}
          <View style={styles.finalProgressContainer}>
            <ProgressHeader 
              currentStep={10} 
              totalSteps={11} 
              onBack={() => navigation.goBack()}
            />
          </View>

          {/* Title Section */}
          <Text style={styles.finalTitle}>
            Finally
          </Text>
          <Text style={styles.finalSubtitle}>
            A little more about you
          </Text>

          {/* Input Fields */}
          <View style={styles.finalInputsContainer}>
            <View style={styles.finalInputWrapper}>
              <TextInput
                style={styles.finalTextInput}
                placeholder="Name"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.finalInputWrapper}>
              <TextInput
                style={styles.finalTextInput}
                placeholder="Age"
                placeholderTextColor="#666"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
          </View>

          {/* Complete Button */}
          <View style={styles.finalButtonContainer}>
            <Button
              onPress={handleComplete}
              title={loading ? "Saving..." : "Next"}
              disabled={!isValid || loading}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Apple and Google Icons
const AppleIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M16.3,12.3c0-2.3,1.9-3.4,2-3.4c-1.1-1.6-2.8-1.8-3.4-1.8c-1.4-0.1-2.8,0.8-3.5,0.8 c-0.7,0-1.8-0.8-3-0.8c-1.5,0-2.9,0.9-3.7,2.3c-1.6,2.8-0.4,6.8,1.1,9c0.8,1.1,1.7,2.3,2.9,2.3c1.2,0,1.6-0.8,3-0.8 c1.4,0,1.8,0.8,3,0.8c1.2,0,2-1.1,2.8-2.2c0.9-1.3,1.2-2.5,1.2-2.6C18.7,16,16.3,15.3,16.3,12.3z M14.2,6.9 c0.6-0.8,1.1-1.9,0.9-3c-0.9,0-2,0.6-2.6,1.4c-0.6,0.7-1.1,1.8-0.9,2.9C12.6,8.3,13.6,7.7,14.2,6.9z" fill="black"/>
  </Svg>
);

const GoogleIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" fill="#4285F4"/>
    <Path d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 20.29 7.565 24 12.255 24z" fill="#34A853"/>
    <Path d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z" fill="#FBBC05"/>
    <Path d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" fill="#EA4335"/>
  </Svg>
);

// 11. Sign Up Screen - Email/Password form
function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, signInWithGoogle, signInWithApple, loading } = useAuth();
  const [localError, setLocalError] = useState('');

  const handleAppleSignUp = async () => {
    setLocalError('');
    try {
      console.log('🍎 Apple Sign Up pressed');
      const success = await signInWithApple();
      if (success) {
        console.log('✅ Apple Sign Up successful');
        navigation.popToTop(); // Complete onboarding flow
      }
    } catch (error) {
      console.error('Apple sign up error:', error);
      setLocalError(error.message || 'Failed to sign up with Apple');
    }
  };

  const handleGoogleSignUp = async () => {
    setLocalError('');
    try {
      console.log('🌟 Google Sign Up pressed');
      const success = await signInWithGoogle();
      if (success) {
        console.log('✅ Google Sign Up successful');
        navigation.popToTop(); // Complete onboarding flow
      }
    } catch (error) {
      console.error('Google sign up error:', error);
      setLocalError(error.message || 'Failed to sign up with Google');
    }
  };

  const handleEmailSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    setLocalError('');
    try {
      console.log('📧 Email Sign Up with:', email);
      const success = await register(email, password);
      if (success) {
        console.log('✅ Email Sign Up successful');
        navigation.popToTop(); // Complete onboarding flow
      }
    } catch (error) {
      console.error('Email sign up error:', error);
      setLocalError(error.message || 'Failed to create account');
    }
  };

  const isValid = email.length > 0 && password.length > 0 && confirmPassword.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.keyboardView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.signUpContent}>
          <View style={styles.signUpProgressContainer}>
            <ProgressHeader 
              currentStep={11} 
              totalSteps={11} 
              onBack={() => navigation.goBack()}
            />
          </View>

          <Text style={styles.signUpTitle}>Create your account</Text>
          <Text style={styles.signUpSubtitle}>
            This will let you save your progress.
          </Text>

          <View style={styles.signUpInputsContainer}>
            <View style={styles.signUpInputWrapper}>
              <TextInput
                style={styles.signUpTextInput}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.signUpInputWrapper}>
              <TextInput
                style={styles.signUpTextInput}
                placeholder="Password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.signUpInputWrapper}>
              <TextInput
                style={styles.signUpTextInput}
                placeholder="Confirm Password"
                placeholderTextColor="#666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </View>
          
          <View style={styles.signUpButtonContainer}>
            <Button
              onPress={handleEmailSignUp}
              title="Create Account"
              disabled={!isValid || loading}
            />
          </View>
          
          <View style={styles.signUpDivider}>
            <View style={styles.signUpDividerLine} />
            <Text style={styles.signUpDividerText}>or</Text>
            <View style={styles.signUpDividerLine} />
          </View>
          
          <View style={styles.signUpSocialContainer}>
            <TouchableOpacity
              onPress={handleGoogleSignUp}
              disabled={loading}
              style={styles.signUpSocialButton}
            >
              <GoogleIcon />
              <Text style={styles.signUpSocialButtonText}>Sign up with Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAppleSignUp}
              disabled={loading}
              style={styles.signUpSocialButton}
            >
              <AppleIcon />
              <Text style={styles.signUpSocialButtonText}>Sign up with Apple</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 4. Spiritual Journey Screen
function SpiritualJourneyScreen({ navigation }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleContinue = async () => {
    if (selectedOption && !loading) {
      setLoading(true);
      try {
        await AsyncStorage.setItem('selectedSpiritualJourney', JSON.stringify(selectedOption));
        navigation.navigate('FaithChallengesScreen');
      } catch (error) {
        console.error('Error saving spiritual journey:', error);
        navigation.navigate('FaithChallengesScreen');
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
            currentStep={4} 
            totalSteps={11}
            onBack={handleBack}
          />
        </View>

        <Text style={styles.title}>
          How would you describe your current relationship with God?
        </Text>
        <Text style={styles.subtitle}>
          Select one option
        </Text>

        <View style={styles.journeyOptionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.journeyOption,
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
                  styles.journeyText,
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

// Inline BibleVersionScreen
function BibleVersionScreen({ navigation }) {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [loading, setLoading] = useState(false);

  const bibleVersions = [
    { id: 1, name: 'New International Version (NIV)' },
    { id: 2, name: 'New King James (NKJV)' },
    { id: 3, name: 'Revised Standard Version Catholic (RSVC)' },
    { id: 4, name: 'Amplified (AMP)' },
    { id: 5, name: 'New American Standard Bible' },
    { id: 6, name: 'King James Version (KJV)' },
    { id: 7, name: 'World Messianic Bible' },
  ];

  const handleContinue = async () => {
    if (selectedVersion && !loading) {
      setLoading(true);
      try {
        await AsyncStorage.setItem('selectedBibleVersion', JSON.stringify(selectedVersion));
        // Navigate to next screen
        navigation.navigate('SpiritualJourneyScreen');
      } catch (error) {
        console.error('Error saving Bible version:', error);
        navigation.popToTop();
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

        <View style={styles.versionsContainer}>
          {bibleVersions.map((version) => (
            <TouchableOpacity
              key={version.id}
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
          ))}
        </View>

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

// Inline AgeScreen
function AgeScreen({ navigation }) {
  const [selectedAge, setSelectedAge] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const ageGroups = [
    { id: 1, label: '13-17' },
    { id: 2, label: '18-24' },
    { id: 3, label: '25-34' },
    { id: 4, label: '35-44' },
    { id: 5, label: '45-54' },
    { id: 6, label: '55+' }
  ];

  const handleContinue = async () => {
    if (selectedAge && !loading) {
      setLoading(true);
      try {
        await AsyncStorage.setItem('selectedAgeGroup', JSON.stringify(selectedAge));
        // Navigate to next screen
        navigation.navigate('BibleVersionScreen');
      } catch (error) {
        console.error('Error saving age group:', error);
        navigation.popToTop();
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
            currentStep={2} 
            totalSteps={11}
            onBack={handleBack}
          />
        </View>

        <Text style={styles.title}>
          What is your age group?
        </Text>

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

// Inline DenominationScreen to test
function DenominationScreen({ navigation, parentNavigation }) {
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
        await AsyncStorage.setItem('selectedDenomination', JSON.stringify(selectedDenomination));
        // Navigate to next screen
        navigation.navigate('AgeScreen');
      } catch (error) {
        console.error('Error saving denomination:', error);
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    // First screen should go back to Landing, not within stack
    console.log('🔙 Going back from DenominationScreen to Landing');
    if (parentNavigation) {
      parentNavigation.navigate('Landing');
    } else {
      console.error('❌ parentNavigation not available');
    }
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

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator({ parentNavigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="DenominationScreen"
    >
      <Stack.Screen 
        name="DenominationScreen" 
        component={(props) => <DenominationScreen {...props} parentNavigation={parentNavigation} />}
      />
      <Stack.Screen 
        name="AgeScreen" 
        component={AgeScreen}
      />
      <Stack.Screen 
        name="BibleVersionScreen" 
        component={BibleVersionScreen}
      />
      <Stack.Screen 
        name="SpiritualJourneyScreen" 
        component={SpiritualJourneyScreen}
      />
      <Stack.Screen 
        name="FaithChallengesScreen" 
        component={FaithChallengesScreen}
      />
      <Stack.Screen 
        name="GrowthScreen" 
        component={GrowthScreen}
      />
      <Stack.Screen 
        name="PrayerHabitsScreen" 
        component={PrayerHabitsScreen}
      />
      <Stack.Screen 
        name="SatisfactionScreen" 
        component={SatisfactionScreen}
      />
      <Stack.Screen 
        name="ShiftScreen" 
        component={ShiftScreen}
      />
      <Stack.Screen 
        name="FinalScreen" 
        component={FinalScreen}
      />
      <Stack.Screen 
        name="SignUpScreen" 
        component={SignUpScreen}
      />
    </Stack.Navigator>
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
  versionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },
  versionOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  journeyOptionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  journeyOption: {
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
  journeyText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  selectionCounter: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 24,
  },
  counterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  challengesContainer: {
    gap: 12,
    marginBottom: 32,
  },
  challengeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  challengeText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  slidersContainer: {
    gap: 24,
    paddingBottom: 32,
  },
  sliderGroup: {
    gap: 12,
  },
  sliderTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sliderWrapper: {
    flex: 1,
  },
  slider: {
    height: 40,
    width: '100%',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginTop: -8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  valueDisplay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inputsContainer: {
    gap: 20,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#111827',
  },
  socialButtonsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  // Final Screen specific styles
  finalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  finalProgressContainer: {
    marginBottom: 32,
  },
  finalTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  finalSubtitle: {
    fontSize: 20,
    color: '#6B7280',
    marginBottom: 32,
  },
  finalInputsContainer: {
    gap: 16,
  },
  finalInputWrapper: {
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  finalTextInput: {
    height: 56,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#374151',
  },
  finalButtonContainer: {
    marginTop: 40,
    marginBottom: 24,
    alignItems: 'center',
  },
  // Sign Up Screen specific styles  
  signUpContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  signUpProgressContainer: {
    marginBottom: 32,
  },
  signUpTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  signUpSubtitle: {
    fontSize: 20,
    color: '#6B7280',
    marginBottom: 32,
  },
  signUpInputsContainer: {
    gap: 16,
  },
  signUpInputWrapper: {
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  signUpTextInput: {
    height: 56,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#374151',
  },
  signUpButtonContainer: {
    marginTop: 40,
    marginBottom: 24,
    alignItems: 'center',
  },
  signUpDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  signUpDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  signUpDividerText: {
    marginHorizontal: 16,
    color: '#6B7280',
  },
  signUpSocialContainer: {
    gap: 16,
  },
  signUpSocialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  signUpSocialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 16,
  },
});
