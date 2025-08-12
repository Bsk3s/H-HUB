import React, { useState } from 'react';
import { View, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Import components
import DailyVerse from '../components/home/DailyVerse';
import DailyProgressRow from '../components/home/DailyProgressRow';
import RealStuffSection from '../components/home/RealStuffSection';
import RealStuffModal from '../components/home/RealStuffModal';
import StoriesSection from '../components/home/StoriesSection';
import ActivityModal from '../features/activities/components/ActivityModal';
import DailyProgressPage from '../features/activities/components/DailyProgressPage';

// Import hooks
import useActivities from '../src/hooks/useActivities';

// Import data
import { realStuffCards, thisCantBeJustMe } from '../data/homeData';

export default function HomeScreen({ navigation }) {
  const [selectedActivityType, setSelectedActivityType] = useState(null);
  const [showDailyProgress, setShowDailyProgress] = useState(false);
  const [selectedRealStuffCard, setSelectedRealStuffCard] = useState(null);
  const [showRealStuffModal, setShowRealStuffModal] = useState(false);
  
  const { 
    activities, 
    isLoading,
    error,
    setLiveDraft,
    commitLiveDraft,
    getCurrentProgress,
    activityLogs
  } = useActivities();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#60A5FA" />
        </View>
      </SafeAreaView>
    )
  }

  const handleActivitySelect = (activity) => {
    setSelectedActivityType(activity.type);
  };

  const handleRealStuffCardPress = (card) => {
    setSelectedRealStuffCard(card);
    setShowRealStuffModal(true);
  };

  const handleCloseRealStuffModal = () => {
    setShowRealStuffModal(false);
    setSelectedRealStuffCard(null);
  };

  const selectedActivity = selectedActivityType 
    ? activities.find(a => a.type === selectedActivityType)
    : null;
  
  const handleCloseModal = () => {
    if (selectedActivity) {
      commitLiveDraft(selectedActivity.id);
    }
    setSelectedActivityType(null);
  };

  const renderHomeContent = () => (
    <>
      {/* Daily Verse */}
      <View style={{ marginTop: 24 }}>
        <DailyVerse />
      </View>

      {/* Daily Progress */}
      <View style={{ marginTop: 32 }}>
        <DailyProgressRow 
          activities={activities}
          onActivitySelect={handleActivitySelect}
          onViewAll={() => setShowDailyProgress(true)}
          getCurrentProgress={getCurrentProgress}
        />
      </View>

      {/* The Real Stuff */}
      <View style={{ marginTop: 32 }}>
        <RealStuffSection 
          cards={realStuffCards} 
          onCardPress={handleRealStuffCardPress}
        />
      </View>

      {/* This Can't Be Just Me */}
      <View style={{ marginTop: 32, marginBottom: 24 }}>
        <StoriesSection
          stories={thisCantBeJustMe}
          navigation={navigation}
          onStoryPress={(story) => {
            navigation.navigate('StoryDetail', { storyId: story.id });
          }}
        />
      </View>
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar style="dark" />
      {showDailyProgress ? (
        <DailyProgressPage
          activities={activities}
          activityLogs={activityLogs}
          onBack={() => setShowDailyProgress(false)}
          onActivitySelect={handleActivitySelect}
          getCurrentProgress={getCurrentProgress}
        />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical
        >
          {renderHomeContent()}
        </ScrollView>
      )}

      {/* Activity Modal */}
      {selectedActivity && (
        <ActivityModal
          activity={selectedActivity}
          onClose={handleCloseModal}
          onSetLiveDraft={setLiveDraft}
        />
      )}

      {/* Real Stuff Modal */}
      <RealStuffModal
        card={selectedRealStuffCard}
        isVisible={showRealStuffModal}
        onClose={handleCloseRealStuffModal}
        onShare={() => {}}
        onSave={() => {}}
        onCTA={() => {}}
      />
    </SafeAreaView>
  );
}