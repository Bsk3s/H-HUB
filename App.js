import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import feature flags system
import { FEATURES, isFeatureEnabled, validateCriticalFeatures } from './config/features';

// Import AppHeader 
import AppHeader from './app/components/layout/AppHeader';

// Import all existing screens
import HomeScreen from './screens/HomeScreen';
import BibleScreen from './screens/BibleScreen';
import ChatScreen from './screens/ChatScreen';
import StudyScreen from './screens/StudyScreen';

// Import story screens
import StoriesScreen from './screens/StoriesScreen';
import StoryDetailScreen from './screens/StoryDetailScreen';

// Import top navigation (now the main navigation)
import TopTabBar from './components/navigation/TopTabBar';

// 🎯 MAIN APP - Top Navigation Central Hub
function App() {
  const [activeTab, setActiveTab] = React.useState('Home');
  const [currentScreen, setCurrentScreen] = React.useState('Home');
  const [screenParams, setScreenParams] = React.useState({});

  // Validate critical features on startup
  React.useEffect(() => {
    validateCriticalFeatures();
  }, []);

  // Navigation functions
  const navigate = (screenName, params = {}) => {
    console.log(`🧭 Navigation: ${currentScreen} → ${screenName}`, params);
    setCurrentScreen(screenName);
    setScreenParams(params);
    
    // Update activeTab to match navigation for visual feedback
    if (['Home', 'Chat', 'Bible', 'Study'].includes(screenName)) {
      setActiveTab(screenName);
      console.log(`🎯 Tab updated: ${activeTab} → ${screenName}`);
    }
  };

  const goBack = () => {
    setCurrentScreen(activeTab); // Go back to current tab
    setScreenParams({});
  };

  // Navigation object for screens
  const navigation = {
    navigate,
    goBack,
  };

  // Central navigation orchestrator
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Chat':
        return <ChatScreen navigation={navigation} />;
      case 'Home':
        return <HomeScreen navigation={navigation} />;
      case 'Bible':
        return <BibleScreen navigation={navigation} route={{ params: screenParams }} />;
      case 'Study':
        return <StudyScreen navigation={navigation} route={{ params: screenParams }} />;
      case 'Stories':
        return <StoriesScreen navigation={navigation} />;
      case 'StoryDetail':
        return <StoryDetailScreen navigation={navigation} route={{ params: screenParams }} />;
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  // Handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentScreen(tab);
    setScreenParams({});
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          {/* App Header - consistent across all screens */}
          {(currentScreen === 'Home' || currentScreen === 'Chat' || currentScreen === 'Bible' || currentScreen === 'Study') && <AppHeader />}
          
          {/* Central Navigation Hub - Top Tabs (only show on main screens) */}
          {(currentScreen === 'Home' || currentScreen === 'Chat' || currentScreen === 'Bible' || currentScreen === 'Study') && (
            <TopTabBar activeTab={activeTab} onTabChange={handleTabChange} />
          )}
          
          {/* Main Content Area - Controlled by Navigation */}
          <View style={{ flex: 1 }}>
            {renderScreen()}
          </View>
          
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;