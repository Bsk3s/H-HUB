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

// Import top navigation (now the main navigation)
import TopTabBar from './components/navigation/TopTabBar';

// 🎯 MAIN APP - Top Navigation Central Hub
function App() {
  const [activeTab, setActiveTab] = React.useState('Home');

  // Validate critical features on startup
  React.useEffect(() => {
    validateCriticalFeatures();
  }, []);

  // Central navigation orchestrator
  const renderScreen = () => {
    switch (activeTab) {
      case 'Chat':
        return <ChatScreen />;
      case 'Home':
        return <HomeScreen />;
      case 'Bible':
        return <BibleScreen />;
      case 'Study':
        return <StudyScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          {/* App Header - consistent across all screens */}
          <AppHeader />
          
          {/* Central Navigation Hub - Top Tabs */}
          <TopTabBar activeTab={activeTab} onTabChange={setActiveTab} />
          
          {/* Main Content Area - Controlled by Top Navigation */}
          <View style={{ flex: 1 }}>
            {renderScreen()}
          </View>
          

        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;