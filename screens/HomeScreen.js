import React, { useState } from 'react';
import { View, ActivityIndicator, SafeAreaView, ScrollView, TouchableOpacity, Text } from 'react-native';
import AppHeader from '../components/AppHeader';
import TopTabBar from '../components/navigation/TopTabBar';

// Import production-ready screens
import BibleScreen from './BibleScreen';
import StudyNavigator from '../components/navigation/StudyNavigator';
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
import { useLiveKitVoiceChat } from '../app/hooks/useLiveKitVoiceChat';

// Import data
import { realStuffCards, thisCantBeJustMe } from '../data/homeData';

// Import services
import { saveJournalEntry } from '../services/journalService';

// Import theme
import { useTheme } from '../src/hooks/useTheme';

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const [selectedActivityType, setSelectedActivityType] = useState(null);
  const [showDailyProgress, setShowDailyProgress] = useState(false);
  const [selectedRealStuffCard, setSelectedRealStuffCard] = useState(null);
  const [showRealStuffModal, setShowRealStuffModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [bibleScriptureRef, setBibleScriptureRef] = useState(null);
  const [studyRefreshKey, setStudyRefreshKey] = useState(0);
  const [journalToView, setJournalToView] = useState(null);

  const {
    activities,
    isLoading,
    error,
    setLiveDraft,
    commitLiveDraft,
    getCurrentProgress,
    activityLogs
  } = useActivities();

  // Global LiveKit Voice Chat - persists across tabs
  const voiceChat = useLiveKitVoiceChat();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style="dark" />
        <AppHeader navigation={navigation} />
        <TopTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          voiceChatActive={voiceChat.isConnected}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Daily Verse Skeleton */}
          <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 }}>
            <View style={{ backgroundColor: colors.backgroundSecondary, borderRadius: 12, padding: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ width: 20, height: 20, backgroundColor: colors.border, borderRadius: 10, marginRight: 8 }} />
                <View style={{ width: 60, height: 16, backgroundColor: colors.border, borderRadius: 4 }} />
              </View>
              <View style={{ width: '100%', height: 16, backgroundColor: colors.border, borderRadius: 4, marginBottom: 8 }} />
              <View style={{ width: '85%', height: 16, backgroundColor: colors.border, borderRadius: 4, marginBottom: 12 }} />
              <View style={{ width: '40%', height: 14, backgroundColor: colors.border, borderRadius: 4 }} />
            </View>
          </View>

          {/* Activity Rings Skeleton */}
          <ActivityRingSkeleton size={90} count={4} />

          {/* Real Stuff Section Skeleton */}
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <View style={{ width: '50%', height: 20, backgroundColor: colors.border, borderRadius: 4, marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', gap: 16 }}>
              {[1, 2].map((index) => (
                <View key={index} style={{ flex: 1, backgroundColor: colors.backgroundSecondary, borderRadius: 12, padding: 16 }}>
                  <View style={{ width: '100%', height: 100, backgroundColor: colors.border, borderRadius: 8, marginBottom: 12 }} />
                  <View style={{ width: '80%', height: 16, backgroundColor: colors.border, borderRadius: 4, marginBottom: 8 }} />
                  <View style={{ width: '60%', height: 14, backgroundColor: colors.border, borderRadius: 4 }} />
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
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>😔</Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, textAlign: 'center', marginBottom: 8 }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>
            We couldn't load your activities. Please try again.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }}
            onPress={() => window.location.reload()}
          >
            <Text style={{ color: colors.textInverse, fontSize: 16, fontWeight: '600' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Handle empty activities state
  if (!isLoading && (!activities || activities.length === 0)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
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

  const handleNavigateToBible = (scriptureRef) => {
    console.log('📖 Navigating to Bible with scripture:', scriptureRef);
    // Close the modal
    setShowRealStuffModal(false);
    setSelectedRealStuffCard(null);
    // Switch to Bible tab
    setActiveTab('Bible');
    // Set the scripture reference to navigate to
    setBibleScriptureRef(scriptureRef);

    // Clear the scripture reference after a delay to allow Bible navigation to complete
    setTimeout(() => {
      setBibleScriptureRef(null);
    }, 2000);
  };

  const handleViewJournal = (journal) => {
    console.log('📖 Viewing journal from HomeScreen:', journal.title);
    // Close the modal
    setShowRealStuffModal(false);
    setSelectedRealStuffCard(null);
    // Switch to Study tab
    setActiveTab('Study');
    // Set the journal to navigate to
    setJournalToView(journal);
  };

  const handleSaveJournal = async (journalEntry, isNewReflection = false) => {
    console.log('💾 Saving journal entry from HomeScreen', isNewReflection ? '(new reflection)' : '(new journal)');
    const result = await saveJournalEntry(journalEntry, isNewReflection);
    if (result.success) {
      console.log('✅ Journal saved successfully');
      // Trigger Study screen refresh
      setStudyRefreshKey(prev => prev + 1);
    } else {
      console.error('❌ Failed to save journal:', result.error);
    }
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
      <View style={{ marginTop: 32 }}>
        <DailyVerse />
      </View>

      {/* Daily Progress */}
      <View style={{ marginTop: 120 }}>§
        <DailyProgressRow
          activities={activities}
          onActivitySelect={handleActivitySelect}
          onViewAll={() => setShowDailyProgress(true)}
          getCurrentProgress={getCurrentProgress}
        />
      </View>

      {/* The Real Stuff */}
      <View style={{ marginTop: 85 }}>
        <RealStuffSection
          cards={realStuffCards}
          onCardPress={handleRealStuffCardPress}
        />
      </View>

      {/* This Can't Be Just Me */}
      <View style={{ marginTop: 85, marginBottom: 40 }}>
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
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style="dark" />
        <AppHeader navigation={navigation} />
        <TopTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          voiceChatActive={voiceChat.isConnected}
        />

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
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                alwaysBounceVertical
              >
                {/* Daily Verse */}
                <View style={{ marginTop: 32 }}>
                  <DailyVerse />
                </View>

                {/* Daily Progress */}
                <View style={{ marginTop: 64 }}>
                  <DailyProgressRow
                    activities={activities}
                    onViewAll={() => setShowDailyProgress(true)}
                    onActivitySelect={handleActivitySelect}
                    getCurrentProgress={getCurrentProgress}
                  />
                </View>

                {/* Real Stuff Section */}
                <View style={{ marginTop: 56 }}>
                  <RealStuffSection
                    cards={realStuffCards}
                    onCardPress={handleRealStuffCardPress}
                  />
                </View>

                {/* Stories Section */}
                <View style={{ marginTop: 56 }}>
                  <StoriesSection
                    stories={thisCantBeJustMe}
                    navigation={navigation}
                    onStoryPress={(story) => {
                      navigation.navigate('StoryDetail', { storyId: story.id });
                    }}
                  />
                </View>
              </ScrollView>
            )}
          </>
        )}

        {/* Full-screen components */}
        {activeTab === 'Bible' && (
          <BibleScreen
            navigation={navigation}
            route={{ params: { scriptureRef: bibleScriptureRef } }}
          />
        )}

        {activeTab === 'Study' && (
          <StudyNavigator
            key={studyRefreshKey}
            journalToView={journalToView}
            onJournalViewed={() => setJournalToView(null)}
          />
        )}

        {activeTab === 'Chat' && (
          <ChatScreen
            navigation={navigation}
            onTabChange={setActiveTab}
            voiceChat={voiceChat}
          />
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
          onNavigateToBible={handleNavigateToBible}
          onSaveJournal={handleSaveJournal}
          onViewJournal={handleViewJournal}
          onShare={() => { }}
          onSave={() => { }}
          onCTA={() => { }}
        />
      </View>
    </ErrorBoundary>
  );
}