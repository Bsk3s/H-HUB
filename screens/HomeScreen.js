import React, { useState } from 'react';
import { View, ActivityIndicator, SafeAreaView, ScrollView, TouchableOpacity, Text } from 'react-native';
import AppHeader from '../components/AppHeader';
import TopTabBar from '../components/navigation/TopTabBar';

// Import production-ready screens
import BibleScreen from './BibleScreen';
import StudyScreen from './StudyScreen';
import ChatScreen from './ChatScreen';
import { StatusBar } from 'expo-status-bar';
import ErrorBoundary from '../src/components/ErrorBoundary';
import ActivityRingSkeleton from '../src/components/loading/ActivityRingSkeleton';
import EmptyActivities from '../src/components/empty/EmptyActivities';

// Import components
import DailyVerse from '../components/home/DailyVerse';
import DailyProgressRow from '../components/home/DailyProgressRow';
import RealStuffSection from '../components/home/RealStuffSection';
import RealStuffModal from '../components/home/RealStuffModal';
import StoriesSection from '../components/home/StoriesSection';
import ActivityModal from '../features/activities/components/ActivityModal';
import DailyProgressPage from '../features/activities/components/DailyProgressPage';

// Import hooks
import useActivities from '../features/activities/hooks/useActivities';

// Import data
import { realStuffCards, thisCantBeJustMe } from '../data/homeData';

export default function HomeScreen({ navigation }) {
  const [selectedActivityType, setSelectedActivityType] = useState(null);
  const [showDailyProgress, setShowDailyProgress] = useState(false);
  const [selectedRealStuffCard, setSelectedRealStuffCard] = useState(null);
  const [showRealStuffModal, setShowRealStuffModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');

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
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar style="dark" />
        <AppHeader navigation={navigation} />
        <TopTabBar activeTab={activeTab} onTabChange={setActiveTab} />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Daily Verse Skeleton */}
          <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 }}>
            <View style={{ backgroundColor: '#F8F9FA', borderRadius: 12, padding: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ width: 20, height: 20, backgroundColor: '#E5E7EB', borderRadius: 10, marginRight: 8 }} />
                <View style={{ width: 60, height: 16, backgroundColor: '#E5E7EB', borderRadius: 4 }} />
              </View>
              <View style={{ width: '100%', height: 16, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 8 }} />
              <View style={{ width: '85%', height: 16, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 12 }} />
              <View style={{ width: '40%', height: 14, backgroundColor: '#E5E7EB', borderRadius: 4 }} />
            </View>
          </View>

          {/* Activity Rings Skeleton */}
          <ActivityRingSkeleton size={90} count={4} />

          {/* Real Stuff Section Skeleton */}
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <View style={{ width: '50%', height: 20, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', gap: 16 }}>
              {[1, 2].map((index) => (
                <View key={index} style={{ flex: 1, backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16 }}>
                  <View style={{ width: '100%', height: 100, backgroundColor: '#E5E7EB', borderRadius: 8, marginBottom: 12 }} />
                  <View style={{ width: '80%', height: 16, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 8 }} />
                  <View style={{ width: '60%', height: 14, backgroundColor: '#E5E7EB', borderRadius: 4 }} />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }

  // Handle error state
  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>😔</Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', textAlign: 'center', marginBottom: 8 }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 24 }}>
            We couldn't load your activities. Please try again.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }}
            onPress={() => window.location.reload()}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Handle empty activities state
  if (!isLoading && (!activities || activities.length === 0)) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar style="dark" />
        <EmptyActivities
          onSetupActivities={() => {
            console.log('🚀 Setting up activities...');
            // Navigate to activities setup
          }}
        />
      </View>
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
    <ErrorBoundary
      screenName="Home"
      onRetry={() => {
        // Reset any error states and reload activities
        console.log('🔄 Retrying HomeScreen...');
      }}
    >
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar style="dark" />
        <AppHeader navigation={navigation} />
        <TopTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Home Tab - with ScrollView and DailyProgress logic */}
        {activeTab === 'Home' && (
          <>
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
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 0 }}
                showsVerticalScrollIndicator={false}
                alwaysBounceVertical
              >
                {/* Daily Verse */}
                <DailyVerse />

                {/* Daily Progress */}
                <DailyProgressRow
                  activities={activities}
                  onViewAll={() => setShowDailyProgress(true)}
                  onActivitySelect={handleActivitySelect}
                  getCurrentProgress={getCurrentProgress}
                />

                {/* Real Stuff Section */}
                <RealStuffSection
                  cards={realStuffCards}
                  onCardPress={handleRealStuffCardPress}
                />

                {/* Stories Section */}
                <StoriesSection
                  stories={thisCantBeJustMe}
                  navigation={navigation}
                  onStoryPress={(story) => {
                    navigation.navigate('StoryDetail', { storyId: story.id });
                  }}
                />
              </ScrollView>
            )}
          </>
        )}

        {/* Full-screen components */}
        {activeTab === 'Bible' && (
          <BibleScreen navigation={navigation} />
        )}

        {activeTab === 'Study' && (
          <StudyScreen navigation={navigation} />
        )}

        {activeTab === 'Chat' && (
          <ChatScreen navigation={navigation} />
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
          navigation={navigation}
          onShare={() => { }}
          onSave={() => { }}
          onCTA={() => { }}
        />
      </View>
    </ErrorBoundary>
  );
}